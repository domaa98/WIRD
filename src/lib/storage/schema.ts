import { z } from "zod";

export const CURRENT_STORAGE_VERSION = 1;

export const VerseRefSchema = z.object({
  surah: z.number().int().min(1).max(114),
  verse: z.number().int().min(1),
  page: z.number().int().min(1).max(604).optional(),
  juz: z.number().int().min(1).max(30).optional(),
});

export const BookmarkSchema = z.object({
  id: z.string(),
  surah: z.number().int().min(1).max(114),
  verse: z.number().int().min(1),
  surahName: z.string(),
  verseText: z.string().optional(),
  note: z.string().max(500).optional(),
  createdAt: z.string(),
});

export const ReadingSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: VerseRefSchema,
  end: VerseRefSchema,
  count: z.number().int().min(1),
  isCompleted: z.boolean(),
});

export const DailyAssignmentSchema = z.object({
  dayNumber: z.number().int().min(1),
  date: z.string(), // YYYY-MM-DD
  unit: z.enum(["verses", "pages", "juz"]),
  start: VerseRefSchema,
  end: VerseRefSchema,
  count: z.number().int().min(1),
  cumulativeCount: z.number().int().min(1),
  isCompleted: z.boolean(),
  completedAt: z.string().optional(),
  sessions: z.array(ReadingSessionSchema).optional(),
});

export const KhatmahPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  unit: z.enum(["verses", "pages", "juz"]),
  targetDays: z.number().int().min(1).max(3650),
  startDate: z.string(),
  endDate: z.string(),
  sessionsPerDay: z.number().int().min(1).max(5),
  sessionNamingType: z.enum(["prayers", "numbers"]),
  assignments: z.array(DailyAssignmentSchema),
  currentReadingPosition: VerseRefSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  isCompleted: z.boolean(),
});

export const ReadingHistoryEntrySchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  startVerse: VerseRefSchema,
  endVerse: VerseRefSchema,
  itemsRead: z.number().int().min(1),
  unit: z.enum(["verses", "pages", "juz"]),
  timestamp: z.string(),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  quranFontSize: z.number().min(18).max(48),
  readerWidth: z.enum(["normal", "wide", "narrow"]),
  showTajweedColors: z.boolean().default(false),
  autoScroll: z.boolean().default(false),
});

export const StoredAppDataSchema = z.object({
  version: z.number().int().min(1),
  lastReadingPosition: VerseRefSchema,
  activePlan: KhatmahPlanSchema.nullable(),
  bookmarks: z.array(BookmarkSchema),
  history: z.array(ReadingHistoryEntrySchema),
  preferences: UserPreferencesSchema,
  lastUpdated: z.string(),
});

export const ExportDataSchema = z.object({
  app: z.literal("wird-quran"),
  exportedAt: z.string(),
  schemaVersion: z.number().int(),
  data: StoredAppDataSchema,
});

export type Bookmark = z.infer<typeof BookmarkSchema>;
export type ReadingHistoryEntry = z.infer<typeof ReadingHistoryEntrySchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type StoredAppData = z.infer<typeof StoredAppDataSchema>;
export type ExportDataPayload = z.infer<typeof ExportDataSchema>;
