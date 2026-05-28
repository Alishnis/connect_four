"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center font-mono text-xs uppercase tracking-wider">
      <motion.button
        onClick={() => setLocale("ru")}
        whileTap={{ scale: 0.9 }}
        className="px-2 py-1 cursor-pointer transition-colors"
        style={{
          color: locale === "ru" ? "#FF00FF" : "#E0E0E0",
          textShadow: locale === "ru" ? "0 0 8px #FF00FF" : "none",
        }}
      >
        RU
      </motion.button>
      <span className="text-[#2D1B4E]">|</span>
      <motion.button
        onClick={() => setLocale("en")}
        whileTap={{ scale: 0.9 }}
        className="px-2 py-1 cursor-pointer transition-colors"
        style={{
          color: locale === "en" ? "#00FFFF" : "#E0E0E0",
          textShadow: locale === "en" ? "0 0 8px #00FFFF" : "none",
        }}
      >
        EN
      </motion.button>
    </div>
  );
}
