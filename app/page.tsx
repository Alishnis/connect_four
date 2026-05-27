import Link from "next/link";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import SunOrb from "@/components/vaporwave/SunOrb";
import SkewButton from "@/components/vaporwave/SkewButton";
import GlowCard from "@/components/vaporwave/GlowCard";
import ProSection from "@/components/pro/ProSection";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <PerspectiveGrid />
      <SunOrb />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 border border-[#FF00FF]/40 px-4 py-2 font-mono text-xs uppercase tracking-widest" style={{ color: "#FF00FF" }}>
          <span className="w-2 h-2 rounded-full bg-[#FF00FF] animate-pulse inline-block" />
          1,204 games played today · Top city: Almaty
        </div>

        {/* Main title */}
        <h1 className="font-heading font-black leading-none mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>
          <span className="block text-6xl sm:text-8xl lg:text-9xl text-gradient">
            CONNECT
          </span>
          <span className="block text-6xl sm:text-8xl lg:text-9xl text-gradient">
            FOUR
          </span>
        </h1>

        <p className="font-mono text-lg sm:text-xl text-[#E0E0E0]/70 mb-10 max-w-md uppercase tracking-widest">
          Drop your line.<br />Dominate the grid.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/play">
            <SkewButton variant="primary" className="!px-10 !py-4 !text-base">
              Play Now
            </SkewButton>
          </Link>
          <Link href="/leaderboard">
            <SkewButton variant="secondary" className="!px-10 !py-4 !text-base">
              Leaderboard
            </SkewButton>
          </Link>
        </div>

        {/* Mini board preview decoration */}
        <div className="grid grid-cols-7 gap-1 opacity-20 pointer-events-none">
          {Array.from({ length: 42 }, (_, i) => {
            const colors = [0,0,0,1,0,0,0, 0,0,1,2,0,0,0, 0,1,2,1,2,0,0, 1,2,1,2,1,2,0, 2,1,2,1,2,1,2, 1,2,1,2,1,2,1];
            const v = colors[i];
            return (
              <div key={i} className="rounded-full" style={{
                width: 28, height: 28,
                background: v === 0 ? "rgba(255,255,255,0.05)" : v === 1 ? "#FF2D78" : "#00CCFF",
                boxShadow: v === 1 ? "0 0 6px #FF00FF" : v === 2 ? "0 0 6px #00FFFF" : "none",
              }} />
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-black text-4xl text-center mb-16 text-glow-cyan" style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}>
            WHY NEONGRID?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: "🤖", title: "AI COACH", desc: "Post-game analysis reveals your blunders, missed forks, and optimal lines. Level up your strategy.", color: "cyan" as const },
              { icon: "⚡", title: "REALTIME DUEL", desc: "Share a link, play anywhere. WebSocket sync under 50ms. No lag, no excuses.", color: "magenta" as const },
              { icon: "🏆", title: "CITY GLORY", desc: "Climb the global leaderboard. Represent your city. Conquer the grid.", color: "cyan" as const },
            ].map(f => (
              <GlowCard key={f.title} accentColor={f.color} className="text-center hover:-translate-y-1 transition-transform">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-bold text-lg mb-3" style={{ color: f.color === "cyan" ? "#00FFFF" : "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
                  {f.title}
                </h3>
                <p className="font-mono text-sm text-[#E0E0E0]/60 leading-relaxed">{f.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pro CTA */}
      <ProSection />
    </main>
  );
}
