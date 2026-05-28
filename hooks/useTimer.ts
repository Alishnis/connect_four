"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Player, TimeControl } from "@/lib/game/constants";

interface UseTimerParams {
  timeControl: TimeControl;
  currentPlayer: Player;
  gameStatus: string;
  onTimeout: (player: Player) => void;
}

interface UseTimerReturn {
  timeLeft: [number, number];
  moveTimeLeft: number | null;
  resetTimer: () => void;
}

export function useTimer({
  timeControl,
  currentPlayer,
  gameStatus,
  onTimeout,
}: UseTimerParams): UseTimerReturn {
  const getInitialTimeLeft = (): [number, number] => {
    if (timeControl.mode === "blitz") {
      const t = timeControl.totalTime ?? 60000;
      return [t, t];
    }
    return [Infinity, Infinity];
  };

  const getInitialMoveTime = (): number | null => {
    if (timeControl.mode === "sprint") {
      return timeControl.moveTime ?? 10000;
    }
    return null;
  };

  const [timeLeft, setTimeLeft] = useState<[number, number]>(getInitialTimeLeft);
  const [moveTimeLeft, setMoveTimeLeft] = useState<number | null>(getInitialMoveTime);

  // High-frequency refs
  const timeLeftRef = useRef<[number, number]>(getInitialTimeLeft());
  const moveTimeLeftRef = useRef<number | null>(getInitialMoveTime());
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastStateUpdateRef = useRef<number>(0);
  const currentPlayerRef = useRef(currentPlayer);
  const onTimeoutRef = useRef(onTimeout);
  const timeControlRef = useRef(timeControl);
  const timedOutRef = useRef(false);

  onTimeoutRef.current = onTimeout;
  timeControlRef.current = timeControl;

  // Reset move timer when player switches (sprint mode)
  useEffect(() => {
    if (currentPlayerRef.current !== currentPlayer) {
      currentPlayerRef.current = currentPlayer;
      if (timeControlRef.current.mode === "sprint") {
        const moveTime = timeControlRef.current.moveTime ?? 10000;
        moveTimeLeftRef.current = moveTime;
        setMoveTimeLeft(moveTime);
      }
    }
  }, [currentPlayer]);

  const tick = useCallback((timestamp: number) => {
    if (lastTickRef.current === null) {
      lastTickRef.current = timestamp;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const delta = timestamp - lastTickRef.current;
    lastTickRef.current = timestamp;
    const tc = timeControlRef.current;
    const player = currentPlayerRef.current;

    if (tc.mode === "blitz") {
      const idx = player === 1 ? 0 : 1;
      const newTime = Math.max(0, timeLeftRef.current[idx] - delta);
      timeLeftRef.current = idx === 0
        ? [newTime, timeLeftRef.current[1]]
        : [timeLeftRef.current[0], newTime];

      if (newTime <= 0 && !timedOutRef.current) {
        timedOutRef.current = true;
        setTimeLeft([...timeLeftRef.current] as [number, number]);
        onTimeoutRef.current(player);
        return;
      }
    } else if (tc.mode === "sprint") {
      const newMoveTime = Math.max(0, (moveTimeLeftRef.current ?? 0) - delta);
      moveTimeLeftRef.current = newMoveTime;

      if (newMoveTime <= 0 && !timedOutRef.current) {
        timedOutRef.current = true;
        setMoveTimeLeft(0);
        onTimeoutRef.current(player);
        return;
      }
    }

    // Update state at ~10Hz
    if (timestamp - lastStateUpdateRef.current >= 100) {
      lastStateUpdateRef.current = timestamp;
      if (tc.mode === "blitz") {
        setTimeLeft([...timeLeftRef.current] as [number, number]);
      } else if (tc.mode === "sprint") {
        setMoveTimeLeft(moveTimeLeftRef.current);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Start/stop the timer loop based on game status
  useEffect(() => {
    const shouldTick =
      timeControl.mode !== "classic" &&
      (gameStatus === "playing" || gameStatus === "ai_thinking");

    if (shouldTick) {
      lastTickRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [gameStatus, timeControl.mode, tick]);

  const resetTimer = useCallback(() => {
    timedOutRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTickRef.current = null;

    const tc = timeControlRef.current;
    if (tc.mode === "blitz") {
      const t = tc.totalTime ?? 60000;
      timeLeftRef.current = [t, t];
      setTimeLeft([t, t]);
      moveTimeLeftRef.current = null;
      setMoveTimeLeft(null);
    } else if (tc.mode === "sprint") {
      const mt = tc.moveTime ?? 10000;
      moveTimeLeftRef.current = mt;
      setMoveTimeLeft(mt);
      timeLeftRef.current = [Infinity, Infinity];
      setTimeLeft([Infinity, Infinity]);
    } else {
      timeLeftRef.current = [Infinity, Infinity];
      setTimeLeft([Infinity, Infinity]);
      moveTimeLeftRef.current = null;
      setMoveTimeLeft(null);
    }
  }, []);

  // Reset when time control mode changes
  useEffect(() => {
    resetTimer();
  }, [timeControl.mode, resetTimer]);

  return { timeLeft, moveTimeLeft, resetTimer };
}
