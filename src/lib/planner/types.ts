export type PlanUnit = "verses" | "pages" | "juz";

export interface VerseRef {
  surah: number;
  verse: number;
  page?: number;
  juz?: number;
}

export interface ReadingSession {
  id: string;
  name: string; // e.g., "الفجر", "الظهر", or "الجلسة 1"
  start: VerseRef;
  end: VerseRef;
  count: number;
  isCompleted: boolean;
}

export interface DailyAssignment {
  dayNumber: number; // 1..N
  date: string; // YYYY-MM-DD
  unit: PlanUnit;
  start: VerseRef;
  end: VerseRef;
  count: number;
  cumulativeCount: number;
  isCompleted: boolean;
  completedAt?: string;
  sessions?: ReadingSession[];
}

export interface KhatmahPlan {
  id: string;
  title: string;
  unit: PlanUnit;
  targetDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  sessionsPerDay: number; // 1 to 5
  sessionNamingType: "prayers" | "numbers";
  assignments: DailyAssignment[];
  currentReadingPosition: VerseRef;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface PlanGenerationParams {
  unit: PlanUnit;
  targetDays: number;
  startDate: string; // YYYY-MM-DD
  sessionsPerDay?: number;
  sessionNamingType?: "prayers" | "numbers";
  startPosition?: VerseRef;
  endPosition?: VerseRef;
}

export interface PlanProgressSummary {
  totalItems: number;
  completedItems: number;
  remainingItems: number;
  percentage: number;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  completedDaysCount: number;
  isAhead: boolean;
  deltaDays: number;
}
