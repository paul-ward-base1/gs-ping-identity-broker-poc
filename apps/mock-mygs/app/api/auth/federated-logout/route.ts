import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { revokeBrokerSession } from "@ciam-poc/auth";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.csrf-token",
  "authjs.csrf-token",
  "__Secure-authjs.callback-url",
  "authjs.callback-url",
];

export async function GET(request: NextRequest) {
  const issuer = process.env.AUTH_ISSUER;
  const appUrl = process.env.AUTH_URL ?? request.nextUrl.origin;

  const session = await auth();
  const brokerClaims = (session as unknown as {
    brokerClaims?: {
      sub?: string;
      brokerPlatform?: string;
      brokerIssuer?: string;
      brokerSessionId?: string;
      brokerSessionIssuedAt?: number;
    };
  })?.brokerClaims;
  const idTokenJwt = (session as unknown as { idTokenJwt?: string })?.idTokenJwt;

  if (brokerClaims?.brokerIssuer) {
    await revokeBrokerSession({
      issuer: brokerClaims.brokerIssuer,
      sid: brokerClaims.brokerSessionId,
      sub: brokerClaims.sub,
      issuedAt: brokerClaims.brokerSessionIssuedAt,
    });
  }

  let logoutUrl = appUrl;
  if (issuer && brokerClaims?.brokerPlatform === "pingone") {
    const pingLogout = new URL(`${issuer}/signoff`);
    if (idTokenJwt) pingLogout.searchParams.set("id_token_hint", idTokenJwt);
    pingLogout.searchParams.set("post_logout_redirect_uri", appUrl);
    logoutUrl = pingLogout.toString();
  }

  const response = NextResponse.redirect(logoutUrl);
  const isSecure = appUrl.startsWith("https://");
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.set(name, "", { path: "/", secure: isSecure, maxAge: 0 });
  }
  for (let i = 0; i < 10; i++) {
    response.cookies.set(`authjs.session-token.${i}`, "", { path: "/", secure: isSecure, maxAge: 0 });
    response.cookies.set(`__Secure-authjs.session-token.${i}`, "", { path: "/", secure: isSecure, maxAge: 0 });
  }
  return response;
}
