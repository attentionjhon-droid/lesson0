import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const problems = await prisma.problem.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    let userSolvedProblemIds = new Set<number>();
    let userAttemptedProblemIds = new Set<number>();

    if (user) {
      const userSubmissions = await prisma.submission.findMany({
        where: { userId: user.userId },
        select: {
          problemId: true,
          status: true,
        },
      });

      for (const sub of userSubmissions) {
        userAttemptedProblemIds.add(sub.problemId);
        if (sub.status === "Accepted") {
          userSolvedProblemIds.add(sub.problemId);
        }
      }
    }

    const enhancedProblems = problems.map((p) => ({
      ...p,
      isSolved: userSolvedProblemIds.has(p.id),
      isAttempted: userAttemptedProblemIds.has(p.id),
    }));

    return NextResponse.json({ problems: enhancedProblems });
  } catch (error) {
    console.error("Fetch problems error:", error);
    return NextResponse.json(
      { error: "Masalalarni yuklashda xatolik." },
      { status: 500 }
    );
  }
}
