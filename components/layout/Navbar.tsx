"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { getLocalCoins } from "@/lib/skins/localStore";

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [localCoins, setLocalCoins] = useState(0);

  useEffect(() => {
    setLocalCoins(getLocalCoins());
  }, []);

  const displayCoins = profile ? (profile.coins ?? 0) : localCoins;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
      style={{ background: "rgba(9,0,20,0.8)", borderBottom: "1px solid #2D1B4E", backdropFilter: "blur(10px)" }}>
      <Link href="/" className="font-heading font-black text-xl tracking-widest" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif", textShadow: "0 0 10px #FF00FF" }}>
        NEON<span style={{ color: "#00FFFF" }}>GRID</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/leaderboard" className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0] hover:text-[#00FFFF] transition-colors hidden sm:block">
          Рейтинг
        </Link>
        <Link href="/play" className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0] hover:text-[#00FFFF] transition-colors hidden sm:block">
          Играть
        </Link>
        <Link href="/shop" className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0] hover:text-[#FF00FF] transition-colors hidden sm:block">
          Магазин
        </Link>
        {/* Coin display */}
        <div className="flex items-center gap-1 font-mono text-xs" style={{ color: "#FF9900" }}>
          <span>&#x1FA99;</span>
          <span>{displayCoins} NC</span>
        </div>
        <button onClick={toggle} className="font-mono text-sm text-[#E0E0E0] hover:text-[#FF9900] transition-colors" title="Сменить тему">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="font-mono text-sm text-[#00FFFF] hover:underline">
                {profile?.username ?? user.email?.split("@")[0]}
              </Link>
              <SkewButton variant="outline" onClick={signOut} className="!px-4 !py-2 !text-xs">
                Выйти
              </SkewButton>
            </div>
          ) : (
            <Link href="/login">
              <SkewButton variant="secondary" className="!px-5 !py-2 !text-xs">Войти</SkewButton>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
