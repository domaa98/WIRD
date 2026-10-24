export type RevelationType = "Meccan" | "Medinan";

export interface SurahMetadata {
  number: number;
  name: string; // Arabic name e.g. "الفاتحة"
  englishName: string; // Transliteration e.g. "Al-Faatiha"
  englishNameTranslation: string; // Translation e.g. "The Opening"
  numberOfAyahs: number;
  revelationType: RevelationType;
  startPage: number;
  startJuz: number;
}

export interface VerseIdentifier {
  surah: number;
  verse: number;
}

export interface Verse {
  id: number; // Global canonical verse index 1..6236
  surah: number;
  verseNumber: number;
  text: string; // Arabic Uthmani / canonical text
  page: number; // 1..604
  juz: number; // 1..30
  hizbQuarter?: number; // 1..240
  sajda?: boolean;
}

export interface SurahDetail extends SurahMetadata {
  verses: Verse[];
  bismillahPre?: boolean;
}

export interface JuzBoundary {
  juz: number;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
  arabicName: string;
}

export interface PageBoundary {
  page: number;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
  juz: number;
}

export interface QuranEditionInfo {
  identifier: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: "rtl";
  convention: "Kufan (6,236 verses)";
  provenance: string;
  license: string;
}
