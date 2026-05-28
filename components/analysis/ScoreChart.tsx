"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { MoveAnalysis } from "@/lib/game/coach";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  moves: MoveAnalysis[];
  onSelectMove?: (moveNumber: number) => void;
}

export default function ScoreChart({ moves, onSelectMove }: Props) {
  const { t } = useLanguage();

  const data = moves.map(m => ({
    move: m.moveNumber,
    eval: Math.max(-200, Math.min(200, m.evalScore)),
    player: m.player,
  }));

  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
          onClick={(e) => { const payload = (e as { activePayload?: { payload: { move: number } }[] } | null)?.activePayload; if (payload?.[0] && onSelectMove) onSelectMove(payload[0].payload.move); }}>
          <XAxis dataKey="move" stroke="#2D1B4E" tick={{ fill: "#E0E0E0", opacity: 0.4, fontSize: 10, fontFamily: "Share Tech Mono" }} />
          <YAxis stroke="#2D1B4E" domain={[-200, 200]} tick={{ fill: "#E0E0E0", opacity: 0.4, fontSize: 10, fontFamily: "Share Tech Mono" }} />
          <ReferenceLine y={0} stroke="#4D3B6E" strokeWidth={1.5} />
          <Tooltip
            contentStyle={{ background: "#1a103c", border: "1px solid #00FFFF", fontFamily: "Share Tech Mono", fontSize: 11 }}
            labelStyle={{ color: "#00FFFF" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any) => [typeof val === "number" ? (val > 0 ? `+${val} (${t("chart.youAhead")})` : val < 0 ? `${val} (${t("chart.aiAhead")})` : t("chart.equal")) : val, t("chart.eval")]}
          />
          <Line type="monotone" dataKey="eval" stroke="#FF00FF" strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: "#FF9900", stroke: "#FF9900" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
