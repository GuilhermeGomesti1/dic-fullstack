import axios from "axios";
import { PhoneticsData, WordsData } from "../../../types";

const apiBaseUrl = "http://localhost:5000";

export const fetchWords = async (
  page: number,
  search: string = "",
  startLetter: string = ""
): Promise<WordsData> => {
  const params: { [key: string]: any } = {
    page,
    limit: 20,
    search,
    startLetter,
  };
  const { data } = await axios.get(`${apiBaseUrl}/entries/en`, { params });
  return data;
};

export const fetchPhonetics = async (word: string): Promise<PhoneticsData> => {
  try {
    const { data } = await axios.get(`${apiBaseUrl}/entries/en/${word}`);
    return data;
  } catch (error) {
    console.error("Error fetching phonetics:", error);
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      return { word, phonetics: [], definitions: [] };
    }
    throw error;
  }
};

export const fetchFavorites = async () => {
  try {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${apiBaseUrl}/user/me/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return Array.isArray(data.results)
      ? data.results.map((item: { word: any }) => item.word)
      : [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

export const fetchViewed = async () => {
  try {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${apiBaseUrl}/user/me/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return Array.isArray(data.results)
      ? data.results.map((item: { word: any }) => item.word)
      : [];
  } catch (error) {
    console.error("Error fetching viewed history:", error);
    return [];
  }
};
