"use client";

import React from "react";
import axios from "axios";

interface ToggleFavoriteProps {
  word: string;
  isFavorite: boolean;
  onToggle: (word: string) => void;
}

const ToggleFavorite: React.FC<ToggleFavoriteProps> = ({
  word,
  isFavorite,
  onToggle,
}) => {
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite) {
        await axios.delete(
          `http://localhost:5000/entries/en/${word}/unfavorite`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        await axios.post(
          `http://localhost:5000/entries/en/${word}/favorite`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      onToggle(word);
    } catch (error) {
      console.error("Error updating favorites", error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`ml-2 ${isFavorite ? "text-yellow-500" : "text-gray-500"}`}
    >
      {isFavorite ? (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 17.27l-6.18 3.73 1.64-7.03L2 10.24l7.19-.61L12 3l2.81 6.63L22 10.24l-5.46 3.73 1.64 7.03L12 17.27z" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 17.27l-6.18 3.73 1.64-7.03L2 10.24l7.19-.61L12 3l2.81 6.63L22 10.24l-5.46 3.73 1.64 7.03L12 17.27z"
          />
        </svg>
      )}
    </button>
  );
};

export default ToggleFavorite;
