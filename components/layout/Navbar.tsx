"use client";
import Link from "next/link";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
      style={{ background: "rgba(9,0,20,0.8)", borderBottom: "1px solid #2D1B4E", backdropFilter: "blur(10px)" }}>
      <Link href="/" className="font-heading font-black text-xl tracking-widest" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif", textShadow: "0 0 10px #FF00FF" }}>
        NEON<span style={{ color: "#00FFFF" }}>GRID</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/leaderboard" className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0] hover:text-[#00FFFF] transition-colors hidden sm:block">
          Leaderboard
        </Link>
        <Link href="/play" className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0] hover:text-[#00FFFF] transition-colors hidden sm:block">
          Play
        </Link>
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="font-mono text-sm text-[#00FFFF] hover:underline">
                {profile?.username ?? user.email?.split("@")[0]}
              </Link>
              <SkewButton variant="outline" onClick={signOut} className="!px-4 !py-2 !text-xs">
                Logout
              </SkewButton>
            </div>
          ) : (
            <Link href="/login">
              <SkewButton variant="secondary" className="!px-5 !py-2 !text-xs">Login</SkewButton>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
