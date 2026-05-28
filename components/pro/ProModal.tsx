"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const featureKeys = [
  { icon: "🎨", titleKey: "pro.feat1", descKey: "pro.feat1.desc" },
  { icon: "🖼️", titleKey: "pro.feat2", descKey: "pro.feat2.desc" },
  { icon: "🧠", titleKey: "pro.feat3", descKey: "pro.feat3.desc" },
  { icon: "💡", titleKey: "pro.feat4", descKey: "pro.feat4.desc" },
  { icon: "🎬", titleKey: "pro.feat5", descKey: "pro.feat5.desc" },
  { icon: "🏆", titleKey: "pro.feat6", descKey: "pro.feat6.desc" },
];

export default function ProModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const { t } = useLanguage();

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user?.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(9,0,20,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg"
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(26,16,60,0.98)",
              border: "2px solid #FF00FF",
              boxShadow: "0 0 80px rgba(255,0,255,0.3)",
            }}
          >
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-[#FF9900] mb-1">{t("pro.upgrade")}</div>
                  <h2 className="font-heading font-black text-4xl text-glow-magenta" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
                    {t("pro.title")}
                  </h2>
                </div>
                <button onClick={onClose} className="font-mono text-[#E0E0E0]/50 hover:text-[#FF00FF] text-xl transition-colors cursor-pointer">✕</button>
              </div>
            </div>

            {/* Features grid */}
            <div className="p-6 grid grid-cols-2 gap-3">
              {featureKeys.map(f => (
                <div key={f.titleKey} className="p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2D1B4E" }}>
                  <div className="text-xl mb-1">{f.icon}</div>
                  <div className="font-mono text-xs font-bold text-[#00FFFF] uppercase tracking-wider">{t(f.titleKey)}</div>
                  <div className="font-mono text-xs text-[#E0E0E0]/50 mt-0.5">{t(f.descKey)}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="px-6 pb-6 space-y-3">
              <SkewButton
                variant="primary"
                className="w-full justify-center !py-4 !text-base"
                onClick={() => handleCheckout("monthly")}
                disabled={loading !== null}
              >
                {loading === "monthly" ? t("pro.processing") : t("pro.monthly")}
              </SkewButton>
              <SkewButton
                variant="secondary"
                className="w-full justify-center !py-3 !text-sm"
                onClick={() => handleCheckout("yearly")}
                disabled={loading !== null}
              >
                {loading === "yearly" ? t("pro.processing") : t("pro.yearly")}
              </SkewButton>
              <div className="text-center font-mono text-xs text-[#E0E0E0]/40">
                {t("pro.safe")}
              </div>
              {!user && (
                <div className="text-center font-mono text-xs text-[#FF9900]">
                  {t("pro.loginRequired")}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
