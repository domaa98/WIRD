"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStoredData,
  saveStoredData,
  updateReadingPosition as updatePosHelper,
  saveActivePlan as savePlanHelper,
  markDayCompleted as markDayHelper,
  addBookmark as addBookmarkHelper,
  removeBookmark as removeBookmarkHelper,
  updatePreferences as updatePrefsHelper,
  clearAllStoredData as clearDataHelper,
  STORAGE_CHANGE_EVENT,
  INITIAL_APP_DATA,
} from "./local-storage";
import { StoredAppData, Bookmark, UserPreferences } from "./schema";
import { VerseRef, KhatmahPlan } from "../planner/types";

export function useWirdState() {
  const [data, setData] = useState<StoredAppData>(INITIAL_APP_DATA);
  const [isMounted, setIsMounted] = useState(false);

  const syncState = useCallback(() => {
    const current = getStoredData();
    setData(current);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    syncState();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<StoredAppData>;
      if (customEvent.detail) {
        setData(customEvent.detail);
      } else {
        syncState();
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    window.addEventListener("storage", syncState);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      window.removeEventListener("storage", syncState);
    };
  }, [syncState]);

  // Synchronize theme class on html document
  useEffect(() => {
    if (!isMounted) return;
    const theme = data.preferences.theme;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [data.preferences.theme, isMounted]);

  const updatePosition = useCallback((pos: VerseRef) => {
    updatePosHelper(pos);
  }, []);

  const savePlan = useCallback((plan: KhatmahPlan | null) => {
    savePlanHelper(plan);
  }, []);

  const toggleDayCompletion = useCallback((dayNumber: number, completed: boolean) => {
    markDayHelper(dayNumber, completed);
  }, []);

  const addBookmark = useCallback((bm: Bookmark) => {
    addBookmarkHelper(bm);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    removeBookmarkHelper(id);
  }, []);

  const updatePrefs = useCallback((prefs: Partial<UserPreferences>) => {
    updatePrefsHelper(prefs);
  }, []);

  const clearData = useCallback(() => {
    clearDataHelper();
  }, []);

  return {
    state: data,
    isMounted,
    updatePosition,
    savePlan,
    toggleDayCompletion,
    addBookmark,
    removeBookmark,
    updatePrefs,
    clearData,
  };
}
