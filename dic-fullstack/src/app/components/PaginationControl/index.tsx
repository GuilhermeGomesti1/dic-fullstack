import React from "react";
import LeftIcon from "../Icons/LeftIcon";
import RightIcon from "../Icons/RightIcon";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  viewMode: "all" | "favorites" | "viewed";
  onViewModeChange: (mode: "all" | "favorites" | "viewed") => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  hasNext,
  onPageChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* View mode buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded flex-1 ${
            viewMode === "all" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => onViewModeChange("all")}
        >
          World list
        </button>
        <button
          className={`px-4 py-2 rounded flex-1 ${
            viewMode === "favorites"
              ? "bg-yellow-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => onViewModeChange("favorites")}
        >
          Favorites
        </button>
        <button
          className={`px-4 py-2 rounded flex-1 ${
            viewMode === "viewed" ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => onViewModeChange("viewed")}
        >
          History
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`p-2 rounded ${
            currentPage > 1
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <LeftIcon />
        </button>

        <div className="text-gray-700">
          Page {currentPage} of {totalPages}
        </div>

        <button
          disabled={!hasNext && currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`p-2 rounded ${
            hasNext || currentPage < totalPages
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <RightIcon />
        </button>
      </div>
    </div>
  );
};

export default PaginationControl;
