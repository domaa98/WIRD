"use client";

import React from "react";
import { X, Bookmark as BookmarkIcon, Trash2, ArrowRight } from "lucide-react";
import { Bookmark } from "@/lib/storage/schema";

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onSelectBookmark: (surah: number, verse: number) => void;
  onDeleteBookmark: (id: string) => void;
}

export function BookmarksModal({
  isOpen,
  onClose,
  bookmarks,
  onSelectBookmark,
  onDeleteBookmark,
}: BookmarksModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmarks-title"
    >
      <div className="bg-white dark:bg-wirdDarkSurface w-full max-w-lg rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-wirdBorder dark:border-wirdDarkBorder">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-5 h-5 text-gold" />
            <h2 id="bookmarks-title" className="text-lg font-bold text-deepGreen dark:text-ivory">
              إشاراتك المرجعية ({bookmarks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-wirdMuted hover:text-deepGreen dark:hover:text-ivory hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {bookmarks.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <BookmarkIcon className="w-10 h-10 mx-auto text-wirdMuted opacity-40" />
              <p className="text-sm text-wirdMuted dark:text-gray-400">
                لا توجد إشارات مرجعية محفوظة بعد.
              </p>
              <p className="text-xs text-wirdMuted dark:text-gray-500">
                يمكنك حفظ أي آية أثناء القراءة بالضغط على أيقونة الإشارة المرجعية بجانبها.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-3.5 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder dark:border-wirdDarkBorder hover:border-primary/50 transition-colors flex items-start justify-between gap-3"
              >
                <button
                  onClick={() => {
                    onSelectBookmark(bm.surah, bm.verse);
                    onClose();
                  }}
                  className="flex-1 text-right group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-deepGreen dark:text-ivory group-hover:text-primary transition-colors">
                      سورة {bm.surahName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      الآية {bm.verse}
                    </span>
                  </div>

                  {bm.verseText && (
                    <p className="font-quran text-sm text-deepGreen/90 dark:text-gray-300 mt-1 line-clamp-1">
                      {bm.verseText}
                    </p>
                  )}

                  {bm.note && (
                    <p className="text-xs text-wirdMuted dark:text-gray-400 mt-1.5 bg-white/70 dark:bg-wirdDarkSurface/70 p-2 rounded-lg border border-wirdBorder/50 dark:border-wirdDarkBorder/50">
                      ملاحظة: {bm.note}
                    </p>
                  )}

                  <span className="text-[10px] text-wirdMuted dark:text-gray-500 mt-1 block">
                    {new Date(bm.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </button>

                <button
                  onClick={() => onDeleteBookmark(bm.id)}
                  className="p-2 text-wirdMuted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="حذف الإشارة"
                  aria-label="حذف الإشارة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
