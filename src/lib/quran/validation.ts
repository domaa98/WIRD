import { SurahDetail, Verse } from "./types";
import { TOTAL_SURAHS, TOTAL_VERSES, SURAHS_METADATA } from "./metadata";

export interface QuranValidationReport {
  isValid: boolean;
  surahCount: number;
  totalVerses: number;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a single surah detail object
 */
export function validateSurah(surah: SurahDetail): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!surah) {
    return { isValid: false, errors: ["بيانات السورة فارغة أو غير معرّفة"] };
  }

  if (surah.number < 1 || surah.number > TOTAL_SURAHS) {
    errors.push(`رقم السورة غير صالح: ${surah.number}`);
  }

  const meta = SURAHS_METADATA[surah.number - 1];
  if (meta && meta.numberOfAyahs !== surah.verses.length) {
    errors.push(
      `عدد آيات سورة ${surah.name} غير مطابق: متوقع ${meta.numberOfAyahs}، المعثور عليه ${surah.verses.length}`
    );
  }

  const seenNumbers = new Set<number>();
  for (let i = 0; i < surah.verses.length; i++) {
    const verse = surah.verses[i];
    const expectedNum = i + 1;

    if (verse.verseNumber !== expectedNum) {
      errors.push(
        `تسلسل الآيات غير منتظم في سورة ${surah.number}: متوقع ${expectedNum}، وجد ${verse.verseNumber}`
      );
    }

    if (seenNumbers.has(verse.verseNumber)) {
      errors.push(`تكرار في رقم الآية ${verse.verseNumber} بسورة ${surah.number}`);
    }
    seenNumbers.add(verse.verseNumber);

    if (!verse.text || verse.text.trim().length === 0) {
      errors.push(`نص الآية ${surah.number}:${verse.verseNumber} فارغ`);
    }

    if (verse.page < 1 || verse.page > 604) {
      errors.push(`رقم الصفحة غير صحيح للآية ${surah.number}:${verse.verseNumber}: ${verse.page}`);
    }

    if (verse.juz < 1 || verse.juz > 30) {
      errors.push(`رقم الجزء غير صحيح للآية ${surah.number}:${verse.verseNumber}: ${verse.juz}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire collection of surahs
 */
export function validateFullQuran(surahs: SurahDetail[]): QuranValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (surahs.length !== TOTAL_SURAHS) {
    errors.push(`عدد السور غير مكتمل: وجد ${surahs.length} سورة من أصل ${TOTAL_SURAHS}`);
  }

  let totalVerseCount = 0;
  const globalVerseIds = new Set<number>();

  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    if (s.number !== i + 1) {
      errors.push(`ترتيب السور غير صحيح: الموضع ${i + 1} يحتوي على السورة رقم ${s.number}`);
    }

    const surahRes = validateSurah(s);
    if (!surahRes.isValid) {
      errors.push(...surahRes.errors);
    }

    for (const v of s.verses) {
      totalVerseCount++;
      if (globalVerseIds.has(v.id)) {
        errors.push(`معرف الآية العام مكرر: ${v.id}`);
      }
      globalVerseIds.add(v.id);
    }
  }

  if (totalVerseCount !== TOTAL_VERSES) {
    errors.push(`إجمالي عدد الآيات (${totalVerseCount}) لا يطابق مصحف المدينة وفق الرسم العثماني (${TOTAL_VERSES})`);
  }

  return {
    isValid: errors.length === 0,
    surahCount: surahs.length,
    totalVerses: totalVerseCount,
    errors,
    warnings,
  };
}
