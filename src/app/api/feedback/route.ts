import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFeedbackEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Iltimos, barcha maydonlarni (ism, email va xabar) to'ldiring." },
        { status: 400 }
      );
    }

    if (message.trim().length < 5) {
      return NextResponse.json(
        { error: "Sharh matni kamida 5 ta belgidan iborat bo'lishi kerak." },
        { status: 400 }
      );
    }

    // 1. Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      },
    });

    // 2. Send email via nodemailer to attentionjhon@gmail.com
    const emailResult = await sendFeedbackEmail({
      name: feedback.name,
      email: feedback.email,
      message: feedback.message,
    });

    return NextResponse.json({
      success: true,
      message: "Sharhingiz muvaffaqiyatli qabul qilindi va ma'muriyatga yuborildi!",
      emailSent: emailResult.success,
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Sharhni yuborishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Fetch feedbacks error:", error);
    return NextResponse.json({ error: "Sharhlarni yuklashda xatolik" }, { status: 500 });
  }
}
