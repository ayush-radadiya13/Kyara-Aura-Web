import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/lib/constants";

const guestOnlyPaths = ["/login", "/register"];
const protectedPaths = ["/account", "/wishlist"];

function isProtectedPath(pathname) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isGuestOnlyPath(pathname) {
  return guestOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnlyPath(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/account/:path*", "/wishlist/:path*"],
};
