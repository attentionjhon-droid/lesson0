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
        { error: "Yechimni tekshirish uchun tizimga kirishingiz shart.", requiresAuth: true },
        { status: 401 }
      );
    }

    const { id } = await params;
    const problemId = parseInt(id, 10);
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Kod kiritilmagan" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Masala topilmadi" }, { status: 404 });
    }

    const totalTests = problem.testCases.length;
    let passedTests = 0;
    let overallStatus: string = "Accepted";
    let failedTestCaseIndex = -1;
    let failedInput = "";
    let failedExpected = "";
    let failedActual = "";
    let compilationError = "";
    let maxExecutionTime = 0;
    let maxMemory = 0;

    for (let i = 0; i < totalTests; i++) {
      const tc = problem.testCases[i];
      const result = executeCppCode(code, tc.input, problem.timeLimit);

      maxExecutionTime = Math.max(maxExecutionTime, result.executionTime);
      maxMemory = Math.max(maxMemory, result.memory);

      if (result.status === "Compilation Error") {
        overallStatus = "Compilation Error";
        compilationError = result.error || "Kompilatsiya xatosi";
        break;
      }

      if (result.status === "Time Limit Exceeded") {
        overallStatus = "Time Limit Exceeded";
        failedTestCaseIndex = i + 1;
        break;
      }

      if (result.status === "Runtime Error") {
        overallStatus = "Runtime Error";
        failedTestCaseIndex = i + 1;
        failedActual = result.error || "Runtime Error";
        break;
      }

      // Check output matching (normalize whitespaces)
      const cleanActual = result.output.trim().replace(/\r\n/g, "\n");
      const cleanExpected = tc.output.trim().replace(/\r\n/g, "\n");

      if (cleanActual === cleanExpected) {
        passedTests++;
      } else {
        overallStatus = "Wrong Answer";
        failedTestCaseIndex = i + 1;
        failedInput = tc.input;
        failedExpected = cleanExpected;
        failedActual = cleanActual;
        break;
      }
    }

    // Save submission to database
    const submission = await prisma.submission.create({
      data: {
        userId: user.userId,
        problemId: problem.id,
        code,
        language: "cpp",
        status: overallStatus,
        passedTests,
        totalTests,
        executionTime: maxExecutionTime,
        memoryUsed: maxMemory,
        outputLog: compilationError || (overallStatus === "Wrong Answer" ? `Test #${failedTestCaseIndex} da noto'g'ri javob` : "Muvaffaqiyatli"),
      },
    });

    // Handle Coupons & Rewards
    let awardedCoupons = 0;
    let isFirstSolve = false;
    let totalCoupons = 0;

    if (overallStatus === "Accepted") {
      // Check if user has previously solved this problem with Accepted
      const previousAccepted = await prisma.submission.findFirst({
        where: {
          id: { not: submission.id },
          userId: user.userId,
          problemId: problem.id,
          status: "Accepted",
        },
      });

      if (!previousAccepted) {
        isFirstSolve = true;
        if (problem.difficulty === "Oson") awardedCoupons = 10;
        else if (problem.difficulty === "O'rta") awardedCoupons = 20;
        else if (problem.difficulty === "Qiyin") awardedCoupons = 30;
        else awardedCoupons = 10;

        const updatedUser = await prisma.user.update({
          where: { id: user.userId },
          data: { coupons: { increment: awardedCoupons } },
          select: { coupons: true },
        });
        totalCoupons = updatedUser.coupons;
      } else {
        const currentUserData = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { coupons: true },
        });
        totalCoupons = currentUserData?.coupons || 0;
      }
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: overallStatus,
        passedTests,
        totalTests,
        executionTime: maxExecutionTime,
        memoryUsed: maxMemory,
        failedTestCaseIndex,
        failedInput: failedTestCaseIndex !== -1 && failedTestCaseIndex <= 1 ? failedInput : undefined,
        failedExpected: failedTestCaseIndex !== -1 && failedTestCaseIndex <= 1 ? failedExpected : undefined,
        failedActual: failedTestCaseIndex !== -1 && failedTestCaseIndex <= 1 ? failedActual : undefined,
        compilationError,
        createdAt: submission.createdAt,
      },
      rewards: {
        awardedCoupons,
        isFirstSolve,
        totalCoupons,
      },
    });
  } catch (error) {
    console.error("Submit code error:", error);
    return NextResponse.json({ error: "Yechimni tekshirishda xatolik yuz berdi" }, { status: 500 });
  }
}
