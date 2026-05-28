import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createBoard, dropDisc, checkWin } from "@/lib/game/engine";
import type { Board, Player } from "@/lib/game/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function boardToText(board: Board): string {
  const symbols: Record<number, string> = { 0: "·", 1: "R", 2: "Y" };
  return board.map((row, r) =>
    `${r}: ${row.map(c => symbols[c]).join(" ")}`
  ).join("\n") + "\n   0 1 2 3 4 5 6";
}

export async function POST(req: NextRequest) {
  try {
    const { moveSequence, winnerId, playerNames } = await req.json() as {
      moveSequence: number[];
      winnerId: 1 | 2 | null;
      playerNames?: [string, string];
    };

    let board = createBoard();
    let currentPlayer: Player = 1;
    const moveSummary: string[] = [];

    for (let i = 0; i < moveSequence.length; i++) {
      const col = moveSequence[i];
      const result = dropDisc(board, col, currentPlayer);
      if (!result) break;
      const win = checkWin(result.board, result.row, col);
      moveSummary.push(
        `Ход ${i + 1}: ${currentPlayer === 1 ? "Игрок 1 (Красный)" : "Игрок 2 (Жёлтый)"} → Колонка ${col + 1}${win ? " ★ ПОБЕДНЫЙ ХОД" : ""}`
      );
      board = result.board;
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    const p1 = playerNames?.[0] ?? "Игрок 1";
    const p2 = playerNames?.[1] ?? "Игрок 2";
    const winText = winnerId
      ? `${winnerId === 1 ? `${p1} (Красный)` : `${p2} (Жёлтый)`} победил`
      : "Ничья";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Ты — профессиональный тренер по игре Четыре в ряд. Анализируй партии и давай конкретные советы на русском языке. Используй номера колонок 1-7 (не 0-6). Будь конкретным и практичным.`,
        },
        {
          role: "user",
          content: `Проанализируй партию между ${p1} (🔴 Красный) и ${p2} (🟡 Жёлтый).

Результат: ${winText} за ${moveSequence.length} ходов.

История ходов:
${moveSummary.join("\n")}

Финальная доска (R=Красный, Y=Жёлтый, ·=пусто):
${boardToText(board)}

Дай анализ по разделам:
🎯 **Общий итог** — что решило исход партии (2-3 предложения)
❌ **Ключевые ошибки** — конкретные ходы с объяснением почему это ошибка
✅ **Сильные ходы** — что было сыграно хорошо
💡 **Советы** — 3 конкретные рекомендации для следующей игры`,
        },
      ],
      max_tokens: 900,
      temperature: 0.6,
    });

    const analysis = response.choices[0]?.message?.content ?? "Анализ недоступен.";
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("GPT coach error:", err);
    return NextResponse.json(
      { analysis: "Не удалось получить анализ. Проверьте OpenAI API ключ." },
      { status: 500 }
    );
  }
}
