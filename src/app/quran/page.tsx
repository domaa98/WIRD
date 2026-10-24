"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Bookmark as BookmarkIcon,
  BookmarkPlus,
  BookmarkCheck,
  Check,
  Search,
  Type,
  Maximize2,
  Minimize2,
  Copy,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUp,
} from "lucide-react";
import { getSurahDetail, getAllSurahsMetadata } from "@/lib/quran/source";
import { SurahDetail, Verse } from "@/lib/quran/types";
import { useWirdState } from "@/lib/storage/useWirdState";
import { SurahPickerModal } from "@/components/quran/SurahPickerModal";
import { BookmarksModal } from "@/components/quran/BookmarksModal";
import { AddBookmarkModal } from "@/components/quran/AddBookmarkModal";

function QuranReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, updatePosition, addBookmark, removeBookmark, updatePrefs, isMounted } =
    useWirdState();

  const surahParam = searchParams.get("surah");
  const verseParam = searchParams.get("verse");

  const initialSurah = surahParam
    ? parseInt(surahParam, 10)
    : isMounted && state.lastReadingPosition.surah
    ? state.lastReadingPosition.surah
    : 1;

  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(initialSurah || 1);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [bookmarkTargetVerse, setBookmarkTargetVerse] = useState<Verse | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedVerseId, setCopiedVerseId] = useState<number | null>(null);

  // Target verse highlight ref
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Preferences
  const fontSize = state.preferences.quranFontSize || 26;
  const readerWidth = state.preferences.readerWidth || "normal";

  // Load surah detail
  const loadSurah = async (sNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSurahDetail(sNumber);
      if (!data) {
        setError(`تعذر تحميل بيانات سورة رقم ${sNumber}`);
      } else {
        setSurahDetail(data);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء تحميل السورة");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSurah(currentSurahNumber);
  }, [currentSurahNumber]);

  // Handle URL change
  useEffect(() => {
    if (surahParam) {
      const parsed = parseInt(surahParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 114 && parsed !== currentSurahNumber) {
        setCurrentSurahNumber(parsed);
      }
    }
  }, [surahParam]);

  // Scroll to targeted verse if verseParam exists
  useEffect(() => {
    if (verseParam && !isLoading && surahDetail) {
      const vNum = parseInt(verseParam, 10);
      if (vNum && verseRefs.current[vNum]) {
        setTimeout(() => {
          verseRefs.current[vNum]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  }, [verseParam, isLoading, surahDetail]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSelectSurah = (num: number) => {
    setCurrentSurahNumber(num);
    router.push(`/quran?surah=${num}`);
  };

  const handleNextSurah = () => {
    if (currentSurahNumber < 114) {
      handleSelectSurah(currentSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (currentSurahNumber > 1) {
      handleSelectSurah(currentSurahNumber - 1);
    }
  };

  const handleMarkAsCurrentPosition = (verse: Verse) => {
    updatePosition({
      surah: verse.surah,
      verse: verse.verseNumber,
      page: verse.page,
      juz: verse.juz,
    });
    showToast(`تم حفظ موضع قراءتك عند سورة ${surahDetail?.name} الآية ${verse.verseNumber}`);
  };

  const handleCopyVerse = (verse: Verse) => {
    const textToCopy = `﴿ ${verse.text} ﴾ [سورة ${surahDetail?.name}: ${verse.verseNumber}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerseId(verse.id);
    showToast("تم نسخ الآية بنجاح");
    setTimeout(() => setCopiedVerseId(null), 2000);
  };

  const isVerseBookmarked = (verseNumber: number) => {
    return state.bookmarks.some(
      (b) => b.surah === currentSurahNumber && b.verse === verseNumber
    );
  };

  const getBookmarkForVerse = (verseNumber: number) => {
    return state.bookmarks.find(
      (b) => b.surah === currentSurahNumber && b.verse === verseNumber
    );
  };

  const handleBookmarkClick = (verse: Verse) => {
    const existing = getBookmarkForVerse(verse.verseNumber);
    if (existing) {
      removeBookmark(existing.id);
      showToast("تمت إزالة الإشارة المرجعية");
    } else {
      setBookmarkTargetVerse(verse);
    }
  };

  const saveNewBookmark = (note: string) => {
    if (!bookmarkTargetVerse || !surahDetail) return;
    addBookmark({
      id: `bm-${Date.now()}`,
      surah: bookmarkTargetVerse.surah,
      verse: bookmarkTargetVerse.verseNumber,
      surahName: surahDetail.name,
      verseText: bookmarkTargetVerse.text,
      note: note || undefined,
      createdAt: new Date().toISOString(),
    });
    showToast(`تم حفظ الإشارة المرجعية لسورة ${surahDetail.name} الآية ${bookmarkTargetVerse.verseNumber}`);
    setBookmarkTargetVerse(null);
  };

  const widthClass =
    readerWidth === "narrow"
      ? "max-w-2xl"
      : readerWidth === "wide"
      ? "max-w-6xl"
      : "max-w-4xl";

  const allSurahs = getAllSurahsMetadata();

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-deepGreen text-white shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-fadeIn border border-gold/30">
          <Sparkles className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Controls Toolbar */}
      <div className="sticky top-16 sm:top-20 z-30 w-full border-b border-wirdBorder dark:border-wirdDarkBorder bg-white/95 dark:bg-wirdDarkBg/95 backdrop-blur-md py-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Surah Switcher Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory hover:border-primary text-sm font-bold shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>سورة {surahDetail?.name || "اختر سورة"}</span>
              <span className="text-xs text-wirdMuted dark:text-gray-400">({currentSurahNumber}/114)</span>
            </button>

            {/* Jump to verse selector */}
            {surahDetail && (
              <select
                value={verseParam || ""}
                onChange={(e) => {
                  const targetV = e.target.value;
                  if (targetV) {
                    router.push(`/quran?surah=${currentSurahNumber}&verse=${targetV}`);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory text-xs font-semibold outline-none focus:border-primary"
                aria-label="الانتقال إلى آية"
              >
                <option value="">انتقال لآية...</option>
                {Array.from({ length: surahDetail.numberOfAyahs }, (_, i) => i + 1).map((v) => (
                  <option key={v} value={v}>
                    الآية {v}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Previous / Next Surah navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevSurah}
              disabled={currentSurahNumber <= 1}
              className="p-1.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 text-deepGreen dark:text-ivory transition-colors"
              title="السورة السابقة"
              aria-label="السورة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextSurah}
              disabled={currentSurahNumber >= 114}
              className="p-1.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 text-deepGreen dark:text-ivory transition-colors"
              title="السورة التالية"
              aria-label="السورة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Reading Customization Tools: Font Size, Width, Bookmarks */}
          <div className="flex items-center gap-2">
            {/* Font size controls */}
            <div className="flex items-center border border-wirdBorder dark:border-wirdDarkBorder rounded-xl bg-ivory dark:bg-wirdDarkSurface p-0.5">
              <button
                onClick={() => updatePrefs({ quranFontSize: Math.max(18, fontSize - 2) })}
                className="px-2 py-1 text-xs font-bold text-deepGreen dark:text-ivory hover:text-primary"
                title="تصغير خط المصحف"
                aria-label="تصغير خط المصحف"
              >
                A-
              </button>
              <span className="text-[11px] px-1 text-wirdMuted dark:text-gray-400 font-mono">
                {fontSize}
              </span>
              <button
                onClick={() => updatePrefs({ quranFontSize: Math.min(46, fontSize + 2) })}
                className="px-2 py-1 text-xs font-bold text-deepGreen dark:text-ivory hover:text-primary"
                title="تكبير خط المصحف"
                aria-label="تكبير خط المصحف"
              >
                A+
              </button>
            </div>

            {/* Width switcher */}
            <button
              onClick={() => {
                const nextWidth =
                  readerWidth === "normal" ? "wide" : readerWidth === "wide" ? "narrow" : "normal";
                updatePrefs({ readerWidth: nextWidth });
              }}
              className="p-2 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory hover:text-primary transition-colors text-xs flex items-center gap-1"
              title={`عرض القراءة: ${readerWidth === "normal" ? "قياسي" : readerWidth === "wide" ? "عريض" : "ضيق"}`}
              aria-label="تبديل عرض صفحة القراءة"
            >
              {readerWidth === "wide" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Bookmarks Modal Button */}
            <button
              onClick={() => setIsBookmarksOpen(true)}
              className="relative p-2 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory hover:text-primary transition-colors"
              title="الإشارات المرجعية"
              aria-label="عرض الإشارات المرجعية"
            >
              <BookmarkIcon className="w-4 h-4 text-gold" />
              {state.bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {state.bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Reader Content */}
      <div className={`mx-auto px-4 sm:px-6 w-full mt-6 ${widthClass} transition-all duration-300`}>
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-wirdMuted dark:text-gray-400">جاري تحميل السورة الكريمة...</p>
          </div>
        ) : error || !surahDetail ? (
          <div className="py-16 text-center space-y-4 bg-white dark:bg-wirdDarkSurface p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50">
            <p className="text-rose-600 dark:text-rose-400 font-semibold">{error || "تعذر العثور على السورة"}</p>
            <button
              onClick={() => loadSurah(currentSurahNumber)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Surah Header Card */}
            <div className="bg-gradient-to-br from-primary/10 via-white to-gold/10 dark:from-deepGreen/40 dark:via-wirdDarkSurface dark:to-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 text-center relative overflow-hidden shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 inline-block">
                  {surahDetail.revelationType === "Meccan" ? "مكية" : "مدنية"} · {surahDetail.numberOfAyahs} آيات
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-deepGreen dark:text-ivory font-arabic">
                  سورة {surahDetail.name}
                </h1>
                <p className="text-xs text-wirdMuted dark:text-gray-400">
                  {surahDetail.englishName} ({surahDetail.englishNameTranslation}) · الجزء {surahDetail.verses[0]?.juz} · الصفحة {surahDetail.verses[0]?.page}
                </p>
              </div>

              {/* Bismillah Header (except Surah At-Tawbah 9, and for Surah 1 Bismillah is already verse 1) */}
              {surahDetail.number !== 9 && surahDetail.number !== 1 && (
                <div className="mt-6 pt-5 border-t border-wirdBorder/60 dark:border-wirdDarkBorder/60">
                  <p className="font-quran text-2xl sm:text-3xl text-deepGreen dark:text-gold leading-relaxed">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}
            </div>

            {/* Verses Container */}
            <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-10 shadow-card divide-y divide-wirdBorder/60 dark:divide-wirdDarkBorder/60">
              {surahDetail.verses.map((verse) => {
                const isCurrentReadingPos =
                  state.lastReadingPosition.surah === verse.surah &&
                  state.lastReadingPosition.verse === verse.verseNumber;
                const bookmarked = isVerseBookmarked(verse.verseNumber);
                const isTargetHighlighted = String(verse.verseNumber) === verseParam;

                return (
                  <div
                    key={verse.id}
                    ref={(el) => {
                      verseRefs.current[verse.verseNumber] = el;
                    }}
                    className={`py-5 transition-colors rounded-xl ${
                      isTargetHighlighted
                        ? "bg-gold/10 px-4 -mx-4"
                        : isCurrentReadingPos
                        ? "bg-primary/5 px-4 -mx-4"
                        : ""
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Quran Verse Text */}
                      <div
                        className="font-quran text-deepGreen dark:text-ivory text-right leading-[2.5]"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        <span>{verse.text}</span>
                        <span className="ayah-symbol font-arabic text-gold font-bold inline-flex items-center justify-center mx-1.5 select-none" style={{ fontSize: `${Math.round(fontSize * 0.85)}px` }}>
                          ۝{verse.verseNumber}
                        </span>
                      </div>

                      {/* Verse Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-wirdBorder/30 dark:border-wirdDarkBorder/30 text-xs">
                        <div className="flex items-center gap-2 text-wirdMuted dark:text-gray-400">
                          <span className="font-semibold text-deepGreen dark:text-gray-300">
                            الآية {verse.verseNumber}
                          </span>
                          <span>· صفحة {verse.page}</span>
                          <span>· جزء {verse.juz}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Mark as current position button */}
                          <button
                            onClick={() => handleMarkAsCurrentPosition(verse)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                              isCurrentReadingPos
                                ? "bg-primary/10 text-primary font-bold dark:bg-primary/20"
                                : "text-wirdMuted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                            title="تحديد هذا الموضع كآخر ما قرأت"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {isCurrentReadingPos ? "موضع وقوفك الحالي" : "وقفت هنا"}
                            </span>
                          </button>

                          {/* Bookmark button */}
                          <button
                            onClick={() => handleBookmarkClick(verse)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              bookmarked
                                ? "text-gold bg-gold/10"
                                : "text-wirdMuted hover:text-gold hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                            title={bookmarked ? "إزالة الإشارة المرجعية" : "إضافة إشارة مرجعية"}
                            aria-label="إشارة مرجعية"
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-gold" />
                            ) : (
                              <BookmarkPlus className="w-4 h-4" />
                            )}
                          </button>

                          {/* Copy verse */}
                          <button
                            onClick={() => handleCopyVerse(verse)}
                            className="p-1.5 rounded-lg text-wirdMuted hover:text-deepGreen dark:hover:text-ivory hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            title="نسخ الآية"
                            aria-label="نسخ الآية"
                          >
                            {copiedVerseId === verse.id ? (
                              <CheckCheck className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Next/Prev Surah buttons */}
            <div className="flex items-center justify-between pt-4">
              {currentSurahNumber > 1 ? (
                <button
                  onClick={handlePrevSurah}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-white dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory hover:border-primary text-sm font-bold shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>السورة السابقة: {allSurahs[currentSurahNumber - 2]?.name}</span>
                </button>
              ) : (
                <div />
              )}

              {currentSurahNumber < 114 ? (
                <button
                  onClick={handleNextSurah}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-white dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory hover:border-primary text-sm font-bold shadow-sm"
                >
                  <span>السورة التالية: {allSurahs[currentSurahNumber]?.name}</span>
                  <ChevronLeft className="w-4 h-4 text-primary" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Surah Picker Modal */}
      <SurahPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentSurahNumber={currentSurahNumber}
        onSelectSurah={handleSelectSurah}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={state.bookmarks}
        onSelectBookmark={(sNum, vNum) => {
          if (sNum !== currentSurahNumber) {
            router.push(`/quran?surah=${sNum}&verse=${vNum}`);
          } else {
            router.push(`/quran?surah=${sNum}&verse=${vNum}`);
            verseRefs.current[vNum]?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
        onDeleteBookmark={removeBookmark}
      />

      {/* Add Bookmark Modal */}
      {bookmarkTargetVerse && surahDetail && (
        <AddBookmarkModal
          isOpen={!!bookmarkTargetVerse}
          onClose={() => setBookmarkTargetVerse(null)}
          surahNumber={bookmarkTargetVerse.surah}
          surahName={surahDetail.name}
          verseNumber={bookmarkTargetVerse.verseNumber}
          verseText={bookmarkTargetVerse.text}
          onSave={saveNewBookmark}
        />
      )}
    </div>
  );
}

export default function QuranPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <QuranReaderContent />
    </Suspense>
  );
}
