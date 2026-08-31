import Redis from "ioredis";
import { createRemoteJWKSet, jwtVerify } from "jose";

const DEFAULT_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const BACKCHANNEL_LOGOUT_EVENT = "http://schemas.openid.net/event/backchannel-logout";

export interface BrokerSessionReference {
  issuer: string;
  sid?: string;
  sub?: string;
  issuedAt?: number;
}

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    redis.on("error", () => {});
  }
  return redis;
}

export function getSessionMaxAgeSeconds(): number {
  const configured = Number(process.env.AUTH_SESSION_MAX_AGE);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_SESSION_MAX_AGE_SECONDS;
}

function identifierKey(kind: "sid" | "sub", issuer: string, value: string): string {
  return `bcl:revoked:${kind}:${encodeURIComponent(issuer)}:${encodeURIComponent(value)}`;
}

function upstreamKey(issuer: string, sid: string): string {
  return `broker:upstream:${encodeURIComponent(issuer)}:${encodeURIComponent(sid)}`;
}

// Records which upstream IdP authenticated a PingOne browser session so other
// participating applications can select the matching broker logout strategy.
// A silently SSO'd application receives a token without the OktaOnly acr or a
// usable identity_provider claim; the shared sid is its only link to Okta.
export async function recordBrokerSessionUpstream(reference: {
  issuer: string;
  sid?: string;
  upstream: string;
}): Promise<void> {
  if (!reference.issuer || !reference.sid) return;

  try {
    await getRedis().set(
      upstreamKey(reference.issuer, reference.sid),
      reference.upstream,
      "EX",
      getSessionMaxAgeSeconds()
    );
  } catch {
    console.warn("[auth] Redis unavailable — session upstream not persisted");
  }
}

export async function lookupBrokerSessionUpstream(reference: {
  issuer?: string;
  sid?: string;
}): Promise<string | undefined> {
  if (!reference.issuer || !reference.sid) return undefined;

  try {
    return (
      (await getRedis().get(upstreamKey(reference.issuer, reference.sid))) ??
      undefined
    );
  } catch {
    return undefined;
  }
}

export async function revokeBrokerSession(
  reference: BrokerSessionReference,
  revokedAt = Math.floor(Date.now() / 1000)
): Promise<void> {
  if (!reference.issuer || (!reference.sid && !reference.sub)) return;

  try {
    const r = getRedis();
    const writes: Promise<"OK" | null>[] = [];
    if (reference.sid) {
      writes.push(
        r.set(identifierKey("sid", reference.issuer, reference.sid), "1", "EX", getSessionMaxAgeSeconds())
      );
    }
    if (reference.sub) {
      writes.push(
        r.set(
          identifierKey("sub", reference.issuer, reference.sub),
          String(revokedAt),
          "EX",
          getSessionMaxAgeSeconds()
        )
      );
    }
    await Promise.all(writes);
  } catch {
    console.warn("[BCL] Redis unavailable — revocation not persisted");
  }
}

export async function isSessionRevoked(reference: BrokerSessionReference): Promise<boolean> {
  if (!reference.issuer || (!reference.sid && !reference.sub)) return false;

  try {
    const r = getRedis();
    const [sidRevoked, subjectCutoff] = await Promise.all([
      reference.sid ? r.get(identifierKey("sid", reference.issuer, reference.sid)) : null,
      reference.sub ? r.get(identifierKey("sub", reference.issuer, reference.sub)) : null,
    ]);
    if (sidRevoked) return true;
    if (!subjectCutoff) return false;

    const cutoff = Number(subjectCutoff);
    return !reference.issuedAt || !Number.isFinite(cutoff) || reference.issuedAt <= cutoff;
  } catch {
    return false;
  }
}

export async function verifyAndHandleBackchannelLogout(
  logoutToken: string,
  options: { issuer: string; audience: string }
): Promise<void> {
  const discoveryResponse = await fetch(
    `${options.issuer.replace(/\/$/, "")}/.well-known/openid-configuration`
  );
  if (!discoveryResponse.ok) throw new Error("unable to load OIDC discovery");

  const metadata = (await discoveryResponse.json()) as { jwks_uri?: string };
  if (!metadata.jwks_uri) throw new Error("OIDC discovery is missing jwks_uri");

  const { payload } = await jwtVerify(
    logoutToken,
    createRemoteJWKSet(new URL(metadata.jwks_uri)),
    {
      issuer: options.issuer,
      audience: options.audience,
      algorithms: ["RS256"],
      requiredClaims: ["iat", "jti", "events"],
      maxTokenAge: "5 minutes",
      clockTolerance: 5,
    }
  );

  const events = payload.events;
  if (
    !events ||
    typeof events !== "object" ||
    !(BACKCHANNEL_LOGOUT_EVENT in events) ||
    payload.nonce !== undefined ||
    typeof payload.jti !== "string" ||
    (typeof payload.sid !== "string" && typeof payload.sub !== "string")
  ) {
    throw new Error("invalid logout token claims");
  }

  await revokeBrokerSession(
    {
      issuer: payload.iss!,
      sid: payload.sid as string | undefined,
      sub: payload.sub,
    },
    payload.iat
  );
}
