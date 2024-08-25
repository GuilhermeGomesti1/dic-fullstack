import React from "react";

interface AlphabetMenuProps {
  startLetter: string;
  onFilterByLetter: (letter: string) => void;
  isMobile: boolean;
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const AlphabetMenu: React.FC<AlphabetMenuProps> = ({
  startLetter,
  onFilterByLetter,
  isMobile,
}) => {
  return isMobile ? (
    <select
      value={startLetter}
      onChange={(e) => onFilterByLetter(e.target.value)}
      className="p-2 border border-gray-300 rounded"
    >
      <option value="">Select a letter</option>
      {alphabet.map((letter) => (
        <option key={letter} value={letter}>
          {letter}
        </option>
      ))}
    </select>
  ) : (
    <div className="flex flex-wrap gap-2">
      {alphabet.map((letter) => (
        <button
          key={letter}
          className={`px-2 py-1 rounded ${
            startLetter === letter ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => onFilterByLetter(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetMenu;
