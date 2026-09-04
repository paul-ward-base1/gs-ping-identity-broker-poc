import { createRemoteJWKSet, jwtVerify } from "jose";
import { revokeBrokerSession } from "./backchannel-logout";

const BACKCHANNEL_LOGOUT_EVENT = "http://schemas.openid.net/event/backchannel-logout";

export interface LogoutTokenClaims {
  iss: string;
  aud: string | string[];
  iat: number;
  jti: string;
  sid?: string;
  sub?: string;
  events: Record<string, unknown>;
  nonce?: unknown;
}

export function validateLogoutTokenClaims(
  payload: Record<string, unknown>
): asserts payload is Record<string, unknown> & LogoutTokenClaims {
  const events = payload.events;
  if (!events || typeof events !== "object" || !(BACKCHANNEL_LOGOUT_EVENT in events)) {
    throw new Error("logout token is missing the backchannel-logout event");
  }
  if (payload.nonce !== undefined) {
    throw new Error("logout token must not contain a nonce");
  }
  if (typeof payload.jti !== "string" || payload.jti.length === 0) {
    throw new Error("logout token must contain a string jti");
  }
  if (typeof payload.sid !== "string" && typeof payload.sub !== "string") {
    throw new Error("logout token must contain sid or sub");
  }
}

// Cached per issuer so a repeated backchannel-logout POST reuses the same
// createRemoteJWKSet instance (which caches keys internally) instead of
// re-fetching OIDC discovery and rebuilding the JWKS client every call.
const verificationKeyPromises = new Map<string, Promise<ReturnType<typeof createRemoteJWKSet>>>();

async function getVerificationKey(issuer: string): Promise<ReturnType<typeof createRemoteJWKSet>> {
  let keyPromise = verificationKeyPromises.get(issuer);
  if (!keyPromise) {
    const discoveryUrl = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
    keyPromise = fetch(discoveryUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`unable to load OIDC discovery (${response.status})`);
        }
        return response.json() as Promise<{ jwks_uri?: string }>;
      })
      .then((metadata) => {
        if (!metadata.jwks_uri) throw new Error("OIDC discovery is missing jwks_uri");
        return createRemoteJWKSet(new URL(metadata.jwks_uri));
      });
    verificationKeyPromises.set(issuer, keyPromise);
  }
  return keyPromise;
}

export async function verifyAndHandleBackchannelLogout(
  logoutToken: string,
  options: { issuer: string; audience: string }
): Promise<LogoutTokenClaims> {
  const { payload } = await jwtVerify(
    logoutToken,
    await getVerificationKey(options.issuer),
    {
      issuer: options.issuer,
      audience: options.audience,
      algorithms: ["RS256"],
      requiredClaims: ["iat", "jti", "events"],
      maxTokenAge: "5 minutes",
      clockTolerance: 5,
    }
  );

  validateLogoutTokenClaims(payload);
  const claims = payload as unknown as LogoutTokenClaims;
  await revokeBrokerSession(
    { issuer: claims.iss, sid: claims.sid, sub: claims.sub },
    claims.iat
  );
  return claims;
}
