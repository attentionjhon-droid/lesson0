import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STORE_ITEMS } from "@/lib/storeItems";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        coupons: true,
        purchasedItems: true,
        activeNameAnim: true,
        activeAvatarFrame: true,
        activeTitle: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    let purchased: string[] = [];
    try { purchased = JSON.parse(user.purchasedItems || "[]"); } catch { purchased = []; }

    return NextResponse.json({
      coupons: user.coupons,
      purchasedItems: purchased,
      activeNameAnim: user.activeNameAnim,
      activeAvatarFrame: user.activeAvatarFrame,
      activeTitle: user.activeTitle,
      items: STORE_ITEMS,
    });
  } catch (err) {
    console.error("Store GET error:", err);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const body = await req.json();
    const { action, itemId } = body as { action: "buy" | "equip" | "unequip"; itemId?: string; category?: string };

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { coupons: true, purchasedItems: true, activeNameAnim: true, activeAvatarFrame: true, activeTitle: true },
    });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    let purchased: string[] = [];
    try { purchased = JSON.parse(user.purchasedItems || "[]"); } catch { purchased = []; }

    // ---- BUY ----
    if (action === "buy") {
      if (!itemId) return NextResponse.json({ error: "itemId majburiy" }, { status: 400 });
      const item = STORE_ITEMS.find((i) => i.id === itemId);
      if (!item) return NextResponse.json({ error: "Buyum topilmadi" }, { status: 404 });
      if (purchased.includes(itemId)) return NextResponse.json({ error: "Allaqachon sotib olingan" }, { status: 400 });
      if (user.coupons < item.price) {
        return NextResponse.json({ error: "Kupon yetarli emas", required: item.price, have: user.coupons }, { status: 400 });
      }

      // Build equip update
      const equipUpdate: Record<string, string | null> = {};
      if (item.category === "nameAnim") equipUpdate.activeNameAnim = itemId;
      if (item.category === "avatarFrame") equipUpdate.activeAvatarFrame = itemId;
      if (item.category === "title") equipUpdate.activeTitle = itemId;

      await prisma.user.update({
        where: { id: session.userId },
        data: {
          coupons: { decrement: item.price },
          purchasedItems: JSON.stringify([...purchased, itemId]),
          ...equipUpdate,
        },
      });

      return NextResponse.json({ success: true, action: "buy", itemId, newBalance: user.coupons - item.price });
    }

    // ---- EQUIP ----
    if (action === "equip") {
      if (!itemId) return NextResponse.json({ error: "itemId majburiy" }, { status: 400 });
      const item = STORE_ITEMS.find((i) => i.id === itemId);
      if (!item) return NextResponse.json({ error: "Buyum topilmadi" }, { status: 404 });
      if (!purchased.includes(itemId)) return NextResponse.json({ error: "Avval sotib oling" }, { status: 400 });

      const equipUpdate: Record<string, string | null> = {};
      if (item.category === "nameAnim") equipUpdate.activeNameAnim = itemId;
      if (item.category === "avatarFrame") equipUpdate.activeAvatarFrame = itemId;
      if (item.category === "title") equipUpdate.activeTitle = itemId;

      await prisma.user.update({ where: { id: session.userId }, data: equipUpdate });
      return NextResponse.json({ success: true, action: "equip", itemId });
    }

    // ---- UNEQUIP ----
    if (action === "unequip") {
      const category = body.category as string | undefined;
      const unequipUpdate: Record<string, null> = {};
      if (category === "nameAnim") unequipUpdate.activeNameAnim = null;
      else if (category === "avatarFrame") unequipUpdate.activeAvatarFrame = null;
      else if (category === "title") unequipUpdate.activeTitle = null;
      else return NextResponse.json({ error: "Noma'lum kategoriya" }, { status: 400 });

      await prisma.user.update({ where: { id: session.userId }, data: unequipUpdate });
      return NextResponse.json({ success: true, action: "unequip", category });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (err) {
    console.error("Store POST error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
