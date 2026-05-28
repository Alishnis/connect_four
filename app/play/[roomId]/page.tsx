"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useCoinReward } from "@/hooks/useCoinReward";
import { useAuth } from "@/hooks/useAuth";
import { useTimer } from "@/hooks/useTimer";
import Board from "@/components/game/Board";
import ScoreBar from "@/components/game/ScoreBar";
import GameOverModal from "@/components/game/GameOverModal";
import TimeControlPicker from "@/components/game/TimeControlPicker";
import RoomLobby from "@/components/multiplayer/RoomLobby";
import ConnectionBadge from "@/components/multiplayer/ConnectionBadge";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { SkinProvider } from "@/lib/skins/SkinContext";
import { getLocalActiveSkin } from "@/lib/skins/localStore";
import { DEFAULT_TIME_CONTROL, BLITZ_TIME_CONTROL, SPRINT_TIME_CONTROL } from "@/lib/game/constants";
import type { TimeControlMode, TimeControl, Player } from "@/lib/game/constants";

interface Props {
  params: Promise<{ roomId: string }>;
}

function MultiplayerRoomContent({ roomId }: { roomId: string }) {
  const { state, makeMove, resign, rematch, sendEvent } = useMultiplayer(roomId, roomId);
  const { reward, awardCoins, resetReward } = useCoinReward();
  const { user } = useAuth();
  const router = useRouter();
  const moveHistoryRef = useRef<number[]>([]);
  const [timeControlMode, setTimeControlMode] = useState<TimeControlMode>("classic");
  const [timeoutLoser, setTimeoutLoser] = useState<Player | null>(null);

  const timeControlMap: Record<TimeControlMode, TimeControl> = {
    classic: DEFAULT_TIME_CONTROL,
    blitz: BLITZ_TIME_CONTROL,
    sprint: SPRINT_TIME_CONTROL,
  };
  const timeControl = timeControlMap[timeControlMode];

  const handleTimeout = (player: Player) => {
    setTimeoutLoser(player);
    sendEvent({ type: "timeout", loser: player });
  };

  const { timeLeft, moveTimeLeft, resetTimer } = useTimer({
    timeControl,
    currentPlayer: state.currentPlayer,
    gameStatus: state.status,
    onTimeout: handleTimeout,
  });

  // Track every move via lastMove changes
  useEffect(() => {
    if (state.lastMove && state.moveCount > 0) {
      moveHistoryRef.current[state.moveCount - 1] = state.lastMove.col;
    }
  }, [state.moveCount]);

  // Save to sessionStorage when game ends for GPT analysis
  useEffect(() => {
    if (state.status === "game_over" && moveHistoryRef.current.length > 0) {
      sessionStorage.setItem("lastGameMoves", JSON.stringify(moveHistoryRef.current));
      sessionStorage.setItem("lastGameWinner", String(state.winner ?? "null"));
      sessionStorage.setItem("lastGamePlayers", JSON.stringify(["Player 1", "Player 2"]));
    }
  }, [state.status]);

  // Award coins when game ends
  useEffect(() => {
    if (state.status === "game_over") {
      const won = state.winner === state.myPlayer;
      awardCoins({ won, isMultiplayer: true, userId: user?.id });
    }
  }, [state.status]);

  const handleRematch = () => {
    moveHistoryRef.current = [];
    resetReward();
    resetTimer();
    setTimeoutLoser(null);
    rematch();
  };

  const handleAnalysis = () => {
    router.push("/analysis/gpt-game");
  };

  const isMyTurn = state.currentPlayer === state.myPlayer && state.status === "playing";

  if (state.status === "waiting") {
    return (
      <div className="min-h-screen relative pt-20">
        <PerspectiveGrid />
        <div className="relative z-10">
          <RoomLobby roomId={roomId} status={state.status} myPlayer={state.myPlayer} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1
              className="font-heading font-black text-2xl"
              style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}
            >
              ROOM {roomId}
            </h1>
            <ConnectionBadge status={state.status} />
          </div>

          <div className="mb-4">
            <TimeControlPicker value={timeControlMode} onChange={(m) => { setTimeControlMode(m); resetTimer(); sendEvent({ type: "set_time_control", mode: m }); }} />
          </div>

          <GlowCard accentColor="cyan" className="!p-4">
            <ScoreBar
              currentPlayer={state.currentPlayer}
              playerNames={["ИГРОК 1", "ИГРОК 2"]}
              moveCount={state.moveCount}
              status={state.status}
              timeControl={timeControl}
              timeLeft={timeLeft}
              moveTimeLeft={moveTimeLeft}
            />

            {!isMyTurn && state.status === "playing" && (
              <div className="text-center mb-2 font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest animate-pulse">
                Ход противника...
              </div>
            )}
            {isMyTurn && (
              <div
                className="text-center mb-2 font-mono text-xs uppercase tracking-widest"
                style={{ color: state.myPlayer === 1 ? "#FF2D78" : "#00CCFF" }}
              >
                Ваш ход
              </div>
            )}

            <Board
              board={state.board}
              onColumnClick={makeMove}
              winCells={state.winCells}
              currentPlayer={state.currentPlayer}
              disabled={!isMyTurn}
              lastMove={state.lastMove}
            />

            <div className="flex gap-3 mt-4 justify-center">
              <SkewButton variant="outline" onClick={resign} className="!px-4 !py-2 !text-xs">
                Сдаться
              </SkewButton>
            </div>
          </GlowCard>
        </div>
      </div>

      {state.status === "game_over" && (
        <GameOverModal
          winner={state.winner}
          isDraw={state.isDraw}
          onRematch={handleRematch}
          onHome={() => router.push("/play")}
          onAnalysis={handleAnalysis}
          playerNames={["PLAYER 1", "PLAYER 2"]}
          coinReward={reward}
          timeoutLoser={timeoutLoser}
        />
      )}
    </div>
  );
}

export default function MultiplayerRoomPage({ params }: Props) {
  const { roomId } = use(params);
  const { profile } = useAuth();
  const [skinId, setSkinId] = useState("classic");

  useEffect(() => {
    const id = profile?.skin_id ?? getLocalActiveSkin();
    setSkinId(id);
  }, [profile]);

  return (
    <SkinProvider skinId={skinId}>
      <MultiplayerRoomContent roomId={roomId} />
    </SkinProvider>
  );
}
