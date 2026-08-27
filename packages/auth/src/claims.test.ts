import { describe, it, expect } from "vitest";
import { extractRoles, extractUpstreamIdp, detectBrokerPlatform, extractUpstreamClaims } from "./claims";

describe("extractRoles", () => {
  it("extracts roles from realm_access.roles", () => {
    expect(extractRoles({ realm_access: { roles: ["member", "offline_access", "uma_authorization"] } }))
      .toEqual(["member"]);
  });

  it("extracts admin role", () => {
    expect(extractRoles({ realm_access: { roles: ["admin", "member"] } }))
      .toEqual(["admin", "member"]);
  });

  it("falls back to flat roles array", () => {
    expect(extractRoles({ roles: ["admin"] })).toEqual(["admin"]);
  });

  it("returns empty for no roles", () => {
    expect(extractRoles({})).toEqual([]);
  });

  it("filters out non-standard roles", () => {
    expect(extractRoles({ realm_access: { roles: ["default-roles-gsusa-poc", "offline_access", "member"] } }))
      .toEqual(["member"]);
  });
});

describe("extractUpstreamIdp", () => {
  it("returns identity_provider claim", () => {
    expect(extractUpstreamIdp({ identity_provider: "gigya-b2c" })).toBe("gigya-b2c");
  });

  it("returns okta-workforce", () => {
    expect(extractUpstreamIdp({ identity_provider: "okta-workforce" })).toBe("okta-workforce");
  });

  it("defaults to local when missing", () => {
    expect(extractUpstreamIdp({})).toBe("local");
  });
});

describe("detectBrokerPlatform", () => {
  it("detects keycloak from issuer with /realms/", () => {
    expect(detectBrokerPlatform("https://auth.gsusa.local/realms/gsusa-poc")).toBe("keycloak");
  });

  it("returns mock for undefined issuer", () => {
    expect(detectBrokerPlatform(undefined)).toBe("mock");
  });

  it("returns unknown for non-keycloak issuer", () => {
    expect(detectBrokerPlatform("https://login.microsoftonline.com/tenant")).toBe("unknown");
  });
});

describe("extractUpstreamClaims", () => {
  it("extracts all CDC GSUSA claims", () => {
    const token = {
      upstream_gsUserType: "volunteer",
      upstream_councilCode: "623",
      upstream_gsGlobalId: "GS-POC-001",
      upstream_isAdultUser: "true",
      upstream_teamId: "T-4521",
      upstream_houseHoldId: "HH-9001",
    };
    const claims = extractUpstreamClaims(token);
    expect(claims.gsUserType).toBe("volunteer");
    expect(claims.councilCode).toBe("623");
    expect(claims.gsGlobalId).toBe("GS-POC-001");
    expect(claims.isAdultUser).toBe("true");
    expect(claims.teamId).toBe("T-4521");
    expect(claims.houseHoldId).toBe("HH-9001");
  });

  it("extracts AMR as array", () => {
    const claims = extractUpstreamClaims({ amr: ["pwd", "mfa"] });
    expect(claims.amr).toEqual(["pwd", "mfa"]);
  });

  it("parses AMR from JSON string", () => {
    const claims = extractUpstreamClaims({ amr: '["pwd","otp"]' });
    expect(claims.amr).toEqual(["pwd", "otp"]);
  });

  it("wraps single AMR string in array", () => {
    const claims = extractUpstreamClaims({ amr: "pwd" });
    expect(claims.amr).toEqual(["pwd"]);
  });

  it("extracts upstream groups", () => {
    const claims = extractUpstreamClaims({ upstream_groups: ["admins", "staff"] });
    expect(claims.upstreamGroups).toEqual(["admins", "staff"]);
  });

  it("returns empty object for token with no upstream claims", () => {
    const claims = extractUpstreamClaims({ sub: "123", email: "test@test.com" });
    expect(claims).toEqual({});
  });

  it("ignores non-string upstream values", () => {
    const claims = extractUpstreamClaims({ upstream_gsUserType: 42 });
    expect(claims.gsUserType).toBeUndefined();
  });
});
