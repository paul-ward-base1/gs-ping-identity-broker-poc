import type { UserRole, UpstreamClaims } from "./types";

export function extractRoles(token: Record<string, unknown>): UserRole[] {
  const realmAccess = token["realm_access"] as { roles?: string[] } | undefined;
  const keycloakRoles = realmAccess?.roles;
  const flatRoles = token["roles"] as string[] | undefined;
  const raw = keycloakRoles ?? flatRoles ?? [];
  return raw.filter((r): r is UserRole => r === "member" || r === "admin");
}

export function extractUpstreamIdp(token: Record<string, unknown>): string {
  return (token["identity_provider"] as string) ?? "local";
}

export function detectBrokerPlatform(issuer: string | undefined): string {
  if (!issuer) return "mock";
  if (issuer.includes("/realms/")) return "keycloak";
  if (issuer.includes("pingone.")) return "pingone";
  return "unknown";
}

function parseStringOrArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return undefined;
}

export function extractUpstreamClaims(token: Record<string, unknown>): UpstreamClaims {
  const claims: UpstreamClaims = {};

  const amr = parseStringOrArray(token["amr"]);
  if (amr) claims.amr = amr;

  const groups = parseStringOrArray(token["upstream_groups"]);
  if (groups) claims.upstreamGroups = groups;

  if (typeof token["upstream_gsUserType"] === "string")
    claims.gsUserType = token["upstream_gsUserType"] as string;
  if (typeof token["upstream_councilCode"] === "string")
    claims.councilCode = token["upstream_councilCode"] as string;
  if (typeof token["upstream_gsGlobalId"] === "string")
    claims.gsGlobalId = token["upstream_gsGlobalId"] as string;
  if (typeof token["upstream_isAdultUser"] === "string")
    claims.isAdultUser = token["upstream_isAdultUser"] as string;
  if (typeof token["upstream_teamId"] === "string")
    claims.teamId = token["upstream_teamId"] as string;
  if (typeof token["upstream_houseHoldId"] === "string")
    claims.houseHoldId = token["upstream_houseHoldId"] as string;

  return claims;
}
