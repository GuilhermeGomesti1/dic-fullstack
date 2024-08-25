import React, { useCallback, useEffect } from "react";
import axios from "axios";

interface MarkAsViewedProps {
  word: string;
  onMarkAsViewed: (word: string) => void;
}

const MarkAsViewed: React.FC<MarkAsViewedProps> = ({
  word,
  onMarkAsViewed,
}) => {
  const handleMarkAsViewed = useCallback(async () => {
    try {
      await axios.post(
        `http://localhost:5000/entries/en/${word}/viewed`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onMarkAsViewed(word);
    } catch (error) {
      console.error("Error updating viewed words", error);
    }
  }, [word, onMarkAsViewed]);

  useEffect(() => {
    handleMarkAsViewed();
  }, [handleMarkAsViewed]);

  return null;
};

export default MarkAsViewed;
