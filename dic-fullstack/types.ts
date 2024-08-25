export interface WordsData {
  words: string[];
  results: string[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Phonetic {
  text: string;
  audio: string;
}

export interface PhoneticsData {
  word: string;
  phonetics: Phonetic[];
  definitions: string[];
}

export interface UserWord {
  word: string;
  added: string;
}
