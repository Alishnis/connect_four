"use client";
import { motion, AnimatePresence } from "framer-motion";
import SkewButton from "@/components/vaporwave/SkewButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

const features = [
  { icon: "🎨", title: "Disc Skins", desc: "Neon · Holographic · Pixel · Glitch" },
  { icon: "🖼️", title: "Board Themes", desc: "Cyberpunk · Deep Space · Blood Moon" },
  { icon: "🧠", title: "Full AI Coach", desc: "Detailed analysis on every match" },
  { icon: "💡", title: "Unlimited Hints", desc: "No more 2-hint-per-game limit" },
  { icon: "🎬", title: "Match Replay", desc: "Watch any past game move by move" },
  { icon: "🏆", title: "Pro Badge", desc: "Stand out on the leaderboard" },
];

export default function ProModal({ open, onClose }: Props) {
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
                  <div className="font-mono text-xs uppercase tracking-widest text-[#FF9900] mb-1">⚡ Upgrade</div>
                  <h2 className="font-heading font-black text-4xl text-glow-magenta" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
                    GO PRO
                  </h2>
                </div>
                <button onClick={onClose} className="font-mono text-[#E0E0E0]/50 hover:text-[#FF00FF] text-xl transition-colors">✕</button>
              </div>
              <div className="font-heading font-black text-3xl mt-2 text-gradient" style={{ fontFamily: "Orbitron, sans-serif" }}>
                $3.99<span className="font-mono text-sm text-[#E0E0E0]/50 font-normal">/month</span>
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

            {/* CTA */}
            <div className="px-6 pb-6 space-y-3">
              <SkewButton variant="primary" className="w-full justify-center !py-4 !text-base">
                Upgrade to Pro — $3.99/mo
              </SkewButton>
              <div className="text-center font-mono text-xs text-[#E0E0E0]/40">
                or $29/year · Cancel anytime · Secure via Stripe
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
