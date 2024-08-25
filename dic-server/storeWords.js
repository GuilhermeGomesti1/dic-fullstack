const axios = require("axios");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const FILE_URL = process.env.FILE_URL;
const MONGO_URI = process.env.MONGO_URI;

const wordSchema = new mongoose.Schema({
  word: String,
});

const Word = mongoose.model("Word", wordSchema, "dicWords");

async function downloadFile(url, outputPath) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

async function readFileContent(filePath) {
  try {
    return fs.promises.readFile(filePath, "utf8");
  } catch (error) {
    console.error("Error reading file:", error);
  }
}

async function saveWordsToMongo(words) {
  try {
    await mongoose.connect(MONGO_URI);
    const wordDocuments = words.map((word) => ({ word }));
    await Word.insertMany(wordDocuments);
    console.log("Words saved to MongoDB successfully!");
  } catch (error) {
    console.error("Error saving words to MongoDB:", error);
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  try {
    const tempFilePath = path.join(__dirname, "downloadedWords.txt");
    console.log("Starting download...");
    await downloadFile(FILE_URL, tempFilePath);
    console.log("Download complete.");

    console.log("Reading file content...");
    const fileContent = await readFileContent(tempFilePath);
    const words = fileContent.split("\n").filter(Boolean);

    console.log("Saving words to MongoDB...");
    await saveWordsToMongo(words);

    fs.unlinkSync(tempFilePath);
    console.log("Temporary file removed.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
