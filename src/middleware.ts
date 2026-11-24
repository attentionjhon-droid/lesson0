import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "ndtu_coding_platform_secret_key_jwt_2026"
);

const TOKEN_COOKIE_NAME = "ndtu_coder_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  // Protect /masalalar/[id] (solving problems requires auth)
  const isProblemSolvePage = /^\/masalalar\/\d+/.test(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  if (isProblemSolvePage || isAdminPage) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set(
        "reason",
        isAdminPage ? "admin_required" : "auth_required"
      );
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      // If accessing /admin, require ADMIN role
      if (isAdminPage && role !== "ADMIN") {
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch {
      // Invalid token
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "session_expired");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(TOKEN_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/masalalar/:id+",
    "/admin/:path*",
  ],
};
