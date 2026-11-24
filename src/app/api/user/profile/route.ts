import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan", requiresAuth: true },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        coupons: true,
        createdAt: true,
        activeNameAnim: true,
        activeAvatarFrame: true,
        activeTitle: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // 1. All problems
    const problems = await prisma.problem.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        sampleInput: true,
        sampleOutput: true,
      },
    });

    // 2. All submissions by this user
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // 3. Calculation of metrics
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter((s) => s.status === "Accepted").length;
    const wrongCount = submissions.filter((s) => s.status === "Wrong Answer").length;
    const compileErrorCount = submissions.filter((s) => s.status === "Compilation Error").length;
    const runtimeErrorCount = submissions.filter((s) => s.status === "Runtime Error" || s.status === "Time Limit Exceeded").length;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    // 4. Map solved problems (unique Accepted problems)
    const acceptedSubmissionsByProblem = new Map<number, (typeof submissions)[0]>();
    for (const sub of submissions) {
      if (sub.status === "Accepted" && !acceptedSubmissionsByProblem.has(sub.problemId)) {
        acceptedSubmissionsByProblem.set(sub.problemId, sub);
      }
    }

    const solvedProblems = [];
    const unsolvedProblems = [];

    const getRewardText = (diff: string) => {
      switch (diff.toLowerCase()) {
        case "oson":
          return "+10 💵";
        case "o'rta":
        case "orta":
          return "+20 💵";
        case "qiyin":
          return "+30 💵";
        default:
          return "+10 💵";
      }
    };

    for (const prob of problems) {
      const acceptedSub = acceptedSubmissionsByProblem.get(prob.id);
      if (acceptedSub) {
        solvedProblems.push({
          problemId: prob.id,
          title: prob.title,
          difficulty: prob.difficulty,
          reward: getRewardText(prob.difficulty),
          solvedAt: acceptedSub.createdAt,
          submissionId: acceptedSub.id,
          code: acceptedSub.code,
          executionTime: acceptedSub.executionTime,
          memoryUsed: acceptedSub.memoryUsed,
          passedTests: acceptedSub.passedTests,
          totalTests: acceptedSub.totalTests,
        });
      } else {
        unsolvedProblems.push({
          id: prob.id,
          title: prob.title,
          difficulty: prob.difficulty,
          reward: getRewardText(prob.difficulty),
          timeLimit: prob.timeLimit,
          memoryLimit: prob.memoryLimit,
          sampleInput: prob.sampleInput,
          sampleOutput: prob.sampleOutput,
        });
      }
    }

    // 5. Difficulty breakdown
    const easyTotal = problems.filter((p) => p.difficulty.toLowerCase() === "oson").length;
    const easySolved = solvedProblems.filter((p) => p.difficulty.toLowerCase() === "oson").length;

    const mediumTotal = problems.filter((p) => p.difficulty.toLowerCase() === "o'rta" || p.difficulty.toLowerCase() === "orta").length;
    const mediumSolved = solvedProblems.filter((p) => p.difficulty.toLowerCase() === "o'rta" || p.difficulty.toLowerCase() === "orta").length;

    const hardTotal = problems.filter((p) => p.difficulty.toLowerCase() === "qiyin").length;
    const hardSolved = solvedProblems.filter((p) => p.difficulty.toLowerCase() === "qiyin").length;

    return NextResponse.json({
      user,
      metrics: {
        totalProblems: problems.length,
        solvedCount: solvedProblems.length,
        totalSubmissions,
        acceptedSubmissions,
        wrongCount,
        compileErrorCount,
        runtimeErrorCount,
        acceptanceRate,
      },
      difficultyStats: {
        easy: {
          solved: easySolved,
          total: easyTotal,
          percent: easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0,
        },
        medium: {
          solved: mediumSolved,
          total: mediumTotal,
          percent: mediumTotal > 0 ? Math.round((mediumSolved / mediumTotal) * 100) : 0,
        },
        hard: {
          solved: hardSolved,
          total: hardTotal,
          percent: hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0,
        },
      },
      solvedProblems,
      unsolvedProblems,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Profil ma'lumotlarini yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
