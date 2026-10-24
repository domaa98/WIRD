import {
  CURRENT_STORAGE_VERSION,
  StoredAppData,
  StoredAppDataSchema,
  UserPreferences,
  Bookmark,
  ReadingHistoryEntry,
} from "./schema";
import { VerseRef, KhatmahPlan } from "../planner/types";

export const STORAGE_KEY = "wird_app_data_v1";
export const STORAGE_CHANGE_EVENT = "wird_storage_updated";

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  quranFontSize: 24,
  readerWidth: "normal",
  showTajweedColors: false,
  autoScroll: false,
};

export const INITIAL_APP_DATA: StoredAppData = {
  version: CURRENT_STORAGE_VERSION,
  lastReadingPosition: { surah: 1, verse: 1, page: 1, juz: 1 },
  activePlan: null,
  bookmarks: [],
  history: [],
  preferences: DEFAULT_PREFERENCES,
  lastUpdated: new Date().toISOString(),
};

// In-memory fallback if localStorage is blocked by user privacy settings or SSR
let memoryStorage: StoredAppData | null = null;

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__wird_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Migrates data from older versions if necessary
 */
function migrateData(raw: unknown): StoredAppData {
  if (typeof raw !== "object" || raw === null) {
    return INITIAL_APP_DATA;
  }
  const rawObj = raw as Record<string, unknown>;
  const version = typeof rawObj.version === "number" ? rawObj.version : 0;

  // Version 0 to 1 migration or future versions
  if (version < CURRENT_STORAGE_VERSION) {
    return {
      ...INITIAL_APP_DATA,
      ...rawObj,
      version: CURRENT_STORAGE_VERSION,
      lastUpdated: new Date().toISOString(),
    };
  }

  const parsed = StoredAppDataSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("WIRD storage schema validation failed, falling back safely:", parsed.error);
    return {
      ...INITIAL_APP_DATA,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(typeof rawObj.preferences === "object" ? (rawObj.preferences as Record<string, unknown>) : {}),
      },
    };
  }
  return parsed.data;
}

/**
 * Retrieves the current application state safely
 */
export function getStoredData(): StoredAppData {
  if (!isLocalStorageAvailable()) {
    if (!memoryStorage) {
      memoryStorage = { ...INITIAL_APP_DATA };
    }
    return memoryStorage;
  }

  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) {
      return INITIAL_APP_DATA;
    }
    const parsed = JSON.parse(item);
    return migrateData(parsed);
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    return INITIAL_APP_DATA;
  }
}

/**
 * Saves entire application state safely and notifies listeners
 */
export function saveStoredData(data: StoredAppData): boolean {
  data.lastUpdated = new Date().toISOString();
  memoryStorage = data;

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to write to localStorage:", err);
      return false;
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: data }));
  }
  return true;
}

/**
 * Updates reading position
 */
export function updateReadingPosition(position: VerseRef): void {
  const current = getStoredData();
  const updated: StoredAppData = {
    ...current,
    lastReadingPosition: position,
  };
  saveStoredData(updated);
}

/**
 * Updates or sets the active Khatmah plan
 */
export function saveActivePlan(plan: KhatmahPlan | null): void {
  const current = getStoredData();
  const updated: StoredAppData = {
    ...current,
    activePlan: plan,
  };
  saveStoredData(updated);
}

/**
 * Marks a specific day's assignment in the active plan as completed
 */
export function markDayCompleted(dayNumber: number, isCompleted: boolean = true): void {
  const current = getStoredData();
  if (!current.activePlan) return;

  const targetDay = current.activePlan.assignments.find((a) => a.dayNumber === dayNumber);
  if (!targetDay) return;

  targetDay.isCompleted = isCompleted;
  targetDay.completedAt = isCompleted ? new Date().toISOString() : undefined;

  // If completed, update current reading position to the end of this day
  if (isCompleted) {
    current.activePlan.currentReadingPosition = targetDay.end;
    current.lastReadingPosition = targetDay.end;

    // Record in history
    const historyItem: ReadingHistoryEntry = {
      id: `hist-${Date.now()}`,
      date: targetDay.date,
      startVerse: targetDay.start,
      endVerse: targetDay.end,
      itemsRead: targetDay.count,
      unit: targetDay.unit,
      timestamp: new Date().toISOString(),
    };
    current.history.push(historyItem);
  }

  // Check if all completed
  const allDone = current.activePlan.assignments.every((a) => a.isCompleted);
  current.activePlan.isCompleted = allDone;
  current.activePlan.updatedAt = new Date().toISOString();

  saveStoredData(current);
}

/**
 * Adds a bookmark
 */
export function addBookmark(bookmark: Bookmark): void {
  const current = getStoredData();
  // Filter out any existing bookmark for the exact same surah and verse
  const filtered = current.bookmarks.filter(
    (b) => !(b.surah === bookmark.surah && b.verse === bookmark.verse)
  );
  filtered.unshift(bookmark);
  saveStoredData({
    ...current,
    bookmarks: filtered,
  });
}

/**
 * Removes a bookmark by ID
 */
export function removeBookmark(id: string): void {
  const current = getStoredData();
  const filtered = current.bookmarks.filter((b) => b.id !== id);
  saveStoredData({
    ...current,
    bookmarks: filtered,
  });
}

/**
 * Updates preferences
 */
export function updatePreferences(prefs: Partial<UserPreferences>): void {
  const current = getStoredData();
  saveStoredData({
    ...current,
    preferences: {
      ...current.preferences,
      ...prefs,
    },
  });
}

/**
 * Clears all user data completely after explicit confirmation
 */
export function clearAllStoredData(): void {
  memoryStorage = { ...INITIAL_APP_DATA };
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Error clearing localStorage:", err);
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: INITIAL_APP_DATA }));
  }
}
