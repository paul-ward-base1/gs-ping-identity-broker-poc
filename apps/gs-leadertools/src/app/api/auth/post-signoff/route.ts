import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestOrigin } from "@/lib/requestOrigin";

export async function GET(request: NextRequest) {
  const appUrl = process.env.AUTH_URL ?? getRequestOrigin(request);
  const markerUrl = new URL(
    "https://cdc-login.gsusa.local/api/auth/mark-gigya-logout",
  );
  markerUrl.searchParams.set("redirect", appUrl);

  // Mark the next interactive Gigya authorization for forced reauthentication,
  // while leaving later cross-application SSO requests untouched.
  return NextResponse.redirect(markerUrl);
}
