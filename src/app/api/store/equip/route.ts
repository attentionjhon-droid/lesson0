import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ITEM_CATEGORIES: Record<string, "nameAnim" | "avatarFrame" | "title"> = {
  "neon-pulse": "nameAnim",
  "golden-shine": "nameAnim",
  "cyberpunk-glitch": "nameAnim",
  "emerald-glow": "avatarFrame",
  "fire-ring": "avatarFrame",
  "royal-rgb": "avatarFrame",
  "junior-coder": "title",
  "algorithm-master": "title",
  "ndtu-legend": "title",
};

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const body = await request.json();
    const { itemId, unequip } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { purchasedItems: true },
    });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    if (itemId && !unequip) {
      let purchased: string[] = [];
      try { purchased = JSON.parse(user.purchasedItems || "[]"); } catch { purchased = []; }
      if (!purchased.includes(itemId)) {
        return NextResponse.json({ error: "Bu buyum sotib olinmagan" }, { status: 400 });
      }
    }

    const updateData: Record<string, string | null> = {};

    if (unequip) {
      if (unequip === "nameAnim") updateData.activeNameAnim = null;
      else if (unequip === "avatarFrame") updateData.activeAvatarFrame = null;
      else if (unequip === "title") updateData.activeTitle = null;
    } else if (itemId) {
      const category = ITEM_CATEGORIES[itemId];
      if (category === "nameAnim") updateData.activeNameAnim = itemId;
      else if (category === "avatarFrame") updateData.activeAvatarFrame = itemId;
      else if (category === "title") updateData.activeTitle = itemId;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { activeNameAnim: true, activeAvatarFrame: true, activeTitle: true },
    });

    return NextResponse.json({
      success: true,
      activeNameAnim: updatedUser.activeNameAnim,
      activeAvatarFrame: updatedUser.activeAvatarFrame,
      activeTitle: updatedUser.activeTitle,
    });
  } catch (err) {
    console.error("Store equip error:", err);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
