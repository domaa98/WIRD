import React from "react";
import Link from "next/link";
import {
  Info,
  Heart,
  ShieldCheck,
  Database,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Info className="w-3.5 h-3.5" />
          <span>عن منصة وِرد</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deepGreen dark:text-ivory font-arabic">
          رسالة وِرد ورؤيته
        </h1>
        <p className="text-base text-wirdMuted dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
          "اجعل لك وردًا من القرآن" — Your Quran, Your Time
        </p>
      </div>

      {/* Mission */}
      <section className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">رسالتنا</h2>
        </div>
        <p className="text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
          انطلقت منصة "وِرد" بهدف مساعدة كل مسلم ومسلمة على المحافظة على عهد يومي مبارك مع كتاب الله العزيز، من خلال واجهة هادئة خالية تماماً من الإعلانات والمشتتات، وتقديم أدوات ذكية لتخطيط الختمات القرآنية بمرونة تامة تناسب جدول الحياة اليومية دون ضغط نفسي أو شعور بالذنب.
        </p>
      </section>

      {/* Core Principles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">المبادئ الجوهرية لمنصة وِرد</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-2">
            <div className="flex items-center gap-2 font-bold text-deepGreen dark:text-ivory text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>مجاني تماماً وبلا إعلانات</span>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-400 leading-relaxed">
              المصحف الشريف وأدوات التخطيط والتقدم متاحة مجاناً لكافة المستخدمين للأبد دون أي اشتراكات أو نوافذ إعلانية.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-2">
            <div className="flex items-center gap-2 font-bold text-deepGreen dark:text-ivory text-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>الخصوصية أولاً (دون تسجيل دخول)</span>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-400 leading-relaxed">
              لا نطلب بياناتك الشخصية ولا نجمع سجلات تتبع لقراءاتك. بياناتك ومواضع قراءتك محفوظة محلياً في متصفحك.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-2">
            <div className="flex items-center gap-2 font-bold text-deepGreen dark:text-ivory text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>مرونة بلا شعور بالذنب</span>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-400 leading-relaxed">
              إذا فاتك يوم، لا نستخدم آليات التلاعب النفسي أو سلاسل المنافسة الدينية؛ بل يمكنك بضغطة زر إعادة جدولة خطتك بهدوء.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-wirdDarkSurface border border-wirdBorder dark:border-wirdDarkBorder space-y-2">
            <div className="flex items-center gap-2 font-bold text-deepGreen dark:text-ivory text-sm">
              <Database className="w-4 h-4 text-primary" />
              <span>نص قرآني موثق بالرسم العثماني</span>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-400 leading-relaxed">
              نعتمد النص القرآني الموثق من مشروع تنزيل العالمي برواية حفص عن عاصم (العد الكوفي 6,236 آية).
            </p>
          </div>
        </div>
      </section>

      {/* Provenance and Data Source */}
      <section className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">مصدر النص القرآني والتراخيص</h2>
        </div>
        <p className="text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
          النص القرآني المستخدم في وِرد مُستخرج بالكامل من مشروع تنزيل (Tanzil.net) وفق الرسم العثماني لمصحف المدينة النبوية، برواية حفص عن عاصم، وهو مرخص بموجب ترخيص المشاع الإبداعي (Creative Commons Attribution 3.0 Unported).
        </p>
        <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 text-xs text-wirdMuted dark:text-gray-400 space-y-1">
          <p className="font-semibold text-deepGreen dark:text-ivory">مواصفات النسخة المعتمدة:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>عدد السور: 114 سورة</li>
            <li>عدد الآيات: 6,236 آية (العد الكوفي المعتمد)</li>
            <li>عدد الصفحات: 604 صفحات (مطابقة لصفحات مصحف المدينة)</li>
            <li>عدد الأجزاء: 30 جزءاً شرعياً</li>
          </ul>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1 leading-relaxed">
          <p className="font-bold">تنويه شرعي وتوضيحي هام:</p>
          <p>
            موقع وِرد أداة تنظيمية رقمية لتيسير تلاوة القرآن ومتابعة الختمة، ولا يمثل جهة إفتاء أو بديلاً عن الرجوع لأهل العلم المعتبرين في الأحكام الفقهية وتفسير كتاب الله. كما أن جدول تقسيم الأوراد على الصلوات هو من باب التيسير وحسن تنظيم الوقت فقط، وليس حكماً شرعياً ملزماً.
          </p>
        </div>
      </section>

      {/* Feedback & Accessibility Reporting */}
      <section className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-3 shadow-sm">
        <h2 className="text-lg font-bold text-deepGreen dark:text-ivory">الإبلاغ عن الملاحظات أو إمكانية الوصول</h2>
        <p className="text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
          نحرص على أعلى معايير الدقة وإمكانية الوصول لجميع المستخدمين بما في ذلك مستخدمو قارئات الشاشة والتحكم بلوحة المفاتيح. إذا واجهت أي خطأ أو لديك اقتراح لتحسين التجربة، يسعدنا تواصلك معنا عبر مستودع المشروع البرمجي المفتوح.
        </p>
        <div className="pt-2">
          <Link
            href="/privacy"
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>الاطلاع على سياسة الخصوصية وحفظ البيانات</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
