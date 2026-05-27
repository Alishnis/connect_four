import Link from "next/link";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import SunOrb from "@/components/vaporwave/SunOrb";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";

export default function PlayPage() {
  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <SunOrb />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <h1 className="font-heading font-black text-5xl text-center mb-2 text-gradient" style={{ fontFamily: "Orbitron, sans-serif" }}>
          SELECT MODE
        </h1>
        <p className="font-mono text-center text-[#E0E0E0]/60 mb-12 uppercase tracking-widest text-sm">
          Choose your battlefield
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <GlowCard accentColor="magenta" className="text-center hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>VS AI</h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-6">Challenge our neural engine. Three difficulty levels.</p>
            <Link href="/play/ai">
              <SkewButton variant="primary" className="w-full justify-center">Play</SkewButton>
            </Link>
          </GlowCard>

          <GlowCard accentColor="cyan" className="text-center hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}>VS FRIEND</h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-6">Share a link. Duel in real-time across the globe.</p>
            <Link href="/play/lobby">
              <SkewButton variant="secondary" className="w-full justify-center">Create Room</SkewButton>
            </Link>
          </GlowCard>

          <GlowCard accentColor="magenta" className="text-center hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#FF9900", fontFamily: "Orbitron, sans-serif" }}>LOCAL</h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-6">Two players. One screen. Old school domination.</p>
            <Link href="/play/local">
              <SkewButton variant="outline" className="w-full justify-center">Play</SkewButton>
            </Link>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
