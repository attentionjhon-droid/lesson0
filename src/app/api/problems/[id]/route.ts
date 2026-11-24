import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problemId = parseInt(id, 10);

    if (isNaN(problemId)) {
      return NextResponse.json({ error: "Noto'g'ri masala ID" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: { isSample: true },
          select: {
            id: true,
            input: true,
            output: true,
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Masala topilmadi" }, { status: 404 });
    }

    const user = await getCurrentUser();
    let submissions: any[] = [];
    if (user) {
      submissions = await prisma.submission.findMany({
        where: {
          problemId: problem.id,
          userId: user.userId,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          passedTests: true,
          totalTests: true,
          executionTime: true,
          memoryUsed: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      problem,
      submissions,
      currentUser: user,
    });
  } catch (error) {
    console.error("Get problem error:", error);
    return NextResponse.json({ error: "Masalani yuklashda xatolik" }, { status: 500 });
  }
}
