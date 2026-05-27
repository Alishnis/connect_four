"use client";
import { useState } from "react";
import SkewButton from "@/components/vaporwave/SkewButton";
import ProModal from "./ProModal";

export default function ProSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-2xl mx-auto text-center" style={{ border: "2px solid #FF00FF", padding: "48px", boxShadow: "0 0 60px rgba(255,0,255,0.2)" }}>
          <div className="font-mono text-xs uppercase tracking-widest text-[#FF9900] mb-4">⚡ Limited Offer</div>
          <h2 className="font-heading font-black text-4xl mb-4 text-glow-magenta" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
            GO PRO
          </h2>
          <p className="font-mono text-[#E0E0E0]/70 mb-2">Unlock holographic disc skins, unlimited hints,</p>
          <p className="font-mono text-[#E0E0E0]/70 mb-8">full AI Coach on every match, and exclusive board themes.</p>
          <div className="font-heading font-black text-5xl mb-2 text-gradient" style={{ fontFamily: "Orbitron, sans-serif" }}>
            $3.99<span className="text-xl font-mono text-[#E0E0E0]/50">/mo</span>
          </div>
          <p className="font-mono text-sm text-[#E0E0E0]/40 mb-8">or $29/year — cancel anytime</p>
          <SkewButton variant="primary" className="!px-12 !py-4 !text-base" onClick={() => setOpen(true)}>
            Upgrade to Pro
          </SkewButton>
        </div>
      </section>
      <ProModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
