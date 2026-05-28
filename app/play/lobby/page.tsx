"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LobbyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function createRoom() {
      try {
        const res = await fetch("/api/rooms", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create room");
        const { roomId } = await res.json();
        router.push(`/play/${roomId}`);
      } catch (err) {
        setError(t("lobby.error"));
      }
    }
    createRoom();
  }, []);

  return (
    <div className="min-h-screen relative pt-24 flex items-center justify-center px-4">
      <PerspectiveGrid />
      <div className="relative z-10 w-full max-w-sm">
        <GlowCard accentColor="cyan" className="text-center">
          {error ? (
            <div className="font-mono text-sm text-[#FF2D78]">{error}</div>
          ) : (
            <>
              <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-4 animate-pulse">
                {t("lobby.initializing")}
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: "#00FFFF", animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
