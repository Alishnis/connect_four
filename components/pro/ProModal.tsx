"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
}

const features = [
  { icon: "🎨", title: "Скины дисков", desc: "Неон · Голограмма · Пиксель · Глитч" },
  { icon: "🖼️", title: "Темы доски", desc: "Киберпанк · Космос · Кровавая луна" },
  { icon: "🧠", title: "ИИ Тренер", desc: "Детальный разбор каждого матча" },
  { icon: "💡", title: "Безлимит подсказок", desc: "Без ограничения в 2 подсказки" },
  { icon: "🎬", title: "Повтор матчей", desc: "Пересмотри любую прошлую игру" },
  { icon: "🏆", title: "PRO значок", desc: "Выделяйся в рейтинге" },
];

export default function ProModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

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
                  <div className="font-mono text-xs uppercase tracking-widest text-[#FF9900] mb-1">⚡ Апгрейд</div>
                  <h2 className="font-heading font-black text-4xl text-glow-magenta" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
                    GO PRO
                  </h2>
                </div>
                <button onClick={onClose} className="font-mono text-[#E0E0E0]/50 hover:text-[#FF00FF] text-xl transition-colors cursor-pointer">✕</button>
              </div>
            </div>

            {/* Features grid */}
            <div className="p-6 grid grid-cols-2 gap-3">
              {features.map(f => (
                <div key={f.title} className="p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #2D1B4E" }}>
                  <div className="text-xl mb-1">{f.icon}</div>
                  <div className="font-mono text-xs font-bold text-[#00FFFF] uppercase tracking-wider">{f.title}</div>
                  <div className="font-mono text-xs text-[#E0E0E0]/50 mt-0.5">{f.desc}</div>
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
                {loading === "monthly" ? "Переход к оплате..." : "Подписка — $3.99/мес"}
              </SkewButton>
              <SkewButton
                variant="secondary"
                className="w-full justify-center !py-3 !text-sm"
                onClick={() => handleCheckout("yearly")}
                disabled={loading !== null}
              >
                {loading === "yearly" ? "Переход к оплате..." : "Годовая — $29/год (экономия 40%)"}
              </SkewButton>
              <div className="text-center font-mono text-xs text-[#E0E0E0]/40">
                Безопасная оплата через Stripe · Отмена в любое время
              </div>
              {!user && (
                <div className="text-center font-mono text-xs text-[#FF9900]">
                  ⚠ Войдите в аккаунт для оформления подписки
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
