import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-auth.session-token"
    : "dev-auth.session-token";
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/admin/:path*",
    "/",
    "/features/:path*",
    "/dashboard/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/group/:path*",
    "/category/:path*",
    "/products/:path*",
  ],
};
