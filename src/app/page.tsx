"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  BookMarked,
  RotateCcw,
} from "lucide-react";
import { useWirdState } from "@/lib/storage/useWirdState";
import { SURAHS_METADATA } from "@/lib/quran/metadata";
import { calculateProgressSummary } from "@/lib/planner/engine";

export default function HomePage() {
  const { state, toggleDayCompletion, isMounted } = useWirdState();
  const [selectedPreviewDuration, setSelectedPreviewDuration] = useState<number>(30);

  const activePlan = state.activePlan;
  const lastPos = state.lastReadingPosition;
  const lastSurahMeta = lastPos ? SURAHS_METADATA[lastPos.surah - 1] : null;

  // Find today's assignment in active plan
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAssignment = activePlan?.assignments.find((a) => a.date === todayStr) ||
    activePlan?.assignments.find((a) => !a.isCompleted) ||
    activePlan?.assignments[0];

  const planSummary = activePlan ? calculateProgressSummary(activePlan, todayStr) : null;

  // Mini preview calculations
  const previewDailyVerses = Math.ceil(6236 / selectedPreviewDuration);
  const previewDailyPages = Math.ceil(604 / selectedPreviewDuration);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 border-b border-wirdBorder/60 dark:border-wirdDarkBorder/60 bg-gradient-to-b from-primary/5 via-ivory to-ivory dark:from-deepGreen/20 dark:via-wirdDarkBg dark:to-wirdDarkBg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-300 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>اجعل لك عهدًا يوميًا مع كلام الله</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-deepGreen dark:text-ivory leading-tight font-arabic">
            اجعل لك <span className="text-primary underline decoration-gold/50 decoration-wavy decoration-2">وِردًا</span> من القرآن
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-wirdMuted dark:text-gray-300 leading-relaxed font-normal">
            منصة عربية هادئة تُعينك على تلاوة كتاب الله وتدبره، وتخطيط ختمة قرآنية متوازنة تناسب وقتك وظروفك، بلا إعلانات ولا مشتتات، وبحفظ كامل لخصوصيتك.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/quran"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span>ابدأ القراءة</span>
            </Link>

            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-deepGreen dark:text-ivory bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder hover:bg-ivory dark:hover:bg-white/5 shadow-sm transition-all"
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span>خطّط ختمتك</span>
            </Link>
          </div>

          {/* Quick Resume Pill if user already has reading history */}
          {isMounted && lastPos && (
            <div className="pt-2">
              <Link
                href={`/quran?surah=${lastPos.surah}&verse=${lastPos.verse}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-wirdMuted dark:text-gray-400 bg-white/70 dark:bg-wirdDarkSurface/70 border border-wirdBorder dark:border-wirdDarkBorder hover:border-primary/50 transition-colors"
              >
                <BookMarked className="w-3.5 h-3.5 text-gold" />
                <span>آخر ما قرأت: سورة {lastSurahMeta?.name || "الفاتحة"} (الآية {lastPos.verse})</span>
                <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Daily Reading Card Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-10 w-full">
        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder shadow-card p-6 sm:p-8 transition-colors">
          {activePlan && todaysAssignment ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wirdBorder dark:border-wirdDarkBorder pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    ورد اليوم · اليوم {todaysAssignment.dayNumber} من {activePlan.targetDays}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-deepGreen dark:text-ivory mt-1">
                    {todaysAssignment.start.surah === todaysAssignment.end.surah ? (
                      <>
                        سورة {SURAHS_METADATA[todaysAssignment.start.surah - 1]?.name} (الآيات {todaysAssignment.start.verse} - {todaysAssignment.end.verse})
                      </>
                    ) : (
                      <>
                        من سورة {SURAHS_METADATA[todaysAssignment.start.surah - 1]?.name} ({todaysAssignment.start.verse}) إلى سورة {SURAHS_METADATA[todaysAssignment.end.surah - 1]?.name} ({todaysAssignment.end.verse})
                      </>
                    )}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => toggleDayCompletion(todaysAssignment.dayNumber, !todaysAssignment.isCompleted)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      todaysAssignment.isCompleted
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                        : "bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-gray-300 border border-wirdBorder dark:border-wirdDarkBorder hover:border-primary"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${todaysAssignment.isCompleted ? "text-primary" : "text-gray-400"}`} />
                    <span>{todaysAssignment.isCompleted ? "تم إنجاز الورد" : "تحديد كمُنجز"}</span>
                  </button>

                  <Link
                    href={`/quran?surah=${todaysAssignment.start.surah}&verse=${todaysAssignment.start.verse}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>اقرأ الورد</span>
                  </Link>
                </div>
              </div>

              {/* Progress metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/70 dark:border-wirdDarkBorder/70">
                  <span className="text-xs text-wirdMuted dark:text-gray-400">مقدار ورد اليوم</span>
                  <p className="text-lg font-bold text-deepGreen dark:text-ivory mt-0.5">
                    {todaysAssignment.count} {todaysAssignment.unit === "verses" ? "آية" : todaysAssignment.unit === "pages" ? "صفحة" : "جزء"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/70 dark:border-wirdDarkBorder/70">
                  <span className="text-xs text-wirdMuted dark:text-gray-400">إنجاز الختمة</span>
                  <p className="text-lg font-bold text-primary mt-0.5">
                    {planSummary?.percentage || 0}%
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/70 dark:border-wirdDarkBorder/70">
                  <span className="text-xs text-wirdMuted dark:text-gray-400">الأيام المكتملة</span>
                  <p className="text-lg font-bold text-deepGreen dark:text-ivory mt-0.5">
                    {planSummary?.completedDaysCount || 0} من {activePlan.targetDays}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/70 dark:border-wirdDarkBorder/70">
                  <span className="text-xs text-wirdMuted dark:text-gray-400">المتبقي للختم</span>
                  <p className="text-lg font-bold text-deepGreen dark:text-ivory mt-0.5">
                    {planSummary?.remainingItems || 0} {activePlan.unit === "verses" ? "آية" : activePlan.unit === "pages" ? "صفحة" : "جزء"}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-wirdMuted dark:text-gray-400">
                  <span>نسبة الإنجاز الإجمالية</span>
                  <span className="font-semibold text-deepGreen dark:text-ivory">{planSummary?.percentage || 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-ivory dark:bg-wirdDarkBg rounded-full overflow-hidden border border-wirdBorder/60 dark:border-wirdDarkBorder/60">
                  <div
                    className="h-full bg-gradient-to-l from-primary to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${planSummary?.percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-xl font-bold text-deepGreen dark:text-ivory">
                  لم تحدد خطة ختمة بعد
                </h3>
                <p className="text-sm text-wirdMuted dark:text-gray-400 leading-relaxed">
                  أنشئ خطتك المخصصة الآن في أقل من دقيقة واختر المدة المناسبة لك سواء في 30 أو 60 يومًا أو أي مدة تفضلها.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-sm"
                >
                  <span>إنشاء خطة قراءة جديدة</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Khatmah Planning Preview Calculator */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-deepGreen dark:text-ivory">
            كم يستغرق ختم القرآن معك؟
          </h2>
          <p className="text-sm sm:text-base text-wirdMuted dark:text-gray-400 max-w-xl mx-auto">
            جرّب حاسبة الختمة السريعة لتتعرف على الورد اليومي المقترح بحسب الأيام التي تناسب جدولك.
          </p>
        </div>

        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[7, 15, 30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPreviewDuration(days)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedPreviewDuration === days
                    ? "bg-primary text-white shadow-sm"
                    : "bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 border border-wirdBorder dark:border-wirdDarkBorder"
                }`}
              >
                ختمة في {days} يوم
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder dark:border-wirdDarkBorder text-center space-y-2">
              <span className="text-xs text-wirdMuted dark:text-gray-400 font-medium">الورد اليومي بالصفحات</span>
              <div className="text-3xl font-extrabold text-primary">
                ~ {previewDailyPages} <span className="text-base font-normal text-deepGreen dark:text-ivory">صفحة يومياً</span>
              </div>
              <p className="text-xs text-wirdMuted dark:text-gray-400">
                (يعادل تقريباً {Math.ceil(previewDailyPages / 5)} صفحات بعد كل صلاة مفروضة)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder dark:border-wirdDarkBorder text-center space-y-2">
              <span className="text-xs text-wirdMuted dark:text-gray-400">الورد اليومي بالآيات</span>
              <div className="text-3xl font-extrabold text-deepGreen dark:text-ivory">
                ~ {previewDailyVerses} <span className="text-base font-normal text-wirdMuted dark:text-gray-400">آية يومياً</span>
              </div>
              <p className="text-xs text-wirdMuted dark:text-gray-400">
                (حساب دقيق لجميع آيات القرآن البالغة 6,236 آية)
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href={`/plan?duration=${selectedPreviewDuration}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <span>اعتماد هذه الخطة وتخصيص أوقات القراءة</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights: Why Wird? */}
      <section className="py-16 bg-white/50 dark:bg-wirdDarkSurface/40 border-y border-wirdBorder/60 dark:border-wirdDarkBorder/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-deepGreen dark:text-ivory">
              لماذا وِرد؟
            </h2>
            <p className="text-sm sm:text-base text-wirdMuted dark:text-gray-400 max-w-xl mx-auto">
              صُممت منصة وِرد بعناية فائقة لتوفر بيئة عبادة هادئة تعينك على الاستمرار دون ضغط نفسي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-deepGreen dark:text-ivory">
                خصوصية تامة ومحلية
              </h3>
              <p className="text-sm text-wirdMuted dark:text-gray-400 leading-relaxed">
                لا نطلب منك بريداً إلكترونياً أو تسجيلاً للدخول. جميع بيانات قراءتك وختماتك وإشاراتك المرجعية تُحفظ حصراً داخل متصفحك.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-deepGreen dark:text-ivory">
                مرونة بلا شعور بالذنب
              </h3>
              <p className="text-sm text-wirdMuted dark:text-gray-400 leading-relaxed">
                إن فاتك يوم أو انشغلت، لن ترى تنبيهات لوم أو خسارة سلاسل وهمية؛ بل يمكنك بضغطة زر إعادة جدولة خطتك انطلاقاً من موضع وقوفك الحالي.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-deepGreen dark:text-ivory">
                نص قرآني موثق ودقيق
              </h3>
              <p className="text-sm text-wirdMuted dark:text-gray-400 leading-relaxed">
                نستخدم النص العثماني المعتمد من مشروع تنزيل (Tanzil.net) وفق رواية حفص عن عاصم بالعد الكوفي (6,236 آية)، مع تدقيق كامل لسلامة الترتيب والآيات.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
