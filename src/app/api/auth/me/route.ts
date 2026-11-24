import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null });
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
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}
