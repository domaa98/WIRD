import { SURAHS_METADATA, TOTAL_SURAHS, TOTAL_VERSES, TOTAL_PAGES, TOTAL_JUZ } from "../quran/metadata";
import { JUZ_BOUNDARIES } from "../quran/juz-data";
import { PAGE_BOUNDARIES } from "../quran/source";
import {
  PlanUnit,
  VerseRef,
  DailyAssignment,
  ReadingSession,
  KhatmahPlan,
  PlanGenerationParams,
  PlanProgressSummary,
} from "./types";

// Precompute surah start offsets (1-indexed)
// surahVerseOffsets[s] = starting global index of Surah s (for s in 1..114)
const surahVerseOffsets: number[] = new Array(TOTAL_SURAHS + 2).fill(0);
let runningOffset = 1;
for (let s = 1; s <= TOTAL_SURAHS; s++) {
  surahVerseOffsets[s] = runningOffset;
  runningOffset += SURAHS_METADATA[s - 1].numberOfAyahs;
}
surahVerseOffsets[TOTAL_SURAHS + 1] = runningOffset; // 6237

/**
 * Converts a Surah and Verse number to a canonical global verse index (1..6236).
 */
export function verseToGlobalIndex(surah: number, verse: number): number {
  if (surah < 1 || surah > TOTAL_SURAHS) {
    throw new Error(`رقم السورة غير صالح: ${surah}`);
  }
  const meta = SURAHS_METADATA[surah - 1];
  if (verse < 1 || verse > meta.numberOfAyahs) {
    throw new Error(`رقم الآية غير صالح: ${verse} في سورة ${meta.name} (عدد آياتها ${meta.numberOfAyahs})`);
  }
  return surahVerseOffsets[surah] + (verse - 1);
}

/**
 * Converts a canonical global verse index (1..6236) to a { surah, verse } reference.
 */
export function globalIndexToVerse(globalIndex: number): VerseRef {
  if (globalIndex < 1 || globalIndex > TOTAL_VERSES) {
    throw new Error(`معرّف الآية العام غير صالح: ${globalIndex}. يجب أن يكون بين 1 و ${TOTAL_VERSES}`);
  }

  // Binary search surah
  let low = 1;
  let high = TOTAL_SURAHS;
  let foundSurah = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const startOfMid = surahVerseOffsets[mid];
    const endOfMid = surahVerseOffsets[mid + 1] - 1;

    if (globalIndex >= startOfMid && globalIndex <= endOfMid) {
      foundSurah = mid;
      break;
    } else if (globalIndex < startOfMid) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  const verseNumber = globalIndex - surahVerseOffsets[foundSurah] + 1;
  return {
    surah: foundSurah,
    verse: verseNumber,
  };
}

/**
 * Distributes totalCount integer units into partitionCount non-empty integer buckets as evenly as possible.
 * Guarantees that sum(buckets) === totalCount, and every bucket >= 1 (if totalCount >= partitionCount).
 */
export function distributeIntegerUnits(totalCount: number, partitionCount: number): number[] {
  if (partitionCount <= 0) throw new Error("عدد الأيام أو الجلسات يجب أن يكون أكبر من 0");
  if (totalCount <= 0) return new Array(partitionCount).fill(0);

  const base = Math.floor(totalCount / partitionCount);
  const remainder = totalCount % partitionCount;
  const result: number[] = new Array(partitionCount);

  for (let i = 0; i < partitionCount; i++) {
    result[i] = i < remainder ? base + 1 : base;
  }
  return result;
}

/**
 * Date arithmetic helper using UTC to prevent DST or timezone shift errors.
 */
export function addDaysToDateString(startDateStr: string, daysToAdd: number): string {
  const parts = startDateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    throw new Error(`صيغة التاريخ غير صالحة: ${startDateStr}`);
  }
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const PRAYER_NAMES = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];

/**
 * Generates reading sessions for a single daily assignment.
 */
function generateSessions(
  startGlobal: number,
  endGlobal: number,
  sessionCount: number,
  namingType: "prayers" | "numbers"
): ReadingSession[] {
  if (sessionCount <= 1) return [];

  const totalVerses = endGlobal - startGlobal + 1;
  const sessionAllocations = distributeIntegerUnits(totalVerses, sessionCount);
  const sessions: ReadingSession[] = [];

  let currentStart = startGlobal;
  for (let i = 0; i < sessionCount; i++) {
    const count = sessionAllocations[i];
    const currentEnd = currentStart + count - 1;

    let sessionName = `الجلسة ${i + 1}`;
    if (namingType === "prayers") {
      sessionName = i < PRAYER_NAMES.length ? PRAYER_NAMES[i] : `الجلسة ${i + 1}`;
    }

    sessions.push({
      id: `session-${i + 1}`,
      name: sessionName,
      start: globalIndexToVerse(currentStart),
      end: globalIndexToVerse(currentEnd),
      count,
      isCompleted: false,
    });

    currentStart = currentEnd + 1;
  }

  return sessions;
}

/**
 * Generates a full Khatmah Plan
 */
export function generateKhatmahPlan(params: PlanGenerationParams): KhatmahPlan {
  const {
    unit,
    targetDays,
    startDate,
    sessionsPerDay = 1,
    sessionNamingType = "prayers",
    startPosition = { surah: 1, verse: 1 },
    endPosition = { surah: 114, verse: 6 },
  } = params;

  if (targetDays < 1 || targetDays > 3650) {
    throw new Error("مدة الختمة يجب أن تكون بين يوم واحد و 3650 يوماً");
  }

  const startGlobal = verseToGlobalIndex(startPosition.surah, startPosition.verse);
  const endGlobal = verseToGlobalIndex(endPosition.surah, endPosition.verse);

  if (startGlobal > endGlobal) {
    throw new Error("موضع بداية القراءة يجب أن يسبق موضع النهاية");
  }

  const assignments: DailyAssignment[] = [];

  if (unit === "verses") {
    const totalVerses = endGlobal - startGlobal + 1;
    const allocations = distributeIntegerUnits(totalVerses, targetDays);

    let currStartGlobal = startGlobal;
    let runningCumulative = 0;

    for (let day = 1; day <= targetDays; day++) {
      const count = allocations[day - 1];
      const currEndGlobal = currStartGlobal + count - 1;
      runningCumulative += count;
      const dateStr = addDaysToDateString(startDate, day - 1);

      const dayStartVerse = globalIndexToVerse(currStartGlobal);
      const dayEndVerse = globalIndexToVerse(currEndGlobal);

      const sessions =
        sessionsPerDay > 1
          ? generateSessions(currStartGlobal, currEndGlobal, sessionsPerDay, sessionNamingType)
          : undefined;

      assignments.push({
        dayNumber: day,
        date: dateStr,
        unit: "verses",
        start: dayStartVerse,
        end: dayEndVerse,
        count,
        cumulativeCount: runningCumulative,
        isCompleted: false,
        sessions,
      });

      currStartGlobal = currEndGlobal + 1;
    }
  } else if (unit === "pages") {
    // Canonical page based calculation (pages 1 to 604)
    const totalPages = TOTAL_PAGES;
    const pageAllocations = distributeIntegerUnits(totalPages, targetDays);

    let currentPage = 1;
    let runningCumulative = 0;

    for (let day = 1; day <= targetDays; day++) {
      const pageCount = pageAllocations[day - 1];
      const endPage = currentPage + pageCount - 1;
      runningCumulative += pageCount;
      const dateStr = addDaysToDateString(startDate, day - 1);

      const startPageBoundary = PAGE_BOUNDARIES[currentPage - 1];
      const endPageBoundary = PAGE_BOUNDARIES[endPage - 1];

      const dayStartVerse: VerseRef = {
        surah: startPageBoundary.startSurah,
        verse: startPageBoundary.startVerse,
        page: currentPage,
        juz: startPageBoundary.juz,
      };

      const dayEndVerse: VerseRef = {
        surah: endPageBoundary.endSurah,
        verse: endPageBoundary.endVerse,
        page: endPage,
        juz: endPageBoundary.juz,
      };

      const dayStartGlobal = verseToGlobalIndex(dayStartVerse.surah, dayStartVerse.verse);
      const dayEndGlobal = verseToGlobalIndex(dayEndVerse.surah, dayEndVerse.verse);

      const sessions =
        sessionsPerDay > 1
          ? generateSessions(dayStartGlobal, dayEndGlobal, sessionsPerDay, sessionNamingType)
          : undefined;

      assignments.push({
        dayNumber: day,
        date: dateStr,
        unit: "pages",
        start: dayStartVerse,
        end: dayEndVerse,
        count: pageCount,
        cumulativeCount: runningCumulative,
        isCompleted: false,
        sessions,
      });

      currentPage = endPage + 1;
    }
  } else if (unit === "juz") {
    // Canonical Juz based calculation (30 Juz)
    const totalJuz = TOTAL_JUZ;
    const juzAllocations = distributeIntegerUnits(totalJuz, targetDays);

    let currentJuz = 1;
    let runningCumulative = 0;

    for (let day = 1; day <= targetDays; day++) {
      const juzCount = juzAllocations[day - 1];
      const endJuz = currentJuz + juzCount - 1;
      runningCumulative += juzCount;
      const dateStr = addDaysToDateString(startDate, day - 1);

      const startJuzBoundary = JUZ_BOUNDARIES[currentJuz - 1];
      const endJuzBoundary = JUZ_BOUNDARIES[endJuz - 1];

      const dayStartVerse: VerseRef = {
        surah: startJuzBoundary.startSurah,
        verse: startJuzBoundary.startVerse,
        juz: currentJuz,
      };

      const dayEndVerse: VerseRef = {
        surah: endJuzBoundary.endSurah,
        verse: endJuzBoundary.endVerse,
        juz: endJuz,
      };

      const dayStartGlobal = verseToGlobalIndex(dayStartVerse.surah, dayStartVerse.verse);
      const dayEndGlobal = verseToGlobalIndex(dayEndVerse.surah, dayEndVerse.verse);

      const sessions =
        sessionsPerDay > 1
          ? generateSessions(dayStartGlobal, dayEndGlobal, sessionsPerDay, sessionNamingType)
          : undefined;

      assignments.push({
        dayNumber: day,
        date: dateStr,
        unit: "juz",
        start: dayStartVerse,
        end: dayEndVerse,
        count: juzCount,
        cumulativeCount: runningCumulative,
        isCompleted: false,
        sessions,
      });

      currentJuz = endJuz + 1;
    }
  }

  const endDate = addDaysToDateString(startDate, targetDays - 1);
  const nowIso = new Date().toISOString();

  return {
    id: `plan-${Date.now()}`,
    title: `ختمة في ${targetDays} يوم (${unit === "verses" ? "بالآيات" : unit === "pages" ? "بالصفحات" : "بالأجزاء"})`,
    unit,
    targetDays,
    startDate,
    endDate,
    sessionsPerDay,
    sessionNamingType,
    assignments,
    currentReadingPosition: startPosition,
    createdAt: nowIso,
    updatedAt: nowIso,
    isCompleted: false,
  };
}

/**
 * Reschedules a plan starting from the current confirmed reading position.
 * Keeps previously completed work intact or builds a fresh balanced schedule for the remaining verses.
 */
export function reschedulePlan(
  existingPlan: KhatmahPlan,
  currentPosition: VerseRef,
  newTargetDays?: number,
  newStartDate?: string
): KhatmahPlan {
  const currentGlobal = verseToGlobalIndex(currentPosition.surah, currentPosition.verse);

  // If already finished
  if (currentGlobal >= TOTAL_VERSES) {
    return {
      ...existingPlan,
      isCompleted: true,
      currentReadingPosition: currentPosition,
      updatedAt: new Date().toISOString(),
    };
  }

  // Next verse to read
  const nextGlobal = currentGlobal + 1;
  const nextStartVerse = globalIndexToVerse(nextGlobal);
  const days = newTargetDays ?? Math.max(1, existingPlan.targetDays - existingPlan.assignments.filter((a) => a.isCompleted).length);
  const startDayDate = newStartDate ?? addDaysToDateString(new Date().toISOString().slice(0, 10), 0);

  const remainingParams: PlanGenerationParams = {
    unit: existingPlan.unit,
    targetDays: days,
    startDate: startDayDate,
    sessionsPerDay: existingPlan.sessionsPerDay,
    sessionNamingType: existingPlan.sessionNamingType,
    startPosition: nextStartVerse,
    endPosition: { surah: 114, verse: 6 },
  };

  const remainingPlan = generateKhatmahPlan(remainingParams);

  // Retain completed assignments
  const completedAssignments = existingPlan.assignments.filter((a) => a.isCompleted);
  const renumberedNewAssignments = remainingPlan.assignments.map((a, idx) => ({
    ...a,
    dayNumber: completedAssignments.length + idx + 1,
  }));

  const combinedAssignments = [...completedAssignments, ...renumberedNewAssignments];
  const lastAssignment = combinedAssignments[combinedAssignments.length - 1];

  return {
    ...existingPlan,
    targetDays: combinedAssignments.length,
    endDate: lastAssignment ? lastAssignment.date : remainingPlan.endDate,
    assignments: combinedAssignments,
    currentReadingPosition: currentPosition,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates a summary of progress for a plan
 */
export function calculateProgressSummary(plan: KhatmahPlan, currentDateStr?: string): PlanProgressSummary {
  const today = currentDateStr || new Date().toISOString().slice(0, 10);
  const totalItems = plan.unit === "verses" ? TOTAL_VERSES : plan.unit === "pages" ? TOTAL_PAGES : TOTAL_JUZ;

  const currentGlobal = verseToGlobalIndex(
    plan.currentReadingPosition.surah,
    plan.currentReadingPosition.verse
  );

  let completedItems = 0;
  if (plan.unit === "verses") {
    completedItems = Math.min(totalItems, currentGlobal);
  } else if (plan.unit === "pages") {
    // Find page of current verse
    const metaPage = SURAHS_METADATA[plan.currentReadingPosition.surah - 1]?.startPage || 1;
    completedItems = Math.min(totalItems, metaPage);
  } else {
    // Juz
    const metaJuz = SURAHS_METADATA[plan.currentReadingPosition.surah - 1]?.startJuz || 1;
    completedItems = Math.min(totalItems, metaJuz);
  }

  const remainingItems = Math.max(0, totalItems - completedItems);
  const percentage = Math.min(100, Math.round((completedItems / totalItems) * 100));

  const completedDaysCount = plan.assignments.filter((a) => a.isCompleted).length;
  const totalDays = plan.targetDays;

  // Days elapsed since start
  const startD = new Date(plan.startDate).getTime();
  const todayD = new Date(today).getTime();
  const diffDays = Math.max(0, Math.floor((todayD - startD) / (1000 * 60 * 60 * 24)) + 1);
  const daysElapsed = Math.min(totalDays, diffDays);
  const daysRemaining = Math.max(0, totalDays - completedDaysCount);

  // Ahead or behind schedule
  const expectedCompletedByToday = Math.min(totalDays, daysElapsed);
  const isAhead = completedDaysCount >= expectedCompletedByToday;
  const deltaDays = completedDaysCount - expectedCompletedByToday;

  return {
    totalItems,
    completedItems,
    remainingItems,
    percentage,
    daysElapsed,
    daysRemaining,
    totalDays,
    completedDaysCount,
    isAhead,
    deltaDays,
  };
}
