import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { executeCppCode } from "@/lib/cppExecutor";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Kodni ishga tushirish uchun tizimga kirishingiz shart.", requiresAuth: true },
        { status: 401 }
      );
    }

    const { id } = await params;
    const problemId = parseInt(id, 10);
    const body = await request.json();
    const { code, input } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Kod kiritilmagan" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { timeLimit: true, sampleInput: true, sampleOutput: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Masala topilmadi" }, { status: 404 });
    }

    const runInput = input !== undefined ? String(input) : problem.sampleInput;
    const result = executeCppCode(code, runInput, problem.timeLimit);

    return NextResponse.json({
      status: result.status,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memory: result.memory,
      input: runInput,
      expectedOutput: input === undefined || input.trim() === problem.sampleInput.trim() ? problem.sampleOutput : null,
    });
  } catch (error) {
    console.error("Run code error:", error);
    return NextResponse.json({ error: "Kodni ishga tushirishda xatolik" }, { status: 500 });
  }
}
