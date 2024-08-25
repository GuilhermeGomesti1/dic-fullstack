"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchWords,
  fetchPhonetics,
  fetchFavorites,
  fetchViewed,
} from "../services/api";
import Modal from "react-modal";
import { PhoneticsData, WordsData } from "../../../types";
import ToggleFavorite from "../components/ToglleFavorite";
import MarkAsViewed from "../components/MarkAsViwed";
import AlphabetMenu from "../components/AlphabetMenu";
import SearchBar from "../components/SearchBar";
import CloseIcon from "../components/Icons/CloseIcon";
import LeftIcon from "../components/Icons/LeftIcon";
import RightIcon from "../components/Icons/RightIcon";

export default function DashBoard() {
  const [page, setPage] = useState(1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startLetter, setStartLetter] = useState("");
  const [previousPage, setPreviousPage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);
  const [showBackButton, setShowBackButton] = useState(false);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [viewedPage, setViewedPage] = useState(1);
  const [viewMode, setViewMode] = useState<"all" | "favorites" | "viewed">(
    "all"
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    data: wordsData,
    isLoading: wordsLoading,
    error,
    refetch,
  } = useQuery<WordsData>({
    queryKey: ["words", page, searchQuery, startLetter],
    queryFn: () => fetchWords(page, searchQuery, startLetter),
    enabled: viewMode === "all",
  });

  const { data: phoneticsData, error: phoneticsError } =
    useQuery<PhoneticsData>({
      queryKey: ["phonetics", selectedWord],
      queryFn: () =>
        selectedWord
          ? fetchPhonetics(selectedWord)
          : Promise.resolve({ word: "", phonetics: [], definitions: [] }),
      enabled: !!selectedWord,
    });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [favoritesData, viewedData] = await Promise.all([
          fetchFavorites(),
          fetchViewed(),
        ]);
        setFavorites(favoritesData);
        setViewed(viewedData);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedWord]);

  useEffect(() => {
    if (viewMode === "all") {
      refetch();
    }
  }, [searchQuery, page, startLetter, viewMode, refetch]);

  useEffect(() => {
    if (viewMode === "favorites" || viewMode === "viewed") {
      setPage(1);
    }
  }, [viewMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleBack = () => {
    if (previousPage !== null) {
      setPage(previousPage);
      setSearchTerm("");
      setSearchQuery("");
      setStartLetter("");
      setPreviousPage(null);
      setShowBackButton(false);
    }
  };

  const handleFilterByLetter = (letter: string) => {
    setStartLetter(letter);
    setSearchTerm("");
    setSearchQuery("");
    setPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setStartLetter("");
    setPage(1);
    setPreviousPage(page);
    setShowBackButton(true);
  };

  const currentPage =
    viewMode === "all"
      ? page
      : viewMode === "favorites"
      ? favoritesPage
      : viewedPage;
  const totalPages = wordsData?.totalPages ?? 1;
  const hasNext = wordsData?.hasNext ?? false;

  const setCurrentPage = (newPage: number) => {
    if (viewMode === "all") {
      setPage(newPage);
    } else if (viewMode === "favorites") {
      setFavoritesPage(newPage);
    } else if (viewMode === "viewed") {
      setViewedPage(newPage);
    }
  };

  const handleToggleFavorite = (word: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(word)
        ? prevFavorites.filter((w) => w !== word)
        : [...prevFavorites, word]
    );
  };

  const handleMarkAsViewed = (word: string) => {
    setViewed((prevViewed) =>
      prevViewed.includes(word) ? prevViewed : [...prevViewed, word]
    );
  };

  const openModal = (word: string) => {
    setSelectedWord(word);

    if (isMobile) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  const renderWords = (words: string[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
      {words.map((word, index) => (
        <div
          key={index}
          className="p-4 bg-gray-200 rounded-lg shadow hover:bg-gray-300 cursor-pointer"
          onClick={() => openModal(word)}
        >
          <div className="flex justify-between items-center">
            <span>{word}</span>
            <div className="flex items-center">
              <ToggleFavorite
                word={word}
                isFavorite={favorites.includes(word)}
                onToggle={handleToggleFavorite}
              />

              {selectedWord === word && (
                <MarkAsViewed word={word} onMarkAsViewed={handleMarkAsViewed} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleViewModeChange = (mode: "all" | "favorites" | "viewed") => {
    setViewMode(mode);
    if (mode === "all") {
      setPage(1);
    } else if (mode === "favorites") {
      setFavoritesPage(1);
    } else if (mode === "viewed") {
      setViewedPage(1);
    }
  };

  if (wordsLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  const displayWords =
    viewMode === "all"
      ? wordsData?.results || []
      : viewMode === "favorites"
      ? favorites.slice((favoritesPage - 1) * 20, favoritesPage * 20)
      : viewMode === "viewed"
      ? viewed.slice((viewedPage - 1) * 20, viewedPage * 20)
      : [];

  return (
    <div className="p-4 flex flex-col md:flex-row">
      <div className="bg-white p-4 rounded-lg shadow-lg hidden md:flex flex-col h-[calc(70vh-3rem)] w-full md:w-1/4 mt-16">
        <div className="bg-gray-200 p-4 rounded-lg flex flex-col justify-center items-center mb-4 h-[60%]">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {selectedWord ? selectedWord : "Selected Word"}
          </h2>
          {phoneticsError ? (
            <div className="text-center">
              Error fetching phonetics: {phoneticsError.message}
            </div>
          ) : phoneticsData && phoneticsData.phonetics.length > 0 ? (
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Phonetics
              </h3>
              {phoneticsData.phonetics.map((phonetic, index) => (
                <div key={index} className="mb-4 text-center">
                  <p className="text-lg">{phonetic.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No phonetics available</p>
          )}
        </div>

        <div className="bg-gray-100 p-1 rounded-lg  flex-shrink-0 h-[10%]">
          {phoneticsData && phoneticsData.phonetics.length > 0 ? (
            phoneticsData.phonetics.map(
              (phonetic, index) =>
                phonetic.audio && (
                  <div key={index} className="mb-4">
                    <audio
                      ref={audioRef}
                      controls
                      className="w-full rounded-md"
                    >
                      <source src={phonetic.audio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )
            )
          ) : (
            <p className="text-center">No audio available</p>
          )}
        </div>

        <div className="h-[40%] overflow-y-auto">
          <h3 className="text-lg font-semibold mt-4">Definition</h3>
          {phoneticsData && phoneticsData.definitions.length > 0 ? (
            <p>{phoneticsData.definitions[0]}</p>
          ) : (
            <p>No definitions available</p>
          )}
        </div>
      </div>

      <div className="md:w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:mb-4">
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-0 sm:mr-4 w-full">
            <button
              className={`px-4 py-2 rounded flex-1 ${
                viewMode === "all" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => handleViewModeChange("all")}
            >
              World list{" "}
            </button>
            <button
              className={`px-4 py-2 rounded flex-1 ${
                viewMode === "favorites"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => handleViewModeChange("favorites")}
            >
              Favorites
            </button>
            <button
              className={`px-4 py-2 rounded flex-1 ${
                viewMode === "viewed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => handleViewModeChange("viewed")}
            >
              History
            </button>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onSearchTermChange={(term) => setSearchTerm(term)}
            onSearch={handleSearch}
            showBackButton={showBackButton}
            onBack={handleBack}
          />
        </div>

        <div className="mb-4">
          <AlphabetMenu
            startLetter={startLetter}
            onFilterByLetter={handleFilterByLetter}
            isMobile={isMobile}
          />
        </div>

        {displayWords.length > 0 ? (
          <>
            {renderWords(displayWords)}
            <div className="flex justify-between mt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className={`p-2 rounded ${
                  currentPage > 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <LeftIcon />
              </button>

              <div className="text-gray-700">Page {currentPage}</div>

              <button
                disabled={!hasNext && currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`p-2 rounded ${
                  hasNext || currentPage < totalPages
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <RightIcon />
              </button>
            </div>
          </>
        ) : (
          <div>No words found.</div>
        )}
      </div>

      {isMobile && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Word Details"
          ariaHideApp={false}
          className="fixed inset-0 flex items-center justify-center p-4"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="relative bg-white rounded-lg shadow-lg p-4 h-full w-full max-w-screen-sm">
            <button
              onClick={closeModal}
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
            <div className="flex flex-col items-center text-center h-full w-full mt-8">
              <div className="w-full bg-gray-100 p-4 mb-4 rounded-lg flex flex-col items-center justify-center h-[40%]">
                <h2 className="text-3xl font-bold mb-2">{selectedWord}</h2>
                {phoneticsData && phoneticsData.phonetics.length > 0 ? (
                  <p className="text-xl font-semibold">
                    {phoneticsData.phonetics[0].text}
                  </p>
                ) : (
                  <p>No phonetics available</p>
                )}
              </div>
              <div className="w-full mb-4">
                {phoneticsData &&
                  phoneticsData.phonetics.length > 0 &&
                  phoneticsData.phonetics[0].audio && (
                    <audio ref={audioRef} controls className="w-full">
                      <source
                        src={phoneticsData.phonetics[0].audio}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio element.
                    </audio>
                  )}
              </div>
              <div className="w-full mb-4">
                <h3 className="text-lg font-semibold">Definition</h3>
                {phoneticsData && phoneticsData.definitions.length > 0 ? (
                  <p>{phoneticsData.definitions[0]}</p>
                ) : (
                  <p>No definitions available</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
