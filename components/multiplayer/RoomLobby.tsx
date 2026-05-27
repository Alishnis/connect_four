"use client";
import GlowCard from "@/components/vaporwave/GlowCard";
import ShareLinkBox from "./ShareLinkBox";
import ConnectionBadge from "./ConnectionBadge";
import type { MultiplayerStatus } from "@/hooks/useMultiplayer";

interface Props {
  roomId: string;
  status: MultiplayerStatus;
  myPlayer: 1 | 2 | null;
}

export default function RoomLobby({ roomId, status, myPlayer }: Props) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/play/${roomId}` : "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <GlowCard accentColor="cyan" className="w-full max-w-md text-center">
        {/* Terminal chrome */}
        <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: "1px solid #00FFFF33" }}>
          <div className="w-3 h-3 rounded-full bg-[#FF00FF]" />
          <div className="w-3 h-3 rounded-full bg-[#00FFFF]" />
          <div className="w-3 h-3 rounded-full bg-[#FF9900]" />
          <span className="font-mono text-xs text-[#00FFFF]/60 ml-2 uppercase tracking-widest">room_{roomId}.exe</span>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50 mb-2">
          You are
        </div>
        <div
          className="font-heading font-black text-4xl mb-1"
          style={{
            fontFamily: "Orbitron, sans-serif",
            color: myPlayer === 1 ? "#FF2D78" : "#00CCFF",
            textShadow: myPlayer === 1 ? "0 0 20px #FF00FF" : "0 0 20px #00FFFF",
          }}
        >
          {myPlayer === 1 ? "PLAYER 1" : myPlayer === 2 ? "PLAYER 2" : "—"}
        </div>
        <div className="font-mono text-xs uppercase tracking-widest mb-8" style={{ color: myPlayer === 1 ? "#FF2D78" : "#00CCFF" }}>
          {myPlayer === 1 ? "(Red discs)" : "(Cyan discs)"}
        </div>

        <div className="mb-4 flex justify-center">
          <ConnectionBadge status={status} />
        </div>

        {myPlayer === 1 && status === "waiting" && (
          <>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-4 uppercase tracking-wider">
              Share this link with your opponent:
            </p>
            <ShareLinkBox url={url} />
          </>
        )}
      </GlowCard>
    </div>
  );
}
