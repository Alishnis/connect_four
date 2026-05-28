"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export type MatchmakingStatus = "idle" | "searching" | "found" | "error";

const BASE_ELO_RANGE = 200;
const ELO_EXPAND_STEP = 100;
const ELO_EXPAND_INTERVAL = 15000; // 15s
const MAX_ELO_RANGE = 500;
const POLL_INTERVAL = 3000; // 3s

export function useMatchmaking(userId: string | undefined, eloRating: number) {
  const [status, setStatus] = useState<MatchmakingStatus>("idle");
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const startTimeRef = useRef<number>(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  const cleanup = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
  }, []);

  const getEloRange = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const expansions = Math.floor(elapsed / ELO_EXPAND_INTERVAL);
    return Math.min(BASE_ELO_RANGE + expansions * ELO_EXPAND_STEP, MAX_ELO_RANGE);
  }, []);

  const pollForOpponent = useCallback(async () => {
    if (!userId || statusRef.current !== "searching") return;

    const range = getEloRange();
    const minElo = eloRating - range;
    const maxElo = eloRating + range;

    const { data: opponents } = await supabase
      .from("matchmaking_queue")
      .select("player_id, elo_rating")
      .neq("player_id", userId)
      .gte("elo_rating", minElo)
      .lte("elo_rating", maxElo)
      .order("joined_at", { ascending: true })
      .limit(1);

    if (!opponents || opponents.length === 0) return;

    const opponent = opponents[0];

    try {
      const res = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: userId, opponentId: opponent.player_id }),
      });

      if (!res.ok) {
        // Opponent may have been taken by someone else, keep searching
        return;
      }

      const { roomId } = await res.json();
      setStatus("found");
      cleanup();
      router.push(`/play/${roomId}?ranked=true`);
    } catch {
      // Non-fatal, keep searching
    }
  }, [userId, eloRating, getEloRange, cleanup, router]);

  const joinQueue = useCallback(async () => {
    if (!userId) return;
    setStatus("searching");
    setSearchTime(0);
    setError(null);
    startTimeRef.current = Date.now();

    // Remove any stale entry first
    await supabase.from("matchmaking_queue").delete().eq("player_id", userId);

    // Insert into queue
    const { error: insertError } = await supabase.from("matchmaking_queue").insert({
      player_id: userId,
      elo_rating: eloRating,
    });

    if (insertError) {
      setStatus("error");
      setError(insertError.message);
      return;
    }

    // Subscribe to realtime channel for match_found events (in case opponent finds us first)
    const channel = supabase.channel(`matchmaking:${userId}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "match_found" }, ({ payload }) => {
      if (statusRef.current !== "searching") return;
      setStatus("found");
      cleanup();
      router.push(`/play/${payload.roomId}?ranked=true`);
    });

    channel.subscribe();

    // Start polling
    pollRef.current = setInterval(pollForOpponent, POLL_INTERVAL);

    // Start search timer
    timerRef.current = setInterval(() => {
      setSearchTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Initial poll immediately
    pollForOpponent();
  }, [userId, eloRating, pollForOpponent, cleanup, router]);

  const leaveQueue = useCallback(async () => {
    if (!userId) return;
    cleanup();
    await supabase.from("matchmaking_queue").delete().eq("player_id", userId);
    setStatus("idle");
    setSearchTime(0);
  }, [userId, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      // Also remove from queue on unmount
      if (userId && statusRef.current === "searching") {
        supabase.from("matchmaking_queue").delete().eq("player_id", userId);
      }
    };
  }, [userId, cleanup]);

  return { status, searchTime, error, eloRange: getEloRange(), joinQueue, leaveQueue };
}
