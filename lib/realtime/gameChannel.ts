import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type GameEvent =
  | { type: "move"; column: number; player: 1 | 2; moveNumber: number }
  | { type: "resign"; player: 1 | 2 }
  | { type: "rematch" }
  | { type: "player_joined"; playerId: string | null };

type EventHandler = (event: GameEvent) => void;

export function createGameChannel(roomId: string): {
  channel: RealtimeChannel;
  send: (event: GameEvent) => void;
  subscribe: (handler: EventHandler) => void;
  unsubscribe: () => void;
} {
  const supabase = createClient();
  const channel = supabase.channel(`game:${roomId}`, {
    config: { broadcast: { self: false } },
  });

  let handler: EventHandler | null = null;

  channel.on("broadcast", { event: "game_event" }, ({ payload }) => {
    if (handler) handler(payload as GameEvent);
  });

  return {
    channel,
    send: (event: GameEvent) => {
      channel.send({ type: "broadcast", event: "game_event", payload: event });
    },
    subscribe: (h: EventHandler) => { handler = h; },
    unsubscribe: () => { supabase.removeChannel(channel); },
  };
}
