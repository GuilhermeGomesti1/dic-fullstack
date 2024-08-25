// src/components/SearchBar.tsx
import React from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  showBackButton: boolean;
  onBack: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  showBackButton,
  onBack,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:ml-auto w-full">
      <div className="flex flex-row items-center w-full space-x-2">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border border-gray-300 rounded flex-1 w-full sm:max-w-xs"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded sm:w-24"
          onClick={onSearch}
        >
          Search
        </button>

        {showBackButton && (
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded sm:w-24"
            onClick={onBack}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
