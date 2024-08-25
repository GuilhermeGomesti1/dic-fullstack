const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const wordSchema = new mongoose.Schema({
  word: String,
});

const Word = mongoose.model("Word", wordSchema, "dicWords");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorites: [{ type: String }],
  history: [{ type: String }],
});

const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

app.get("/user/me", authenticateToken, (req, res) => {
  res.json({ name: "User 1", email: "example@email.com" });
});

app.get("/entries/en", async (req, res) => {
  const { page = 1, limit = 20, search = "", startLetter = "" } = req.query;

  try {
    const filter = {
      word: {
        $regex: `^${search}\\b`,
        $options: "i",
      },
    };

    if (startLetter) {
      filter.word.$regex = `^${startLetter}`;
    }

    const words = await Word.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();

    const totalDocs = await Word.countDocuments(filter);

    res.json({
      results: words.map((word) => word.word),
      totalDocs,
      page: parseInt(page),
      totalPages: Math.ceil(totalDocs / limit),
      hasNext: parseInt(page) * limit < totalDocs,
      hasPrev: parseInt(page) > 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching words", error });
  }
});

app.get("/entries/en/:word", async (req, res) => {
  try {
    const word = await Word.findOne({ word: req.params.word }).exec();

    if (word) {
      const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`;
      const apiResponse = await axios.get(apiUrl);

      const phonetics = apiResponse.data[0].phonetics
        .filter((phonetic) => phonetic.audio)
        .map((phonetic) => ({
          text: phonetic.text,
          audio: phonetic.audio,
        }));

      const definitions = apiResponse.data[0].meanings
        .flatMap((meaning) => meaning.definitions)
        .map((definition) => definition.definition);

      res.json({ word: word.word, phonetics, definitions });
    } else {
      res.status(404).json({ message: "Word not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching word", error });
  }
});

app.post("/entries/en/:word/favorite", authenticateToken, async (req, res) => {
  try {
    const { word } = req.params;
    const user = await User.findById(req.user.id);

    if (user.favorites.includes(word)) {
      return res.status(400).json({ message: "Word already in favorites" });
    }

    user.favorites.push(word);
    await user.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error adding word to favorites", error });
  }
});

app.delete(
  "/entries/en/:word/unfavorite",
  authenticateToken,
  async (req, res) => {
    try {
      const { word } = req.params;
      const user = await User.findById(req.user.id);

      user.favorites = user.favorites.filter((fav) => fav !== word);
      await user.save();
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error removing word from favorites", error });
    }
  }
);

app.post("/entries/en/:word/viewed", authenticateToken, async (req, res) => {
  try {
    const { word } = req.params;
    const user = await User.findById(req.user.id);

    if (!user.history.includes(word)) {
      user.history.push(word);
    }

    await user.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error adding word to history", error });
  }
});

app.get("/user/me/history", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      results: user.history.map((word) => ({ word, added: new Date() })),
      totalDocs: user.history.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
});

app.get("/user/me/favorites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      results: user.favorites.map((word) => ({ word, added: new Date() })),
      totalDocs: user.favorites.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
