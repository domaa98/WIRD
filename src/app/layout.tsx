import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "وِرد | Wird — اجعل لك وردًا من القرآن",
  description: "منصة رقمية عربية هادئة ومجانية لتلاوة القرآن الكريم وتخطيط ختمات واقعية بمتابعة دقيقة وخصوصية تامة محلياً في متصفحك.",
  keywords: ["قرآن", "ختمة", "وِرد", "تلاوة", "مصحف", "مخطط ختمة", "تنزيل", "حفص"],
  authors: [{ name: "فريق وِرد" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#176B50",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-ivory dark:bg-wirdDarkBg text-deepGreen dark:text-ivory selection:bg-primary/20 selection:text-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 z-50 px-4 py-2 bg-primary text-white rounded-lg shadow-lg"
        >
          الانتقال إلى المحتوى الرئيسي
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
