"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { searchSurahs } from "@/lib/quran/source";
import { SurahMetadata } from "@/lib/quran/types";

interface SurahPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurahNumber: number;
  onSelectSurah: (surahNumber: number) => void;
}

export function SurahPickerModal({
  isOpen,
  onClose,
  currentSurahNumber,
  onSelectSurah,
}: SurahPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurahs = useMemo(() => {
    return searchSurahs(searchQuery);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surah-picker-title"
    >
      <div className="bg-white dark:bg-wirdDarkSurface w-full max-w-2xl rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header & Search */}
        <div className="p-4 sm:p-5 border-b border-wirdBorder dark:border-wirdDarkBorder space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="surah-picker-title" className="text-lg font-bold text-deepGreen dark:text-ivory">
              فهرس سور القرآن الكريم (114 سورة)
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-wirdMuted hover:text-deepGreen dark:hover:text-ivory hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-wirdMuted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم السورة (مثلاً: الكهف) أو رقمها..."
              autoFocus
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-ivory text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Surahs Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 flex-1">
          {filteredSurahs.map((s) => {
            const isCurrent = s.number === currentSurahNumber;
            return (
              <button
                key={s.number}
                onClick={() => {
                  onSelectSurah(s.number);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all group ${
                  isCurrent
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-ivory/60 dark:bg-wirdDarkBg/60 border-wirdBorder dark:border-wirdDarkBorder hover:border-primary hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : "bg-white dark:bg-wirdDarkSurface text-primary border border-wirdBorder dark:border-wirdDarkBorder"
                    }`}
                  >
                    {s.number}
                  </span>
                  <div>
                    <h3
                      className={`font-bold text-sm ${
                        isCurrent
                          ? "text-white"
                          : "text-deepGreen dark:text-ivory group-hover:text-primary"
                      }`}
                    >
                      سورة {s.name}
                    </h3>
                    <p
                      className={`text-[11px] ${
                        isCurrent ? "text-white/80" : "text-wirdMuted dark:text-gray-400"
                      }`}
                    >
                      {s.revelationType === "Meccan" ? "مكية" : "مدنية"} · {s.numberOfAyahs} آيات
                    </p>
                  </div>
                </div>

                {isCurrent && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
