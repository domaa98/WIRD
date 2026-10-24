import { SurahDetail, SurahMetadata, PageBoundary, JuzBoundary, QuranEditionInfo } from "./types";
import { SURAHS_METADATA, TOTAL_SURAHS, TOTAL_VERSES, TOTAL_PAGES, TOTAL_JUZ } from "./metadata";
import { JUZ_BOUNDARIES } from "./juz-data";
import editionJson from "./data/edition.json";
import pagesJson from "./data/pages.json";

// Edition information
export const QURAN_EDITION: QuranEditionInfo = editionJson as QuranEditionInfo;

// Preloaded page boundaries
export const PAGE_BOUNDARIES: PageBoundary[] = pagesJson as PageBoundary[];

/**
 * Normalizes Arabic text for diacritic-insensitive search.
 * IMPORTANT: This is ONLY used for generating temporary search keys.
 * Original Quran text is NEVER modified or altered for display.
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return "";
  return text
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    // Normalize Alefs
    .replace(/[إأآآ]/g, "ا")
    // Normalize Teh Marbuta
    .replace(/ة/g, "ه")
    // Normalize Yeh
    .replace(/ى/g, "ي")
    .trim()
    .toLowerCase();
}

/**
 * Loads a single surah detail by its 1-based number
 */
export async function getSurahDetail(surahNumber: number): Promise<SurahDetail | null> {
  if (surahNumber < 1 || surahNumber > TOTAL_SURAHS) return null;
  try {
    const data = await import(`./data/surahs/${surahNumber}.json`);
    return data.default as SurahDetail;
  } catch (err) {
    console.error(`Error loading Surah ${surahNumber}:`, err);
    return null;
  }
}

/**
 * Gets surah metadata list
 */
export function getAllSurahsMetadata(): readonly SurahMetadata[] {
  return SURAHS_METADATA;
}

/**
 * Searches surahs by number, Arabic name, or English name
 */
export function searchSurahs(query: string): SurahMetadata[] {
  const q = query.trim();
  if (!q) return [...SURAHS_METADATA];

  const num = parseInt(q, 10);
  if (!isNaN(num) && num >= 1 && num <= TOTAL_SURAHS) {
    const s = SURAHS_METADATA[num - 1];
    return s ? [s] : [];
  }

  const normalizedQuery = normalizeArabicForSearch(q);

  return SURAHS_METADATA.filter((s) => {
    const normArabic = normalizeArabicForSearch(s.name);
    const engLower = s.englishName.toLowerCase();
    const transLower = s.englishNameTranslation.toLowerCase();
    return (
      normArabic.includes(normalizedQuery) ||
      engLower.includes(q.toLowerCase()) ||
      transLower.includes(q.toLowerCase())
    );
  });
}

/**
 * Gets page boundary information for a given page number (1..604)
 */
export function getPageBoundary(pageNumber: number): PageBoundary | undefined {
  if (pageNumber < 1 || pageNumber > TOTAL_PAGES) return undefined;
  return PAGE_BOUNDARIES[pageNumber - 1];
}

/**
 * Gets juz boundary information for a given juz number (1..30)
 */
export function getJuzBoundary(juzNumber: number): JuzBoundary | undefined {
  if (juzNumber < 1 || juzNumber > TOTAL_JUZ) return undefined;
  return JUZ_BOUNDARIES[juzNumber - 1];
}
