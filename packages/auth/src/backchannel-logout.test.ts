import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

const mockSet = vi.fn().mockResolvedValue("OK");
const mockGet = vi.fn().mockResolvedValue(null);

vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    set: mockSet,
    get: mockGet,
    on: vi.fn(),
  })),
}));

import {
  isSessionRevoked,
  revokeBrokerSession,
} from "./backchannel-logout";
import { validateLogoutTokenClaims, verifyAndHandleBackchannelLogout } from "./logout-token";

const reference = {
  issuer: "https://broker.example.test/realms/ciam",
  sid: "sid-1",
  sub: "user-1",
  issuedAt: 100,
};

describe("backchannel logout revocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(null);
  });

  it("stores SID and subject revocations for the full session lifetime", async () => {
    await revokeBrokerSession(reference, 120);

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(
      expect.stringContaining(":sid:"),
      "1",
      "EX",
      2_592_000
    );
    expect(mockSet).toHaveBeenCalledWith(
      expect.stringContaining(":sub:"),
      "120",
      "EX",
      2_592_000
    );
  });

  it("reports an exact SID revocation", async () => {
    mockGet.mockResolvedValueOnce("1").mockResolvedValueOnce(null);
    expect(await isSessionRevoked(reference)).toBe(true);
  });

  it("revokes only subject sessions issued before the cutoff", async () => {
    mockGet.mockResolvedValueOnce(null).mockResolvedValueOnce("120");
    expect(await isSessionRevoked(reference)).toBe(true);

    mockGet.mockResolvedValueOnce(null).mockResolvedValueOnce("120");
    expect(await isSessionRevoked({ ...reference, sid: undefined, issuedAt: 121 })).toBe(false);
  });

  it("fails open when Redis is unavailable", async () => {
    mockGet.mockRejectedValueOnce(new Error("connection refused"));
    expect(await isSessionRevoked(reference)).toBe(false);
  });
});

describe("logout token claims", () => {
  const validClaims = {
    iss: reference.issuer,
    aud: "client-1",
    iat: 120,
    jti: "logout-1",
    sid: reference.sid,
    events: { "http://schemas.openid.net/event/backchannel-logout": {} },
  };

  it("accepts a standards-shaped logout token", () => {
    expect(() => validateLogoutTokenClaims(validClaims)).not.toThrow();
  });

  it("rejects a token without the logout event", () => {
    expect(() => validateLogoutTokenClaims({ ...validClaims, events: {} })).toThrow(/event/);
  });

  it("rejects nonce and requires sid or sub", () => {
    expect(() => validateLogoutTokenClaims({ ...validClaims, nonce: "nope" })).toThrow(/nonce/);
    const { sid: _sid, ...withoutSid } = validClaims;
    expect(() => validateLogoutTokenClaims(withoutSid)).toThrow(/sid or sub/);
  });
});

describe("signed logout token verification", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("verifies signature, issuer, audience and claims before revoking", async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const publicJwk = await exportJWK(publicKey);
    Object.assign(publicJwk, { kid: "test-key", alg: "RS256", use: "sig" });

    const issuer = "https://broker.example.test/realms/ciam";
    const audience = "client-1";
    const logoutToken = await new SignJWT({
      sid: "signed-sid",
      events: { "http://schemas.openid.net/event/backchannel-logout": {} },
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setJti("signed-logout-1")
      .setExpirationTime("5 minutes")
      .sign(privateKey);

    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/.well-known/openid-configuration")) {
        return Response.json({ jwks_uri: `${issuer}/jwks` });
      }
      if (url === `${issuer}/jwks`) {
        return Response.json({ keys: [publicJwk] });
      }
      return new Response(null, { status: 404 });
    }));

    await expect(
      verifyAndHandleBackchannelLogout(logoutToken, { issuer, audience })
    ).resolves.toMatchObject({ sid: "signed-sid", iss: issuer });
    expect(mockSet).toHaveBeenCalledWith(
      expect.stringContaining("signed-sid"),
      "1",
      "EX",
      2_592_000
    );

    const [header, payload, signature] = logoutToken.split(".");
    const tamperedSignature = `${signature.startsWith("a") ? "b" : "a"}${signature.slice(1)}`;
    const tampered = `${header}.${payload}.${tamperedSignature}`;
    await expect(
      verifyAndHandleBackchannelLogout(tampered, { issuer, audience })
    ).rejects.toThrow();
  });
});
