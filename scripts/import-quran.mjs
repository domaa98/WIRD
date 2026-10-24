import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../src/lib/quran/data");
const SURAHS_DIR = path.join(DATA_DIR, "surahs");

async function main() {
  console.log("Fetching canonical Tanzil Quran dataset...");
  const res = await fetch("https://api.alquran.cloud/v1/quran/quran-uthmani");
  if (!res.ok) {
    throw new Error(`Failed to fetch Quran data: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const data = json.data;

  // Validation
  if (!data || !Array.isArray(data.surahs)) {
    throw new Error("Invalid response format: 'surahs' array missing.");
  }
  if (data.surahs.length !== 114) {
    throw new Error(`Expected 114 surahs, found ${data.surahs.length}`);
  }

  let totalAyahs = 0;
  const pageMap = new Map(); // page -> { page, startSurah, startVerse, endSurah, endVerse, juz }

  // Ensure directories exist
  fs.mkdirSync(SURAHS_DIR, { recursive: true });

  for (let sIdx = 0; sIdx < data.surahs.length; sIdx++) {
    const s = data.surahs[sIdx];
    const expectedSurahNumber = sIdx + 1;
    if (s.number !== expectedSurahNumber) {
      throw new Error(`Surah ordering mismatch: expected ${expectedSurahNumber}, got ${s.number}`);
    }

    if (!Array.isArray(s.ayahs) || s.ayahs.length === 0) {
      throw new Error(`Surah ${s.number} has no ayahs.`);
    }

    const cleanVerses = [];
    for (let aIdx = 0; aIdx < s.ayahs.length; aIdx++) {
      const a = s.ayahs[aIdx];
      const expectedVerseNumber = aIdx + 1;
      if (a.numberInSurah !== expectedVerseNumber) {
        throw new Error(`Verse sequence mismatch in Surah ${s.number}: expected ${expectedVerseNumber}, got ${a.numberInSurah}`);
      }

      if (!a.text || a.text.trim().length === 0) {
        throw new Error(`Empty verse text in Surah ${s.number}:${a.numberInSurah}`);
      }

      const verseItem = {
        id: a.number, // Global 1..6236
        surah: s.number,
        verseNumber: a.numberInSurah,
        text: a.text.trim(),
        page: a.page,
        juz: a.juz,
        hizbQuarter: a.hizbQuarter,
        sajda: typeof a.sajda === "boolean" ? a.sajda : !!(a.sajda && a.sajda.recommended),
      };

      cleanVerses.push(verseItem);
      totalAyahs++;

      // Track page boundaries
      const p = a.page;
      if (!pageMap.has(p)) {
        pageMap.set(p, {
          page: p,
          startSurah: s.number,
          startVerse: a.numberInSurah,
          endSurah: s.number,
          endVerse: a.numberInSurah,
          juz: a.juz,
        });
      } else {
        const entry = pageMap.get(p);
        entry.endSurah = s.number;
        entry.endVerse = a.numberInSurah;
      }
    }

    const surahPayload = {
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      numberOfAyahs: s.ayahs.length,
      revelationType: s.revelationType,
      verses: cleanVerses,
    };

    fs.writeFileSync(
      path.join(SURAHS_DIR, `${s.number}.json`),
      JSON.stringify(surahPayload, null, 2),
      "utf8"
    );
  }

  if (totalAyahs !== 6236) {
    throw new Error(`Total ayah count mismatch: expected 6236, got ${totalAyahs}`);
  }

  // Write page boundaries
  const pagesList = Array.from(pageMap.values()).sort((a, b) => a.page - b.page);
  fs.writeFileSync(
    path.join(DATA_DIR, "pages.json"),
    JSON.stringify(pagesList, null, 2),
    "utf8"
  );

  // Write edition metadata
  const editionInfo = {
    identifier: "quran-uthmani",
    name: "القرآن الكريم برسم العثماني",
    englishName: "Uthmani Script (Medina Mushaf)",
    format: "text",
    type: "quran",
    direction: "rtl",
    convention: "Kufan (6,236 verses)",
    provenance: "Tanzil Project (tanzil.net) - Verified Scholarly Authentic Quran Text",
    license: "Creative Commons Attribution 3.0 Unported (CC BY 3.0)",
    totalSurahs: 114,
    totalVerses: 6236,
    totalPages: pagesList.length,
    importedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(DATA_DIR, "edition.json"),
    JSON.stringify(editionInfo, null, 2),
    "utf8"
  );

  console.log(`Successfully verified and imported:
  - 114 Surahs
  - 6,236 Verses
  - ${pagesList.length} Pages
  - Saved to ${DATA_DIR}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
