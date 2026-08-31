import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getRequestOrigin } from "@/lib/requestOrigin";
import {
  lookupBrokerSessionUpstream,
  revokeBrokerSession,
} from "@/lib/brokerSessionRevocation";
import {
  getBrokerLogoutStrategy,
  getPingOneSamlSloUrl,
} from "@/lib/pingOneSamlLogout";

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
  const appUrl = process.env.AUTH_URL ?? getRequestOrigin(request);

  const session = await auth();
  const federatedSession = session as typeof session & {
    brokerClaims?: {
      sub?: string;
      upstreamIdp?: string;
      brokerPlatform?: string;
      brokerIssuer?: string;
      brokerSessionId?: string;
      brokerSessionIssuedAt?: number;
      rawIdToken?: Record<string, unknown>;
    };
    idTokenJwt?: string;
  };
  const brokerClaims = federatedSession?.brokerClaims;
  const idTokenJwt = federatedSession?.idTokenJwt;

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
    const samlSloUrl = getPingOneSamlSloUrl(issuer);
    const acr = brokerClaims.rawIdToken?.["acr"] as string | undefined;
    // A silently acquired session (SilentAuth) carries neither the OktaOnly
    // acr nor a usable identity_provider claim; the shared upstream record
    // written at interactive login is its only link to Okta.
    const recordedUpstream = await lookupBrokerSessionUpstream({
      issuer: brokerClaims.brokerIssuer,
      sid: brokerClaims.brokerSessionId,
    });
    const strategy = getBrokerLogoutStrategy(
      recordedUpstream ?? brokerClaims.upstreamIdp,
      samlSloUrl,
      acr,
    );
    if (strategy === "saml" && samlSloUrl) {
      // Initiate SAML SLO before OIDC signoff destroys the PingOne browser
      // session and its record of the participating Okta SAML IdP. The
      // browser finishes on PingOne's Signed Off page: startslo recognizes
      // post_logout_redirect_uri but rejects registered URIs with
      // INVALID_POST_LOGOUT_REDIRECT_URI, with or without id_token_hint
      // (tested August 31, 2026), so no redirect back to the app is passed.
      logoutUrl = samlSloUrl;
      console.warn("[logout] Redirecting to PingOne SAML SLO", {
        upstreamIdp: brokerClaims.upstreamIdp,
        acr,
      });
    } else {
      // Keep the verified Gigya POC behavior. PingOne OIDC signoff is followed
      // by the registered post-signoff route, which marks the next interactive
      // Gigya authorization for forced reauthentication.
      const endpoint = idTokenJwt ? "idpSignoff" : "signoff";
      const pingLogout = new URL(`${issuer}/${endpoint}`);
      const postLogoutRedirectUri = new URL("/api/auth/post-signoff", appUrl).toString();
      if (idTokenJwt) pingLogout.searchParams.set("id_token_hint", idTokenJwt);
      pingLogout.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
      console.warn("[logout] Redirecting to PingOne OIDC signoff", {
        endpoint,
        hasIdTokenHint: Boolean(idTokenJwt),
        postLogoutRedirectUri,
        upstreamIdp: brokerClaims.upstreamIdp,
      });
      logoutUrl = pingLogout.toString();
    }
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
