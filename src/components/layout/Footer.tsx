import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, Heart, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-wirdBorder dark:border-wirdDarkBorder bg-white/70 dark:bg-wirdDarkSurface/60 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-ivory font-bold text-lg">
                و
              </div>
              <span className="text-xl font-bold text-deepGreen dark:text-ivory">وِرد | Wird</span>
            </div>
            <p className="text-sm text-wirdMuted dark:text-gray-400 max-w-md leading-relaxed">
              منصة رقمية مجانية تهدف إلى مساعدة المسلم على تلاوة القرآن الكريم بانتظام، وتخطيط ختمة ميسّرة وواقعية بدون إعلانات أو إشعارات مزعجة، مع الحفاظ التام على خصوصيتك بحفظ بياناتك على جهازك.
            </p>
            <div className="flex items-center gap-4 text-xs text-wirdMuted dark:text-gray-400 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                بياناتك محفوظة محلياً
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                مجاني وخالٍ تماماً من الإعلانات
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-deepGreen dark:text-ivory mb-3">
              روابط سريعة
            </h3>
            <ul className="space-y-2 text-sm text-wirdMuted dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/quran" className="hover:text-primary transition-colors">المصحف الشريف</Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-primary transition-colors">مخطط الختمة</Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-primary transition-colors">لوحة التقدم</Link>
              </li>
            </ul>
          </div>

          {/* Data Provenance & Trust */}
          <div>
            <h3 className="text-sm font-semibold text-deepGreen dark:text-ivory mb-3">
              مصدر النص والتوثيق
            </h3>
            <div className="space-y-2 text-xs text-wirdMuted dark:text-gray-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  نص القرآن الكريم برسم العثماني مُعتمد من مشكاة مشروع تنزيل (Tanzil.net) برواية حفص عن عاصم (العد الكوفي 6,236 آية)، بترخيص المشاع الإبداعي (CC BY 3.0).
                </span>
              </div>
              <div className="pt-2">
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  سياسة الخصوصية
                </Link>
                {" · "}
                <Link href="/about" className="text-primary hover:underline font-medium">
                  عن المشروع
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-wirdBorder dark:border-wirdDarkBorder flex flex-col sm:flex-row items-center justify-between text-xs text-wirdMuted dark:text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} منصة وِرد — اجعل لك وردًا من القرآن الكريم.</p>
          <p className="font-arabic">صدقة جارية نفع الله بها المسلمين في مشارق الأرض ومغاربها.</p>
        </div>
      </div>
    </footer>
  );
}
