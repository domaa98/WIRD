"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Bookmark as BookmarkIcon,
  HelpCircle,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { useWirdState } from "@/lib/storage/useWirdState";
import { calculateProgressSummary, reschedulePlan } from "@/lib/planner/engine";
import { downloadBackupFile, importBackupFromJson } from "@/lib/storage/export-import";
import { SURAHS_METADATA } from "@/lib/quran/metadata";

export default function ProgressPage() {
  const { state, savePlan, toggleDayCompletion, clearData, isMounted } = useWirdState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecalculateOpen, setIsRecalculateOpen] = useState(false);
  const [recalcDays, setRecalcDays] = useState<number>(30);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePlan = state.activePlan;
  const lastPos = state.lastReadingPosition;
  const summary = activePlan ? calculateProgressSummary(activePlan) : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRecalculate = () => {
    if (!activePlan) return;
    const recalculated = reschedulePlan(
      activePlan,
      lastPos,
      recalcDays,
      new Date().toISOString().slice(0, 10)
    );
    savePlan(recalculated);
    setIsRecalculateOpen(false);
    showToast("تمت إعادة جدولة خطتك بنجاح لتناسب تقدمك الفعلي!");
  };

  const handleExport = () => {
    downloadBackupFile();
    showToast("تم تنزيل ملف النسخة الاحتياطية بنجاح.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBackupFromJson(content);
        if (res.success) {
          showToast(res.message);
        } else {
          alert(res.message + (res.error ? `:\n${res.error}` : ""));
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAll = () => {
    clearData();
    setIsClearConfirmOpen(false);
    showToast("تم مسح كافة البيانات المحلية بنجاح.");
  };

  // Find today's assignment
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAssignment = activePlan?.assignments.find((a) => a.date === todayStr);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-deepGreen text-white shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-fadeIn border border-gold/30">
          <Sparkles className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>لوحة المتابعة الشخصية</span>
          </div>
          <h1 className="text-3xl font-extrabold text-deepGreen dark:text-ivory mt-1 font-arabic">
            تقدمي في القراءة والختمة
          </h1>
          <p className="text-sm text-wirdMuted dark:text-gray-400">
            احصائيات دقيقة ومحسوبة مباشرة من قراءاتك المسجلة على جهازك.
          </p>
        </div>

        {/* Resume button */}
        {isMounted && lastPos && (
          <Link
            href={`/quran?surah=${lastPos.surah}&verse=${lastPos.verse}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>متابعة القراءة من سورة {SURAHS_METADATA[lastPos.surah - 1]?.name}</span>
          </Link>
        )}
      </div>

      {/* Active Plan Dashboard Card */}
      {isMounted && activePlan && summary ? (
        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wirdBorder dark:border-wirdDarkBorder pb-4">
            <div>
              <span className="text-xs font-semibold text-primary">الخطة النشطة</span>
              <h2 className="text-xl sm:text-2xl font-bold text-deepGreen dark:text-ivory mt-0.5">
                {activePlan.title}
              </h2>
              <p className="text-xs text-wirdMuted dark:text-gray-400">
                بدأت في {activePlan.startDate} · تنتهي بإذن الله في {activePlan.endDate}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRecalcDays(summary.daysRemaining || 30);
                  setIsRecalculateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-ivory hover:border-primary shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                <span>إعادة جدولة خطتي</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 space-y-1">
              <span className="text-xs text-wirdMuted dark:text-gray-400">نسبة الإنجاز</span>
              <p className="text-2xl font-extrabold text-primary">{summary.percentage}%</p>
              <span className="text-[10px] text-wirdMuted dark:text-gray-500">
                {summary.completedItems} من {summary.totalItems} {activePlan.unit === "verses" ? "آية" : activePlan.unit === "pages" ? "صفحة" : "جزء"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 space-y-1">
              <span className="text-xs text-wirdMuted dark:text-gray-400">الأيام المنجزة</span>
              <p className="text-2xl font-extrabold text-deepGreen dark:text-ivory">
                {summary.completedDaysCount}
              </p>
              <span className="text-[10px] text-wirdMuted dark:text-gray-500">
                من أصل {summary.totalDays} يوماً
              </span>
            </div>

            <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 space-y-1">
              <span className="text-xs text-wirdMuted dark:text-gray-400">الأيام المتبقية</span>
              <p className="text-2xl font-extrabold text-deepGreen dark:text-ivory">
                {summary.daysRemaining}
              </p>
              <span className="text-[10px] text-wirdMuted dark:text-gray-500">يوماً للختم</span>
            </div>

            <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 space-y-1">
              <span className="text-xs text-wirdMuted dark:text-gray-400">حالة المسار</span>
              <p className="text-base font-bold text-deepGreen dark:text-ivory mt-1">
                {summary.isAhead ? "على المسار الصحيح ✓" : "ميسّرة بإذن الله"}
              </p>
              <span className="text-[10px] text-wirdMuted dark:text-gray-500">
                {summary.deltaDays >= 0 ? `متقدم بـ ${summary.deltaDays} يوم` : `يمكنك إعادة الجدولة دائماً`}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-wirdMuted dark:text-gray-400">
              <span>مسار الختمة</span>
              <span className="font-bold text-primary">{summary.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-ivory dark:bg-wirdDarkBg rounded-full overflow-hidden border border-wirdBorder/60 dark:border-wirdDarkBorder/60">
              <div
                className="h-full bg-gradient-to-l from-primary to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${summary.percentage}%` }}
              />
            </div>
          </div>

          {/* Today's reading status inside plan */}
          {todaysAssignment && (
            <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-primary">ورد اليوم المقرر:</span>
                <p className="text-sm font-bold text-deepGreen dark:text-ivory mt-0.5">
                  اليوم {todaysAssignment.dayNumber}: من سورة {SURAHS_METADATA[todaysAssignment.start.surah - 1]?.name} ({todaysAssignment.start.verse}) إلى سورة {SURAHS_METADATA[todaysAssignment.end.surah - 1]?.name} ({todaysAssignment.end.verse})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDayCompletion(todaysAssignment.dayNumber, !todaysAssignment.isCompleted)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    todaysAssignment.isCompleted
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory border-wirdBorder hover:border-primary"
                  }`}
                >
                  {todaysAssignment.isCompleted ? "مكتمل ✓" : "تحديد كمكتمل"}
                </button>

                <Link
                  href={`/quran?surah=${todaysAssignment.start.surah}&verse=${todaysAssignment.start.verse}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white shadow-sm"
                >
                  اقرأ الآن
                </Link>
              </div>
            </div>
          )}

          {/* Assignments checklist table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-deepGreen dark:text-ivory">
              جدول أيام الختمة الكامل:
            </h3>

            <div className="max-h-72 overflow-y-auto divide-y divide-wirdBorder/40 dark:divide-wirdDarkBorder/40 border border-wirdBorder dark:border-wirdDarkBorder rounded-xl">
              {activePlan.assignments.map((assignment) => (
                <div
                  key={assignment.dayNumber}
                  className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                    assignment.isCompleted
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "bg-white dark:bg-wirdDarkSurface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleDayCompletion(assignment.dayNumber, !assignment.isCompleted)}
                      className="p-1 text-primary focus:outline-none"
                      title={assignment.isCompleted ? "إلغاء التحديد" : "تحديد كمكتمل"}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          assignment.isCompleted ? "text-primary" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                    <div>
                      <span className="font-bold text-deepGreen dark:text-ivory">
                        اليوم {assignment.dayNumber} ({assignment.date}):
                      </span>{" "}
                      <span className="text-wirdMuted dark:text-gray-400">
                        سورة {SURAHS_METADATA[assignment.start.surah - 1]?.name} ({assignment.start.verse}) - سورة {SURAHS_METADATA[assignment.end.surah - 1]?.name} ({assignment.end.verse})
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-wirdMuted dark:text-gray-400 font-semibold">
                    {assignment.count} {activePlan.unit === "verses" ? "آية" : activePlan.unit === "pages" ? "صفحة" : "جزء"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-8 text-center space-y-4">
          <Calendar className="w-12 h-12 text-primary mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-deepGreen dark:text-ivory">
            لا توجد خطة ختمة نشطة حالياً
          </h2>
          <p className="text-sm text-wirdMuted dark:text-gray-400 max-w-md mx-auto">
            يمكنك إنشاء خطة ختمة خلال ثوانٍ، وتحديد المدة التي تناسبك لمتابعة تقدمك يوماً بيوم.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-sm"
          >
            <span>إنشاء خطة جديدة الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Reading History & Bookmarks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarks card */}
        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 text-gold" />
              <h3 className="font-bold text-deepGreen dark:text-ivory">الإشارات المرجعية المحفوظة</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold font-bold">
              {state.bookmarks.length}
            </span>
          </div>

          {state.bookmarks.length === 0 ? (
            <p className="text-xs text-wirdMuted dark:text-gray-400 py-4 text-center">
              لم تحفظ أي إشارات مرجعية بعد. يمكنك حفظ أي آية بضغطة زر أثناء القراءة.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.bookmarks.slice(0, 4).map((bm) => (
                <Link
                  key={bm.id}
                  href={`/quran?surah=${bm.surah}&verse=${bm.verse}`}
                  className="block p-2.5 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 hover:border-primary/50 text-xs"
                >
                  <div className="flex justify-between font-bold text-deepGreen dark:text-ivory">
                    <span>سورة {bm.surahName}</span>
                    <span className="text-primary font-normal">الآية {bm.verse}</span>
                  </div>
                  {bm.note && <p className="text-[11px] text-wirdMuted dark:text-gray-400 mt-1 truncate">ملاحظة: {bm.note}</p>}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/quran"
            className="text-xs font-bold text-primary hover:underline block text-center pt-2"
          >
            فتح المصحف وعرض الإشارات
          </Link>
        </div>

        {/* Data Persistence & Backup Tools */}
        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-deepGreen dark:text-ivory">إدارة ونسخ بياناتك</h3>
          </div>
          <p className="text-xs text-wirdMuted dark:text-gray-400 leading-relaxed">
            بياناتك محفوظة محلياً في متصفحك. يمكنك تنزيل نسخة احتياطية بصيغة JSON، أو استرجاعها على جهاز أو متصفح آخر في أي وقت.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleExport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-ivory dark:bg-wirdDarkBg border border-wirdBorder dark:border-wirdDarkBorder text-deepGreen dark:text-ivory hover:border-primary shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>تصدير نسخة احتياطية</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-ivory dark:bg-wirdDarkBg border border-wirdBorder dark:border-wirdDarkBorder text-deepGreen dark:text-ivory hover:border-primary shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>استيراد ملف نسخة</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setIsClearConfirmOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح البيانات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recalculate Modal */}
      {isRecalculateOpen && activePlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-wirdDarkSurface w-full max-w-md rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-primary">
              <RotateCcw className="w-5 h-5" />
              <h2 className="text-base font-bold text-deepGreen dark:text-ivory">
                إعادة جدولة خطة الختمة
              </h2>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-300 leading-relaxed">
              ستتم إعادة توزيع ما تبقى من آيات القرآن انطلاقاً من موضع وقوفك الحالي (سورة {SURAHS_METADATA[lastPos.surah - 1]?.name} الآية {lastPos.verse})، دون المساس بما أنجزته سابقاً.
            </p>

            <div className="space-y-2">
              <label htmlFor="recalc-days-input" className="block text-xs font-bold text-deepGreen dark:text-ivory">
                عدد الأيام لإكمال المتبقي:
              </label>
              <input
                id="recalc-days-input"
                type="number"
                min={1}
                max={3650}
                value={recalcDays}
                onChange={(e) => setRecalcDays(parseInt(e.target.value, 10) || 1)}
                className="w-full p-2.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkBg text-sm font-semibold outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsRecalculateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-wirdMuted hover:bg-black/5 dark:hover:bg-white/5"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleRecalculate}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm"
              >
                تطبيق إعادة الجدولة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {isClearConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-wirdDarkSurface w-full max-w-md rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5" />
              <h2 className="text-base font-bold">تأكيد مسح كافة البيانات</h2>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-300 leading-relaxed">
              سيؤدي هذا الإجراء إلى حذف جميع الإشارات المرجعية، وخطط الختمات، ومواضع القراءة المحفوظة محلياً في متصفحك. لا يمكن التراجع عن هذا الإجراء إلا إذا كنت قد حمّلت ملف نسخة احتياطية مسبقاً.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-wirdMuted hover:bg-black/5 dark:hover:bg-white/5"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                مسح نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
