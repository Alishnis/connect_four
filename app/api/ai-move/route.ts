import { NextRequest, NextResponse } from "next/server";
import { getBestMove } from "@/lib/game/ai";
import { Board } from "@/lib/game/constants";

export async function POST(req: NextRequest) {
  try {
    const { board, difficulty, aiPlayer } = await req.json() as {
      board: Board;
      difficulty: "easy" | "medium" | "hard";
      aiPlayer: 1 | 2;
    };

    const result = getBestMove(board, difficulty, aiPlayer);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI error" }, { status: 500 });
  }
}
