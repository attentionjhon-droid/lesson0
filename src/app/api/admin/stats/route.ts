import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan: Faqat Administrator kira oladi." }, { status: 403 });
    }

    // 1. Fetch all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        coupons: true,
        createdAt: true,
        submissions: {
          select: {
            problemId: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const userStats = users.map((u) => {
      const totalSubmissions = u.submissions.length;
      const solvedProblemIds = new Set(
        u.submissions.filter((s) => s.status === "Accepted").map((s) => s.problemId)
      );
      const acceptedCount = solvedProblemIds.size;
      const wrongCount = u.submissions.filter((s) => s.status === "Wrong Answer").length;
      const compileErrorCount = u.submissions.filter((s) => s.status === "Compilation Error").length;

      return {
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        coupons: u.coupons || 0,
        createdAt: u.createdAt,
        totalSubmissions,
        acceptedCount,
        wrongCount,
        compileErrorCount,
      };
    });

    // 2. Fetch all submissions with student & problem details
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // 3. Fetch feedbacks
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 4. Summary metrics
    const totalSubmissionsCount = await prisma.submission.count();
    const acceptedSubmissionsCount = await prisma.submission.count({
      where: { status: "Accepted" },
    });
    const totalUsersCount = users.filter((u) => u.role === "USER").length;

    return NextResponse.json({
      metrics: {
        totalUsers: totalUsersCount,
        totalSubmissions: totalSubmissionsCount,
        acceptedSubmissions: acceptedSubmissionsCount,
        acceptanceRate: totalSubmissionsCount > 0 ? Math.round((acceptedSubmissionsCount / totalSubmissionsCount) * 100) : 0,
        totalFeedbacks: feedbacks.length,
      },
      users: userStats,
      submissions,
      feedbacks,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Admin ma'lumotlarini yuklashda xatolik" }, { status: 500 });
  }
}
