const DEFAULT_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface BrokerSessionReference {
  issuer: string;
  sid?: string;
  sub?: string;
  issuedAt?: number;
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

let redis: unknown = null;

async function getRedis() {
  if (!redis) {
    const { default: Redis } = await import(/* webpackIgnore: true */ "ioredis");
    redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    (redis as { on: (e: string, cb: () => void) => void }).on("error", () => {});
  }
  return redis as {
    set: (key: string, value: string, mode: "EX", ttl: number) => Promise<string | null>;
    get: (key: string) => Promise<string | null>;
  };
}

/**
 * Revokes the exact broker session and, when a subject is available, every
 * session for that subject that was issued before the revocation cutoff.
 * Newly authenticated sessions are therefore not blocked by an older logout.
 */
export async function revokeBrokerSession(
  reference: BrokerSessionReference,
  revokedAt = Math.floor(Date.now() / 1000)
): Promise<void> {
  if (!reference.issuer || (!reference.sid && !reference.sub)) return;

  try {
    const r = await getRedis();
    const writes: Promise<string | null>[] = [];
    if (reference.sid) {
      writes.push(
        r.set(
          identifierKey("sid", reference.issuer, reference.sid),
          "1",
          "EX",
          getSessionMaxAgeSeconds()
        )
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
    const r = await getRedis();
    const [sidRevoked, subjectCutoff] = await Promise.all([
      reference.sid
        ? r.get(identifierKey("sid", reference.issuer, reference.sid))
        : Promise.resolve(null),
      reference.sub
        ? r.get(identifierKey("sub", reference.issuer, reference.sub))
        : Promise.resolve(null),
    ]);

    if (sidRevoked) return true;
    if (!subjectCutoff) return false;

    const cutoff = Number(subjectCutoff);
    return !reference.issuedAt || !Number.isFinite(cutoff) || reference.issuedAt <= cutoff;
  } catch {
    return false;
  }
}
