import { auth } from "@/auth";
import { NextResponse } from "next/server";

const memberRoutes = ["/account", "/orders"];
const adminRoutes = ["/admin"];
const authRequiredRoutes = ["/debug"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth as unknown as { user?: object; brokerClaims?: { roles?: string[]; revoked?: boolean } } | null;
  const roles = session?.brokerClaims?.roles ?? [];

  // Check for back-channel logout revocation
  if ((session as unknown as { revoked?: boolean })?.revoked) {
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    for (let i = 0; i < 10; i++) {
      response.cookies.delete(`authjs.session-token.${i}`);
      response.cookies.delete(`__Secure-authjs.session-token.${i}`);
    }
    return response;
  }

  const isMemberRoute = memberRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isAuthRequired = authRequiredRoutes.some((r) => pathname.startsWith(r));

  if (!isMemberRoute && !isAdminRoute && !isAuthRequired) return NextResponse.next();

  if (!session?.user) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isMemberRoute && !roles.includes("member")) {
    const deniedUrl = new URL("/access-denied", req.url);
    deniedUrl.searchParams.set("required", "member");
    deniedUrl.searchParams.set("current", roles.join(","));
    return NextResponse.redirect(deniedUrl);
  }

  if (isAdminRoute && !roles.includes("admin")) {
    const deniedUrl = new URL("/access-denied", req.url);
    deniedUrl.searchParams.set("required", "admin");
    deniedUrl.searchParams.set("current", roles.join(","));
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Session revocation uses Redis, which requires the full Node.js runtime.
  runtime: "nodejs",
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
