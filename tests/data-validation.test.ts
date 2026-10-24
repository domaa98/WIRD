import { describe, it, expect } from "vitest";
import { SURAHS_METADATA, TOTAL_SURAHS, TOTAL_VERSES, TOTAL_PAGES, TOTAL_JUZ } from "../src/lib/quran/metadata";
import { JUZ_BOUNDARIES } from "../src/lib/quran/juz-data";
import { PAGE_BOUNDARIES, getSurahDetail, QURAN_EDITION } from "../src/lib/quran/source";
import { validateSurah } from "../src/lib/quran/validation";

describe("Quran Data Integrity & Provenance", () => {
  it("has exactly 114 surahs in canonical order", () => {
    expect(SURAHS_METADATA.length).toBe(TOTAL_SURAHS);
    for (let i = 0; i < SURAHS_METADATA.length; i++) {
      expect(SURAHS_METADATA[i].number).toBe(i + 1);
      expect(SURAHS_METADATA[i].name).toBeTruthy();
      expect(SURAHS_METADATA[i].numberOfAyahs).toBeGreaterThan(0);
    }
  });

  it("has exactly 6,236 total verses across all surahs (Kufan convention)", () => {
    const sum = SURAHS_METADATA.reduce((acc, s) => acc + s.numberOfAyahs, 0);
    expect(sum).toBe(TOTAL_VERSES);
  });

  it("has exactly 30 canonical Juz boundaries", () => {
    expect(JUZ_BOUNDARIES.length).toBe(TOTAL_JUZ);
    expect(JUZ_BOUNDARIES[0].startSurah).toBe(1);
    expect(JUZ_BOUNDARIES[0].startVerse).toBe(1);
    expect(JUZ_BOUNDARIES[29].endSurah).toBe(114);
    expect(JUZ_BOUNDARIES[29].endVerse).toBe(6);
  });

  it("has exactly 604 Medina Mushaf pages", () => {
    expect(PAGE_BOUNDARIES.length).toBe(TOTAL_PAGES);
    expect(PAGE_BOUNDARIES[0].page).toBe(1);
    expect(PAGE_BOUNDARIES[603].page).toBe(604);
  });

  it("identifies valid Tanzil dataset edition metadata and CC license", () => {
    expect(QURAN_EDITION.convention).toBe("Kufan (6,236 verses)");
    expect(QURAN_EDITION.provenance).toContain("Tanzil");
    expect(QURAN_EDITION.license).toContain("Creative Commons");
  });

  it("validates Surah 1 (Al-Faatiha) file structure and verses", async () => {
    const surah1 = await getSurahDetail(1);
    expect(surah1).not.toBeNull();
    expect(surah1!.verses.length).toBe(7);
    const val = validateSurah(surah1!);
    expect(val.isValid).toBe(true);
    expect(val.errors.length).toBe(0);
  });

  it("validates Surah 114 (An-Naas) file structure and verses", async () => {
    const surah114 = await getSurahDetail(114);
    expect(surah114).not.toBeNull();
    expect(surah114!.verses.length).toBe(6);
    const val = validateSurah(surah114!);
    expect(val.isValid).toBe(true);
    expect(val.errors.length).toBe(0);
  });
});
