import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredData,
  saveStoredData,
  updateReadingPosition,
  addBookmark,
  removeBookmark,
  clearAllStoredData,
  INITIAL_APP_DATA,
} from "../src/lib/storage/local-storage";
import {
  createExportPayload,
  importBackupFromJson,
} from "../src/lib/storage/export-import";
import { generateKhatmahPlan } from "../src/lib/planner/engine";

describe("Storage & Export/Import System", () => {
  beforeEach(() => {
    clearAllStoredData();
  });

  it("initializes with safe default values", () => {
    const data = getStoredData();
    expect(data.version).toBe(1);
    expect(data.lastReadingPosition).toEqual({ surah: 1, verse: 1, page: 1, juz: 1 });
    expect(data.bookmarks).toEqual([]);
    expect(data.activePlan).toBeNull();
  });

  it("updates and persists reading position", () => {
    updateReadingPosition({ surah: 2, verse: 255, page: 42, juz: 3 });
    const data = getStoredData();
    expect(data.lastReadingPosition).toEqual({ surah: 2, verse: 255, page: 42, juz: 3 });
  });

  it("adds and removes bookmarks correctly", () => {
    addBookmark({
      id: "bm-1",
      surah: 18,
      verse: 10,
      surahName: "الكهف",
      note: "آية الفتية",
      createdAt: new Date().toISOString(),
    });

    let data = getStoredData();
    expect(data.bookmarks.length).toBe(1);
    expect(data.bookmarks[0].surahName).toBe("الكهف");

    removeBookmark("bm-1");
    data = getStoredData();
    expect(data.bookmarks.length).toBe(0);
  });

  it("exports valid JSON payload conforming to schema", () => {
    updateReadingPosition({ surah: 36, verse: 1 });
    const payload = createExportPayload();
    expect(payload.app).toBe("wird-quran");
    expect(payload.schemaVersion).toBe(1);
    expect(payload.data.lastReadingPosition.surah).toBe(36);
  });

  it("imports valid backup and restores state", () => {
    const customPlan = generateKhatmahPlan({
      unit: "verses",
      targetDays: 30,
      startDate: "2026-01-01",
    });

    const backupData = {
      app: "wird-quran",
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
      data: {
        ...INITIAL_APP_DATA,
        lastReadingPosition: { surah: 55, verse: 1 },
        activePlan: customPlan,
        bookmarks: [
          {
            id: "b1",
            surah: 55,
            verse: 1,
            surahName: "الرحمن",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    };

    const res = importBackupFromJson(JSON.stringify(backupData));
    expect(res.success).toBe(true);

    const restored = getStoredData();
    expect(restored.lastReadingPosition.surah).toBe(55);
    expect(restored.activePlan?.targetDays).toBe(30);
    expect(restored.bookmarks.length).toBe(1);
  });

  it("gracefully rejects corrupted or invalid JSON import", () => {
    const invalidJson = "{ corrupted json content: true ";
    const res = importBackupFromJson(invalidJson);
    expect(res.success).toBe(false);

    const schemaMismatch = JSON.stringify({
      app: "other-app",
      someRandomKey: 123,
    });
    const res2 = importBackupFromJson(schemaMismatch);
    expect(res2.success).toBe(false);
  });
});
