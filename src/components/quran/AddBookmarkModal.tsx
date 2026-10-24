"use client";

import React, { useState } from "react";
import { X, BookmarkPlus } from "lucide-react";

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  verseText: string;
  onSave: (note: string) => void;
}

export function AddBookmarkModal({
  isOpen,
  onClose,
  surahName,
  verseNumber,
  verseText,
  onSave,
}: AddBookmarkModalProps) {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim());
    setNote("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-bookmark-title"
    >
      <div className="bg-white dark:bg-wirdDarkSurface w-full max-w-md rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder shadow-xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-wirdBorder dark:border-wirdDarkBorder pb-3">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-gold" />
            <h2 id="add-bookmark-title" className="text-base font-bold text-deepGreen dark:text-ivory">
              إضافة إشارة مرجعية
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-wirdMuted hover:text-deepGreen dark:hover:text-ivory"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-ivory dark:bg-wirdDarkBg rounded-xl border border-wirdBorder dark:border-wirdDarkBorder space-y-1">
          <span className="text-xs font-semibold text-primary">
            سورة {surahName} — الآية {verseNumber}
          </span>
          <p className="font-quran text-sm text-deepGreen dark:text-gray-200 line-clamp-2">
            {verseText}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bookmark-note" className="block text-xs font-medium text-wirdMuted dark:text-gray-400 mb-1.5">
              ملاحظة شخصية (اختياري)
            </label>
            <textarea
              id="bookmark-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب تدبراً أو سبباً لحفظ هذه الآية..."
              maxLength={400}
              rows={3}
              className="w-full p-3 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-white dark:bg-wirdDarkBg text-deepGreen dark:text-ivory text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-wirdMuted hover:bg-black/5 dark:hover:bg-white/5"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-sm"
            >
              حفظ الإشارة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
