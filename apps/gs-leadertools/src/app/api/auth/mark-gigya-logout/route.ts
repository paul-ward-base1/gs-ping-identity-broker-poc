import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestOrigin } from "@/lib/requestOrigin";

const MARKER_ORIGIN = "https://cdc-login.gsusa.local";
const FORCE_LOGIN_COOKIE = "poc_force_gigya_login";
const ALLOWED_RETURN_ORIGINS = new Set([
  "https://leadertools.local",
  "https://gsregistration.local",
]);

export async function GET(request: NextRequest) {
  if (getRequestOrigin(request) !== MARKER_ORIGIN) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const requestedReturn = new URL(request.url).searchParams.get("redirect");
  if (!requestedReturn) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  let returnUrl: URL;
  try {
    returnUrl = new URL(requestedReturn);
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!ALLOWED_RETURN_ORIGINS.has(returnUrl.origin)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const response = NextResponse.redirect(`${returnUrl.origin}/`);
  response.cookies.set({
    name: FORCE_LOGIN_COOKIE,
    value: "1",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
