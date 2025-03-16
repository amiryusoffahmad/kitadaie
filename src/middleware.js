import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader?.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc.set(key, value);
    return acc;
  }, new Map());

  const sessionCookie =
    cookies?.get("kitadaie.session_token") ||
    cookies?.get("__Secure-kitadaie.session_token");

  const signInPath = request.nextUrl.pathname.startsWith("/sign-in");

  if (!sessionCookie && !signInPath) {
    const redirectResponse = NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
    redirectResponse.headers.set("x-middleware-cache", "no-cache");
    return redirectResponse;
  }

  // const cookies = getSessionCookie(request)

  // if (!cookies && !signInPath) {
  //   return NextResponse.redirect(new URL(`/sign-in`, request.url))
  // }

  if (sessionCookie && signInPath) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/sign-in"],
};
