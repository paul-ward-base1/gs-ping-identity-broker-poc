import { NextResponse } from "next/server";
import { verifyAndHandleBackchannelLogout } from "@ciam-poc/auth/logout-token";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const logoutToken = params.get("logout_token");

    if (!logoutToken) {
      return NextResponse.json({ error: "missing logout_token" }, { status: 400 });
    }

    const issuer = process.env.AUTH_ISSUER;
    const audience = process.env.AUTH_CLIENT_ID;
    if (!issuer || !audience) {
      return NextResponse.json({ error: "backchannel logout is not configured" }, { status: 503 });
    }

    await verifyAndHandleBackchannelLogout(logoutToken, { issuer, audience });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.warn("[BCL] Rejected logout token", error);
    return NextResponse.json({ error: "invalid logout_token" }, { status: 400 });
  }
}
