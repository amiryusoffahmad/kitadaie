import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request) {
  const sessionCookie = getSessionCookie(request);
  const signInPath = request.nextUrl.pathname.startsWith("/sign-in");

  if (!sessionCookie && !signInPath) {
    const redirectResponse = NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
    redirectResponse.headers.set("x-middleware-cache", "no-cache");
    return redirectResponse;
  }

  if (sessionCookie && signInPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/user/:path*", "/sign-in"],
};
