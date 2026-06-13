import { NextResponse, type NextRequest } from "next/server";

// Route protection scaffold.
//
// Week 1 runs on a localStorage-backed mock session, which the server cannot
// read, so per-tier authorization is enforced client-side in DashboardLayout.
// When the Spring Boot API lands, the session token will move to an httpOnly
// cookie and the tier checks below can be enabled server-side.
const TIER_PREFIXES = ["/ward", "/municipality", "/province", "/central", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Placeholder for cookie-based enforcement once real auth is wired:
  // const token = request.cookies.get("dn_token");
  // if (TIER_PREFIXES.some((p) => pathname.startsWith(p)) && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  void TIER_PREFIXES;
  void pathname;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ward/:path*",
    "/municipality/:path*",
    "/province/:path*",
    "/central/:path*",
    "/admin/:path*",
  ],
};
