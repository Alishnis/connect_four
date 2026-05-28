import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }

  const { playerId, opponentId } = await req.json();

  if (!playerId || !opponentId) {
    return NextResponse.json({ error: "Missing playerId or opponentId" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Verify both players are in the queue
  const { data: queueEntries } = await supabase
    .from("matchmaking_queue")
    .select("player_id")
    .in("player_id", [playerId, opponentId]);

  if (!queueEntries || queueEntries.length < 2) {
    return NextResponse.json({ error: "One or both players not in queue" }, { status: 409 });
  }

  // Remove both from queue atomically
  const { error: deleteError } = await supabase
    .from("matchmaking_queue")
    .delete()
    .in("player_id", [playerId, opponentId]);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Create room and match
  const roomId = crypto.randomUUID().slice(0, 8);

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      room_id: roomId,
      player_red_id: playerId,
      player_yellow_id: opponentId,
      is_vs_ai: false,
      is_ranked: true,
      move_sequence: [],
    })
    .select("id, room_id")
    .single();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  // Notify the opponent via their matchmaking channel
  const opponentChannel = supabase.channel(`matchmaking:${opponentId}`);
  await opponentChannel.subscribe();
  await opponentChannel.send({
    type: "broadcast",
    event: "match_found",
    payload: { roomId, matchId: match.id },
  });
  supabase.removeChannel(opponentChannel);

  return NextResponse.json({ roomId: match.room_id, matchId: match.id });
}
