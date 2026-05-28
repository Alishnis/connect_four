import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { countryToFlag } from "@/lib/geo/countryFlag";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`player_red_id.eq.${user.id},player_yellow_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const wins = matches?.filter(m => m.winner_id === user.id).length ?? 0;
  const total = matches?.length ?? 0;
  const losses = matches?.filter(m => m.winner_id && m.winner_id !== user.id).length ?? 0;

  const cityDisplay = profile?.city
    ? `${countryToFlag(profile.country)} ${profile.city}`
    : "🌐 Global";

  return (
    <ProfileContent
      username={profile?.username ?? user.email ?? ""}
      email={user.email ?? ""}
      cityDisplay={cityDisplay}
      isPro={profile?.is_pro ?? false}
      wins={wins}
      losses={losses}
      total={total}
      matches={(matches ?? []).map(m => ({
        id: m.id,
        created_at: m.created_at,
        is_vs_ai: m.is_vs_ai,
        ai_difficulty: m.ai_difficulty,
        room_id: m.room_id,
        total_moves: m.total_moves,
        winner_id: m.winner_id,
      }))}
      userId={user.id}
    />
  );
}
