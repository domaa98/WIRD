import React from "react";
import Link from "next/link";
import { Shield, Lock, Server, Trash2, Download, HardDrive, Check } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Shield className="w-3.5 h-3.5" />
          <span>الخصوصية وأمان البيانات</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deepGreen dark:text-ivory font-arabic">
          سياسة الخصوصية وحفظ البيانات
        </h1>
        <p className="text-base text-wirdMuted dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
          نؤمن بأن قراءة كتاب الله عبادة جليلة تستوجب أقصى درجات الطمأنينة واحترام خصوصية المسلم.
        </p>
      </div>

      {/* Main Privacy Guarantee */}
      <section className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">تخزين محلي 100% افتراضياً</h2>
        </div>
        <p className="text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
          تعمل منصة "وِرد" افتراضياً بدون الحاجة إلى إنشاء حساب أو تسجيل بريدك الإلكتروني أو كلمة مرور. جميع بياناتك ومواضع قراءتك وخطط ختمتك وإشاراتك المرجعية تُحفظ حصراً داخل متصفحك (Browser LocalStorage) ولا يتم إرسالها إلى خوادمنا إطلاقاً.
        </p>
      </section>

      {/* Details Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">تفاصيل البيانات المخزنة واستخدامها</h2>

        <div className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder overflow-hidden shadow-sm">
          <div className="divide-y divide-wirdBorder/60 dark:divide-wirdDarkBorder/60 text-xs sm:text-sm">
            <div className="p-4 sm:p-5 space-y-1">
              <span className="font-bold text-deepGreen dark:text-ivory">1. موضع القراءة الأخير (Last Reading Position)</span>
              <p className="text-wirdMuted dark:text-gray-400">
                رقم السورة والآية والصفحة التي وقفت عندها لمساعدتك على استئناف القراءة فور عودتك للموقع.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-1">
              <span className="font-bold text-deepGreen dark:text-ivory">2. خطة الختمة وأيام الإنجاز (Khatmah Plan)</span>
              <p className="text-wirdMuted dark:text-gray-400">
                المدة التي اخترتها (مثلاً 30 أو 60 يوماً)، وتاريخ البدء، والأيام التي قمت بتحديدها كمكتملة لحساب نسبة الإنجاز والورد اليومي.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-1">
              <span className="font-bold text-deepGreen dark:text-ivory">3. الإشارات المرجعية والملاحظات (Bookmarks & Notes)</span>
              <p className="text-wirdMuted dark:text-gray-400">
                الآيات التي تحفظها كإشارة مرجعية، والملاحظات التدبرية الشخصية التي تدونها لنفسك.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-1">
              <span className="font-bold text-deepGreen dark:text-ivory">4. تفضيلات العرض (UI Preferences)</span>
              <p className="text-wirdMuted dark:text-gray-400">
                حجم خط المصحف المفضل، واختيار المظهر (الفاتح أو الداكن)، وعرض صفحة القراءة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics and Third-party services */}
      <section className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">الخدمات الخارجية وملفات التتبع</h2>
        <div className="space-y-3 text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p><strong>لا توجد إعلانات:</strong> المنصة خالية 100% من أي شبكات إعلانية أو إعلانات مدفوعة.</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p><strong>لا توجد ملفات تعريف ارتباط للتعقب:</strong> لا نستخدم أدوات تعقب سلوكي أو بيع للبيانات أو ملفات تعريف ارتباط خارجية للرصد.</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p><strong>استقلالية النص القرآني:</strong> النص القرآني الكريم مستضاف ومُضمّن محلياً مع ملفات المنصة، مما يعني أن قراءتك لا تعتمد على طلبات متكررة لخوادم خارجية وتعمل بكفاءة وسرعة فائقة.</p>
          </div>
        </div>
      </section>

      {/* How to erase or export */}
      <section className="bg-white dark:bg-wirdDarkSurface rounded-2xl border border-wirdBorder dark:border-wirdDarkBorder p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-deepGreen dark:text-ivory">حقوقك: التصدير والاسترجاع والمسح</h2>
        </div>
        <p className="text-sm text-wirdMuted dark:text-gray-300 leading-relaxed">
          أنت تملك بياناتك بالكامل. توفر لك منصة وِرد من خلال صفحة <Link href="/progress" className="text-primary font-bold hover:underline">تقدمي</Link> إمكانية:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 space-y-1">
            <div className="flex items-center gap-2 font-bold text-deepGreen dark:text-ivory text-xs">
              <Download className="w-4 h-4 text-primary" />
              <span>تصدير نسخة احتياطية (JSON)</span>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-400">
              تنزيل ملف يحتوي على كافة ختماتك ومواضع قراءتك لنقلها إلى هاتف أو حاسوب آخر.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ivory dark:bg-wirdDarkBg border border-wirdBorder/60 dark:border-wirdDarkBorder/60 space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-600 text-xs">
              <Trash2 className="w-4 h-4" />
              <span>مسح البيانات نهائياً</span>
            </div>
            <p className="text-xs text-wirdMuted dark:text-gray-400">
              حذف كافة السجلات المخزنة محلياً في متصفحك بضغطة زر بعد تأكيدك الصريح.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
