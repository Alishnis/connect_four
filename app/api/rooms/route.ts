import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const roomId = nanoid();

  // Create match record
  const { data, error } = await supabase.from("matches").insert({
    room_id: roomId,
    player_red_id: user?.id ?? null,
    is_vs_ai: false,
    move_sequence: [],
  }).select("id, room_id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ roomId: data.room_id, matchId: data.id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId) return NextResponse.json({ error: "Missing roomId" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.from("matches")
    .select("id, room_id, player_red_id, player_yellow_id, move_sequence, total_moves, winner_id")
    .eq("room_id", roomId)
    .single();

  if (error) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json(data);
}
