import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, TOKEN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name } = body;

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json(
        { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ushbu foydalanuvchi nomi allaqachon band qilingan." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        password: hashedPassword,
        name: name?.trim() || cleanUsername,
        role: "USER",
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Ro'yxatdan o'tishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
