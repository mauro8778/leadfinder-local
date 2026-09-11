import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_INTERNO_COOKIE, DEMO_INTERNO_QUERY } from "@/lib/demo-preview";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const unlocked = request.cookies.get(DEMO_INTERNO_COOKIE)?.value === "1";

  if (pathname !== "/demo") {
    return NextResponse.next();
  }

  if (searchParams.get(DEMO_INTERNO_QUERY) === "1") {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete(DEMO_INTERNO_QUERY);
    const response = NextResponse.redirect(clean);
    response.cookies.set(DEMO_INTERNO_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  if (!unlocked) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/demo", "/demo/:path*"],
};
