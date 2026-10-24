import { describe, it, expect } from "vitest";
import {
  verseToGlobalIndex,
  globalIndexToVerse,
  distributeIntegerUnits,
  generateKhatmahPlan,
  reschedulePlan,
  addDaysToDateString,
  calculateProgressSummary,
} from "../src/lib/planner/engine";
import { TOTAL_VERSES, TOTAL_PAGES, TOTAL_JUZ } from "../src/lib/quran/metadata";

describe("Khatmah Calculation Engine", () => {
  describe("Verse Global Index Bijective Mapping", () => {
    it("maps first verse 1:1 to index 1", () => {
      expect(verseToGlobalIndex(1, 1)).toBe(1);
      expect(globalIndexToVerse(1)).toEqual({ surah: 1, verse: 1 });
    });

    it("maps last verse 114:6 to index 6236", () => {
      expect(verseToGlobalIndex(114, 6)).toBe(TOTAL_VERSES);
      expect(globalIndexToVerse(TOTAL_VERSES)).toEqual({ surah: 114, verse: 6 });
    });

    it("maps middle verses accurately (e.g. Al-Baqarah 286)", () => {
      // Surah 1 has 7 ayahs. Surah 2 has 286 ayahs.
      // So 2:1 is index 8, 2:286 is index 7 + 286 = 293
      expect(verseToGlobalIndex(2, 1)).toBe(8);
      expect(globalIndexToVerse(8)).toEqual({ surah: 2, verse: 1 });

      expect(verseToGlobalIndex(2, 286)).toBe(293);
      expect(globalIndexToVerse(293)).toEqual({ surah: 2, verse: 286 });
    });

    it("throws error for out-of-range surah or verse", () => {
      expect(() => verseToGlobalIndex(0, 1)).toThrow();
      expect(() => verseToGlobalIndex(115, 1)).toThrow();
      expect(() => verseToGlobalIndex(1, 8)).toThrow(); // Al-Faatiha has only 7 verses
      expect(() => globalIndexToVerse(0)).toThrow();
      expect(() => globalIndexToVerse(6237)).toThrow();
    });
  });

  describe("distributeIntegerUnits", () => {
    it("distributes evenly when divisible", () => {
      const parts = distributeIntegerUnits(30, 3);
      expect(parts).toEqual([10, 10, 10]);
    });

    it("distributes remainder accurately across days", () => {
      // 6236 / 30 = 207 with remainder 26
      // First 26 days should have 208, last 4 days should have 207
      const parts = distributeIntegerUnits(6236, 30);
      expect(parts.length).toBe(30);
      const sum = parts.reduce((a, b) => a + b, 0);
      expect(sum).toBe(6236);

      const daysWith208 = parts.filter((x) => x === 208).length;
      const daysWith207 = parts.filter((x) => x === 207).length;
      expect(daysWith208).toBe(26);
      expect(daysWith207).toBe(4);
    });
  });

  describe("Date Arithmetic", () => {
    it("handles month rollover and leap year properly", () => {
      expect(addDaysToDateString("2024-02-28", 1)).toBe("2024-02-29"); // 2024 is leap year
      expect(addDaysToDateString("2024-02-29", 1)).toBe("2024-03-01");
      expect(addDaysToDateString("2024-12-31", 1)).toBe("2025-01-01");
    });
  });

  describe("Plan Generation - 30, 60, 90 & Custom Days", () => {
    it("generates a 30-day verse-based plan covering exactly all 6236 verses without duplicates or gaps", () => {
      const plan = generateKhatmahPlan({
        unit: "verses",
        targetDays: 30,
        startDate: "2026-01-01",
      });

      expect(plan.assignments.length).toBe(30);
      expect(plan.assignments[0].start).toEqual({ surah: 1, verse: 1 });
      expect(plan.assignments[29].end).toEqual({ surah: 114, verse: 6 });

      let expectedNextStartGlobal = 1;
      let totalAssignedVerses = 0;

      for (const assignment of plan.assignments) {
        const startGlobal = verseToGlobalIndex(assignment.start.surah, assignment.start.verse);
        const endGlobal = verseToGlobalIndex(assignment.end.surah, assignment.end.verse);

        expect(startGlobal).toBe(expectedNextStartGlobal);
        expect(endGlobal).toBeGreaterThanOrEqual(startGlobal);
        expect(assignment.count).toBe(endGlobal - startGlobal + 1);

        totalAssignedVerses += assignment.count;
        expectedNextStartGlobal = endGlobal + 1;
      }

      expect(totalAssignedVerses).toBe(TOTAL_VERSES);
      expect(expectedNextStartGlobal).toBe(TOTAL_VERSES + 1);
    });

    it("generates a 60-day plan with exact verse coverage", () => {
      const plan = generateKhatmahPlan({
        unit: "verses",
        targetDays: 60,
        startDate: "2026-01-01",
      });

      expect(plan.assignments.length).toBe(60);
      const total = plan.assignments.reduce((sum, a) => sum + a.count, 0);
      expect(total).toBe(TOTAL_VERSES);
    });

    it("generates a 90-day plan with exact verse coverage", () => {
      const plan = generateKhatmahPlan({
        unit: "verses",
        targetDays: 90,
        startDate: "2026-01-01",
      });

      expect(plan.assignments.length).toBe(90);
      const total = plan.assignments.reduce((sum, a) => sum + a.count, 0);
      expect(total).toBe(TOTAL_VERSES);
    });

    it("generates a 7-day custom plan with 5 prayer sessions per day", () => {
      const plan = generateKhatmahPlan({
        unit: "verses",
        targetDays: 7,
        startDate: "2026-03-01",
        sessionsPerDay: 5,
        sessionNamingType: "prayers",
      });

      expect(plan.assignments.length).toBe(7);
      for (const day of plan.assignments) {
        expect(day.sessions).toBeDefined();
        expect(day.sessions?.length).toBe(5);
        expect(day.sessions?.[0].name).toBe("الفجر");
        expect(day.sessions?.[4].name).toBe("العشاء");

        // Sum of session counts should match day count
        const sessionsSum = day.sessions!.reduce((acc, s) => acc + s.count, 0);
        expect(sessionsSum).toBe(day.count);
      }
    });

    it("generates a 30-day page-based plan covering exactly 604 pages", () => {
      const plan = generateKhatmahPlan({
        unit: "pages",
        targetDays: 30,
        startDate: "2026-01-01",
      });

      expect(plan.assignments.length).toBe(30);
      const totalPagesAssigned = plan.assignments.reduce((sum, a) => sum + a.count, 0);
      expect(totalPagesAssigned).toBe(TOTAL_PAGES);
      expect(plan.assignments[0].start.page).toBe(1);
      expect(plan.assignments[29].end.page).toBe(TOTAL_PAGES);
    });

    it("generates a 30-day Juz-based plan covering exactly 30 Juz", () => {
      const plan = generateKhatmahPlan({
        unit: "juz",
        targetDays: 30,
        startDate: "2026-01-01",
      });

      expect(plan.assignments.length).toBe(30);
      const totalJuzAssigned = plan.assignments.reduce((sum, a) => sum + a.count, 0);
      expect(totalJuzAssigned).toBe(TOTAL_JUZ);
      expect(plan.assignments[0].start.juz).toBe(1);
      expect(plan.assignments[29].end.juz).toBe(TOTAL_JUZ);
    });
  });

  describe("Rescheduling Logic", () => {
    it("reschedules remaining verses starting from current position without duplicate or omitted verses", () => {
      const initialPlan = generateKhatmahPlan({
        unit: "verses",
        targetDays: 30,
        startDate: "2026-01-01",
      });

      // User completed first 3 days
      initialPlan.assignments[0].isCompleted = true;
      initialPlan.assignments[1].isCompleted = true;
      initialPlan.assignments[2].isCompleted = true;

      const currentPos = initialPlan.assignments[2].end;
      const rescheduled = reschedulePlan(initialPlan, currentPos, 20, "2026-01-10");

      // First 3 days preserved
      expect(rescheduled.assignments.slice(0, 3).every((a) => a.isCompleted)).toBe(true);

      // Remaining 20 days
      expect(rescheduled.assignments.length).toBe(23);

      // Verify contiguous sequence across all assignments
      let expectedStart = 1;
      let totalCount = 0;
      for (const a of rescheduled.assignments) {
        const startIdx = verseToGlobalIndex(a.start.surah, a.start.verse);
        const endIdx = verseToGlobalIndex(a.end.surah, a.end.verse);
        expect(startIdx).toBe(expectedStart);
        expectedStart = endIdx + 1;
        totalCount += a.count;
      }
      expect(totalCount).toBe(TOTAL_VERSES);
    });
  });

  describe("Progress Summary Calculation", () => {
    it("accurately calculates completion percentage and remaining items", () => {
      const plan = generateKhatmahPlan({
        unit: "verses",
        targetDays: 30,
        startDate: "2026-01-01",
      });
      // User is at Surah 2: Verse 141 (end of Juz 1, global index 148)
      plan.currentReadingPosition = { surah: 2, verse: 141 };

      const summary = calculateProgressSummary(plan, "2026-01-02");
      expect(summary.totalItems).toBe(TOTAL_VERSES);
      expect(summary.completedItems).toBe(148);
      expect(summary.remainingItems).toBe(TOTAL_VERSES - 148);
      expect(summary.percentage).toBe(Math.round((148 / TOTAL_VERSES) * 100));
    });
  });

  describe("Validation of invalid inputs", () => {
    it("rejects 0 days, negative days, or overly large days", () => {
      expect(() =>
        generateKhatmahPlan({ unit: "verses", targetDays: 0, startDate: "2026-01-01" })
      ).toThrow();
      expect(() =>
        generateKhatmahPlan({ unit: "verses", targetDays: -5, startDate: "2026-01-01" })
      ).toThrow();
      expect(() =>
        generateKhatmahPlan({ unit: "verses", targetDays: 4000, startDate: "2026-01-01" })
      ).toThrow();
    });

    it("rejects backwards start/end positions", () => {
      expect(() =>
        generateKhatmahPlan({
          unit: "verses",
          targetDays: 30,
          startDate: "2026-01-01",
          startPosition: { surah: 10, verse: 1 },
          endPosition: { surah: 2, verse: 1 },
        })
      ).toThrow();
    });
  });
});
