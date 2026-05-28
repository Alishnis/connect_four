import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { calculateElo } from "@/lib/game/elo";

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

  const { matchId, winnerId } = await req.json();

  if (!matchId) {
    return NextResponse.json({ error: "Missing matchId" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Fetch match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (!match.is_ranked) {
    return NextResponse.json({ error: "Not a ranked match" }, { status: 400 });
  }

  // If ELO already updated, return existing values
  if (match.elo_change_red !== null) {
    return NextResponse.json({
      eloChangeRed: match.elo_change_red,
      eloChangeYellow: match.elo_change_yellow,
    });
  }

  if (!match.player_red_id || !match.player_yellow_id) {
    return NextResponse.json({ error: "Match missing players" }, { status: 400 });
  }

  // Fetch both player profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, elo_rating")
    .in("id", [match.player_red_id, match.player_yellow_id]);

  if (!profiles || profiles.length < 2) {
    return NextResponse.json({ error: "Players not found" }, { status: 404 });
  }

  const redProfile = profiles.find((p: { id: string }) => p.id === match.player_red_id)!;
  const yellowProfile = profiles.find((p: { id: string }) => p.id === match.player_yellow_id)!;

  // Determine result for red player
  let resultRed: 0 | 0.5 | 1;
  if (winnerId === null) {
    resultRed = 0.5; // draw
  } else if (winnerId === match.player_red_id) {
    resultRed = 1;
  } else {
    resultRed = 0;
  }

  const elo = calculateElo(
    redProfile.elo_rating ?? 1000,
    yellowProfile.elo_rating ?? 1000,
    resultRed
  );

  // Update both profiles
  await supabase
    .from("profiles")
    .update({ elo_rating: elo.newA })
    .eq("id", match.player_red_id);

  await supabase
    .from("profiles")
    .update({ elo_rating: elo.newB })
    .eq("id", match.player_yellow_id);

  // Update match with ELO changes
  await supabase
    .from("matches")
    .update({
      elo_change_red: elo.changeA,
      elo_change_yellow: elo.changeB,
    })
    .eq("id", matchId);

  return NextResponse.json({
    eloChangeRed: elo.changeA,
    eloChangeYellow: elo.changeB,
  });
}
