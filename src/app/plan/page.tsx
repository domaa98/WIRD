"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Info,
} from "lucide-react";
import { useWirdState } from "@/lib/storage/useWirdState";
import {
  generateKhatmahPlan,
  reschedulePlan,
  distributeIntegerUnits,
  calculateProgressSummary,
} from "@/lib/planner/engine";
import { PlanUnit, KhatmahPlan } from "@/lib/planner/types";
import { SURAHS_METADATA } from "@/lib/quran/metadata";

function PlanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, savePlan, updatePosition, isMounted } = useWirdState();

  const durationParam = searchParams.get("duration");

  // Form State
  const [unit, setUnit] = useState<PlanUnit>("pages");
  const [targetDays, setTargetDays] = useState<number>(
    durationParam ? parseInt(durationParam, 10) : 30
  );
  const [customDays, setCustomDays] = useState<string>("");
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(5);
  const [sessionNamingType, setSessionNamingType] = useState<"prayers" | "numbers">("prayers");

  // Preview Plan
  const [previewPlan, setPreviewPlan] = useState<KhatmahPlan | null>(null);
  const [previewTabDay, setPreviewTabDay] = useState<number>(1);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activePlan = state.activePlan;

  // Generate preview whenever inputs change
  useEffect(() => {
    try {
      const days = isCustomDuration ? parseInt(customDays, 10) || 30 : targetDays;
      if (days >= 1 && days <= 3650) {
        const plan = generateKhatmahPlan({
          unit,
          targetDays: days,
          startDate,
          sessionsPerDay,
          sessionNamingType,
        });
        setPreviewPlan(plan);
      }
    } catch (err) {
      console.error("Preview generation error:", err);
    }
  }, [unit, targetDays, customDays, isCustomDuration, startDate, sessionsPerDay, sessionNamingType]);

  const handleSelectPresetDuration = (days: number) => {
    setIsCustomDuration(false);
    setTargetDays(days);
  };

  const handleSavePlan = () => {
    if (!previewPlan) return;
    savePlan(previewPlan);
    setSuccessToast("تم حفظ خطة الختمة بنجاح! نسأل الله لك التوفيق والقبول.");
    setTimeout(() => {
      setSuccessToast(null);
      router.push("/progress");
    }, 1800);
  };

  const handleResetPlan = () => {
    savePlan(null);
    setIsResetConfirmOpen(false);
    setSuccessToast("تمت إعادة ضبط الخطة بنجاح.");
    setTimeout(() => setSuccessToast(null), 2000);
  };

  const handleRescheduleActivePlan = () => {
    if (!activePlan) return;
    const rescheduled = reschedulePlan(
      activePlan,
      state.lastReadingPosition,
      activePlan.targetDays,
      new Date().toISOString().slice(0, 10)
    );
    savePlan(rescheduled);
    setSuccessToast("تمت إعادة جدولة خطتك بنجاح انطلاقاً من موضع وقوفك الحالي.");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const summary = activePlan ? calculateProgressSummary(activePlan) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-deepGreen text-white shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-fadeIn border border-gold/30">
          <Sparkles className="w-4 h-4 text-gold" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Calendar className="w-3.5 h-3.5" />
          <span>مخطط الختمة الذكي</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deepGreen dark:text-ivory font-arabic">
          خطّط لختمتك القرآنية
        </h1>
        <p className="text-sm sm:text-base text-wirdMuted dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          اختر الوتيرة المناسبة لظروفك، وقسّم وردك على مدار اليوم بعد الصلوات أو في أوقاتك المفضلة دون إرهاق.
        </p>
      </div>

      {/* If Active Plan Exists Banner */}
      {isMounted && activePlan && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-gold/10 dark:from-deepGreen/40 dark:to-wirdDarkSurface border border-primary/20 dark:border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary">لديك خطة نشطة حالياً</span>
            <h2 className="text-lg font-bold text-deepGreen dark:text-ivory">{activePlan.title}</h2>
            <p className="text-xs text-wirdMuted dark:text-gray-400">
              أنجزت {summary?.completedDaysCount || 0} من أصل {activePlan.targetDays} يوماً ({summary?.percentage || 0}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRescheduleActivePlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-wirdDarkSurface text-deepGreen dark:text-ivory border border-wirdBorder dark:border-wirdDarkBorder hover:border-primary shadow-sm"
              title="إعادة جدولة باقي الأيام وفق موضع وقوفك الحالي دون فقدان ما أنجزته"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>إعادة جدولة الختمة</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <span>إنهاء / إعادة ضبط</span>
            </button>
          </div>
        </div>
      )}

      {/* Plan Creation Form */}
      <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-8 shadow-card">
        {/* Step 1: Unit selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-deepGreen dark:text-ivory">
            1. وحدة تقسيم الختمة المفضلة:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "pages" as PlanUnit, label: "بالصفحات (مصحف المدينة)", desc: "604 صفحة — الأكثر توازناً في القراءة" },
              { id: "verses" as PlanUnit, label: "بالآيات", desc: "6,236 آية — توزيع دقيق بعدد الآيات" },
              { id: "juz" as PlanUnit, label: "بالأجزاء", desc: "30 جزءاً — التقسيم الكلاسيكي للقرآن" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setUnit(item.id)}
                className={`p-4 rounded-xl border text-right transition-all ${
                  unit === item.id
                    ? "border-primary bg-primary/5 dark:bg-primary/20 text-deepGreen dark:text-white shadow-sm ring-1 ring-primary"
                    : "border-wirdBorder dark:border-wirdDarkBorder bg-ivory/50 dark:bg-wirdDarkBg/50 text-wirdMuted dark:text-gray-400 hover:border-primary/50"
                }`}
              >
                <div className="font-bold text-sm text-deepGreen dark:text-ivory">{item.label}</div>
                <div className="text-xs text-wirdMuted dark:text-gray-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Duration selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-deepGreen dark:text-ivory">
            2. مدة الختمة المستهدفة:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {[7, 15, 30, 60, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handleSelectPresetDuration(days)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  !isCustomDuration && targetDays === days
                    ? "bg-primary text-white shadow-sm"
                    : "bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-gray-300 border border-wirdBorder dark:border-wirdDarkBorder hover:border-primary/50"
                }`}
              >
                {days} يوماً
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomDuration(true)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isCustomDuration
                  ? "bg-primary text-white shadow-sm"
                  : "bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-gray-300 border border-wirdBorder dark:border-wirdDarkBorder hover:border-primary/50"
              }`}
            >
              مدة مخصصة...
            </button>
          </div>

          {isCustomDuration && (
            <div className="pt-2 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={3650}
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="أدخل عدد الأيام (مثلاً: 45)"
                className="w-48 p-2.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkBg text-sm font-semibold focus:border-primary outline-none"
              />
              <span className="text-xs text-wirdMuted dark:text-gray-400">يوماً (من 1 إلى 3650)</span>
            </div>
          )}
        </div>

        {/* Step 3: Daily Sessions breakdown */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-deepGreen dark:text-ivory">
            3. توزيع الورد اليومي على جلسات:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-wirdMuted dark:text-gray-400 block mb-1.5">عدد الجلسات اليومية:</span>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((sCount) => (
                  <button
                    key={sCount}
                    type="button"
                    onClick={() => setSessionsPerDay(sCount)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      sessionsPerDay === sCount
                        ? "bg-primary text-white border-primary"
                        : "bg-ivory dark:bg-wirdDarkBg border-wirdBorder dark:border-wirdDarkBorder text-deepGreen dark:text-gray-300 hover:border-primary/40"
                    }`}
                  >
                    {sCount === 1 ? "جلسة واحدة" : sCount === 5 ? "5 جلسات (بعد الصلوات)" : `${sCount} جلسات`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-wirdMuted dark:text-gray-400 block mb-1.5">تسمية الجلسات:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSessionNamingType("prayers")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    sessionNamingType === "prayers"
                      ? "bg-primary text-white border-primary"
                      : "bg-ivory dark:bg-wirdDarkBg border-wirdBorder dark:border-wirdDarkBorder text-deepGreen dark:text-gray-300 hover:border-primary/40"
                  }`}
                >
                  أسماء الصلوات المفروضة
                </button>
                <button
                  type="button"
                  onClick={() => setSessionNamingType("numbers")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    sessionNamingType === "numbers"
                      ? "bg-primary text-white border-primary"
                      : "bg-ivory dark:bg-wirdDarkBg border-wirdBorder dark:border-wirdDarkBorder text-deepGreen dark:text-gray-300 hover:border-primary/40"
                  }`}
                >
                  جلسات مرقمة
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Start Date */}
        <div className="space-y-2">
          <label htmlFor="start-date-input" className="block text-sm font-bold text-deepGreen dark:text-ivory">
            4. تاريخ بداية الخطة:
          </label>
          <input
            id="start-date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2.5 rounded-xl border border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkBg text-sm font-semibold focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Plan Preview Section */}
      {previewPlan && (
        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wirdBorder dark:border-wirdDarkBorder pb-4">
            <div>
              <span className="text-xs font-semibold text-primary">معاينة الخطة قبل الاعتماد</span>
              <h2 className="text-xl font-bold text-deepGreen dark:text-ivory mt-0.5">
                {previewPlan.title}
              </h2>
              <p className="text-xs text-wirdMuted dark:text-gray-400">
                من {previewPlan.startDate} إلى {previewPlan.endDate} ({previewPlan.targetDays} يوماً)
              </p>
            </div>

            <button
              onClick={handleSavePlan}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-white bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>اعتماد وحفظ الخطة</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-ivory dark:bg-wirdDarkBg rounded-xl border border-wirdBorder/60 dark:border-wirdDarkBorder/60">
              <span className="text-[11px] text-wirdMuted dark:text-gray-400">معدل الورد اليومي</span>
              <p className="text-base font-bold text-deepGreen dark:text-ivory mt-0.5">
                ~ {previewPlan.assignments[0]?.count}{" "}
                {unit === "verses" ? "آية" : unit === "pages" ? "صفحة" : "جزء"}
              </p>
            </div>

            <div className="p-3 bg-ivory dark:bg-wirdDarkBg rounded-xl border border-wirdBorder/60 dark:border-wirdDarkBorder/60">
              <span className="text-[11px] text-wirdMuted dark:text-gray-400">عدد الأيام</span>
              <p className="text-base font-bold text-deepGreen dark:text-ivory mt-0.5">
                {previewPlan.targetDays} يوماً
              </p>
            </div>

            <div className="p-3 bg-ivory dark:bg-wirdDarkBg rounded-xl border border-wirdBorder/60 dark:border-wirdDarkBorder/60">
              <span className="text-[11px] text-wirdMuted dark:text-gray-400">الجلسات اليومية</span>
              <p className="text-base font-bold text-deepGreen dark:text-ivory mt-0.5">
                {previewPlan.sessionsPerDay} {previewPlan.sessionsPerDay === 1 ? "جلسة" : "جلسات"}
              </p>
            </div>

            <div className="p-3 bg-ivory dark:bg-wirdDarkBg rounded-xl border border-wirdBorder/60 dark:border-wirdDarkBorder/60">
              <span className="text-[11px] text-wirdMuted dark:text-gray-400">تاريخ الختم المتوقع</span>
              <p className="text-base font-bold text-primary mt-0.5">
                {previewPlan.endDate}
              </p>
            </div>
          </div>

          {/* Schedule Preview sample days */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-deepGreen dark:text-ivory">
              جدول الأيام الأولى من الختمة:
            </h3>

            <div className="divide-y divide-wirdBorder/50 dark:divide-wirdDarkBorder/50 border border-wirdBorder dark:border-wirdDarkBorder rounded-xl overflow-hidden">
              {previewPlan.assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.dayNumber}
                  className="p-4 bg-ivory/40 dark:bg-wirdDarkBg/40 hover:bg-ivory dark:hover:bg-wirdDarkBg transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary">
                      اليوم {assignment.dayNumber} ({assignment.date})
                    </span>
                    <span className="text-wirdMuted dark:text-gray-400">
                      {assignment.count} {unit === "verses" ? "آية" : unit === "pages" ? "صفحة" : "جزء"}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-deepGreen dark:text-ivory">
                    من سورة {SURAHS_METADATA[assignment.start.surah - 1]?.name} (الآية {assignment.start.verse}) إلى سورة {SURAHS_METADATA[assignment.end.surah - 1]?.name} (الآية {assignment.end.verse})
                  </p>

                  {/* Sessions preview */}
                  {assignment.sessions && assignment.sessions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {assignment.sessions.map((sess) => (
                        <span
                          key={sess.id}
                          className="px-2 py-0.5 rounded-lg text-[11px] bg-white dark:bg-wirdDarkSurface text-deepGreen/80 dark:text-gray-300 border border-wirdBorder/70 dark:border-wirdDarkBorder/70"
                        >
                          {sess.name}: {sess.count} {unit === "verses" ? "آية" : "صفحة"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {previewPlan.assignments.length > 5 && (
              <p className="text-xs text-center text-wirdMuted dark:text-gray-400 pt-1">
                ... والمزيد حتى اليوم {previewPlan.targetDays} (تغطية تامة لكافة آيات وصفحات القرآن بدون تكرار أو نقص).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-wirdDarkSurface w-full max-w-md rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-base font-bold">تأكيد إعادة ضبط الخطة</h2>
            </div>
            <p className="text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف الخطة الحالية؟ لن تُحذف إشاراتك المرجعية أو موضع قراءتك، ولكن ستتم تصفية جدول الخطة الحالي للبدء من جديد.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-wirdMuted hover:bg-black/5 dark:hover:bg-white/5"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleResetPlan}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <PlanPageContent />
    </Suspense>
  );
}
