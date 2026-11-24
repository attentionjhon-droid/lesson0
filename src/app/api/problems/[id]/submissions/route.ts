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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ submissions: [] });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        problemId,
        userId: user.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Submissions error:", error);
    return NextResponse.json({ error: "Yechimlar tarixini yuklashda xatolik" }, { status: 500 });
  }
}
