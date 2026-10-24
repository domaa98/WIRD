"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, BarChart3, Info, Shield, Menu, X, BookMarked } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useWirdState } from "@/lib/storage/useWirdState";
import { SURAHS_METADATA } from "@/lib/quran/metadata";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: null },
  { href: "/quran", label: "المصحف", icon: BookOpen },
  { href: "/plan", label: "خطتي", icon: Calendar },
  { href: "/progress", label: "تقدمي", icon: BarChart3 },
  { href: "/about", label: "عن وِرد", icon: Info },
  { href: "/privacy", label: "الخصوصية", icon: Shield },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, isMounted } = useWirdState();

  const lastPos = state.lastReadingPosition;
  const lastSurahName = isMounted && lastPos
    ? SURAHS_METADATA[lastPos.surah - 1]?.name || "الفاتحة"
    : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-wirdBorder dark:border-wirdDarkBorder bg-ivory/90 dark:bg-wirdDarkBg/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-deepGreen flex items-center justify-center text-ivory font-bold text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                <span>و</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-deepGreen dark:text-ivory leading-none">
                  وِرد
                </span>
                <span className="text-[11px] text-wirdMuted dark:text-gray-400 mt-1 font-medium hidden sm:inline">
                  اجعل لك وردًا من القرآن
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white font-semibold"
                      : "text-deepGreen/80 dark:text-gray-300 hover:text-deepGreen hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Resume reading + Theme toggle + Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Resume Button */}
            {isMounted && lastPos && (
              <Link
                href={`/quran?surah=${lastPos.surah}&verse=${lastPos.verse}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary-hover shadow-sm transition-all"
                title={`متابعة القراءة: سورة ${lastSurahName} الآية ${lastPos.verse}`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>تابع: سورة {lastSurahName}</span>
              </Link>
            )}

            <ThemeToggle />

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden p-2 rounded-xl text-deepGreen dark:text-ivory hover:bg-black/5 dark:hover:bg-white/10"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-wirdBorder dark:border-wirdDarkBorder bg-ivory dark:bg-wirdDarkBg px-4 pt-2 pb-6 space-y-1.5 animate-fadeIn">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-deepGreen dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {Icon && <Icon className="w-5 h-5 opacity-80" />}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isMounted && lastPos && (
            <div className="pt-3 border-t border-wirdBorder dark:border-wirdDarkBorder">
              <Link
                href={`/quran?surah=${lastPos.surah}&verse=${lastPos.verse}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary text-white shadow-sm"
              >
                <BookMarked className="w-4 h-4" />
                <span>متابعة القراءة: سورة {lastSurahName} (الآية {lastPos.verse})</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
