import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getValidColumns } from "@/lib/game/engine";
import type { Board } from "@/lib/game/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function boardToText(board: Board): string {
  const symbols: Record<number, string> = { 0: "·", 1: "R", 2: "Y" };
  const rows = board.map((row, r) =>
    `Row ${r}: ${row.map(c => symbols[c]).join(" ")}`
  );
  return rows.join("\n") + "\n       0 1 2 3 4 5 6";
}

export async function POST(req: NextRequest) {
  try {
    const { board, aiPlayer } = await req.json() as { board: Board; aiPlayer: 1 | 2 };
    const validCols = getValidColumns(board);
    if (validCols.length === 0) return NextResponse.json({ column: 3, reasoning: "No valid moves" });

    const myColor = aiPlayer === 1 ? "R (Red)" : "Y (Yellow)";
    const oppColor = aiPlayer === 1 ? "Y (Yellow)" : "R (Red)";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert Connect Four player playing as ${myColor}. Opponent is ${oppColor}.
Board: 6 rows × 7 columns. Row 0 = top, Row 5 = bottom. Pieces fall to lowest empty cell.
Win = 4 in a row (horizontal, vertical, diagonal).
Strategy: 1) Take winning move if available. 2) Block opponent's winning move. 3) Build threats.
Respond ONLY with valid JSON: {"column": <integer 0-6>, "reasoning": "<one short sentence in Russian>"}`,
        },
        {
          role: "user",
          content: `Board (· = empty, R = Red, Y = Yellow):\n${boardToText(board)}\n\nValid columns: [${validCols.join(", ")}]\nChoose column:`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 80,
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content ?? '{"column":3,"reasoning":""}';
    const parsed = JSON.parse(raw);
    const col = validCols.includes(Number(parsed.column)) ? Number(parsed.column) : validCols[Math.floor(validCols.length / 2)];
    return NextResponse.json({ column: col, reasoning: parsed.reasoning ?? "" });
  } catch (err) {
    console.error("GPT move error:", err);
    return NextResponse.json({ column: 3, reasoning: "Ошибка GPT, ход по центру" });
  }
}
