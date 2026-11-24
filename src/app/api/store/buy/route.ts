import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STORE_PRICES: Record<string, number> = {
  "neon-pulse": 20,
  "golden-shine": 40,
  "cyberpunk-glitch": 60,
  "emerald-glow": 30,
  "fire-ring": 50,
  "royal-rgb": 80,
  "junior-coder": 15,
  "algorithm-master": 50,
  "ndtu-legend": 100,
};

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const { itemId } = await request.json();
    if (!itemId || !STORE_PRICES[itemId]) {
      return NextResponse.json({ error: "Noto'g'ri buyum ID si" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { coupons: true, purchasedItems: true },
    });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    let purchased: string[] = [];
    try { purchased = JSON.parse(user.purchasedItems || "[]"); } catch { purchased = []; }

    if (purchased.includes(itemId)) {
      return NextResponse.json({ error: "Bu buyum allaqachon sotib olingan" }, { status: 400 });
    }

    const price = STORE_PRICES[itemId];
    if (user.coupons < price) {
      return NextResponse.json(
        { error: `Kupon yetarli emas. Kerak: ${price} 💵, Sizda: ${user.coupons} 💵` },
        { status: 400 }
      );
    }

    purchased.push(itemId);
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        coupons: { decrement: price },
        purchasedItems: JSON.stringify(purchased),
      },
      select: { coupons: true, purchasedItems: true },
    });

    let newPurchased: string[] = [];
    try { newPurchased = JSON.parse(updatedUser.purchasedItems || "[]"); } catch { newPurchased = []; }

    return NextResponse.json({
      success: true,
      coupons: updatedUser.coupons,
      purchasedItems: newPurchased,
      boughtItemId: itemId,
      spent: price,
    });
  } catch (err) {
    console.error("Store buy error:", err);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
