import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import {
  getSessionMaxAgeSeconds,
  isSessionRevoked,
} from "./lib/brokerSessionRevocation";

type UserRole = "member" | "admin";

interface UpstreamClaims {
  amr?: string[];
  upstreamGroups?: string[];
  gsUserType?: string;
  councilCode?: string;
  gsGlobalId?: string;
  isAdultUser?: string;
  teamId?: string;
  houseHoldId?: string;
}

interface BrokerClaims {
  sub: string;
  email: string;
  name: string;
  roles: UserRole[];
  upstreamIdp: string;
  brokerPlatform: string;
  brokerIssuer?: string;
  brokerSessionId?: string;
  brokerSessionIssuedAt?: number;
  upstreamClaims?: UpstreamClaims;
}

function extractRoles(token: Record<string, unknown>): UserRole[] {
  const realmAccess = token["realm_access"] as { roles?: string[] } | undefined;
  const raw = realmAccess?.roles ?? (token["roles"] as string[]) ?? [];
  return raw.filter((r): r is UserRole => r === "member" || r === "admin");
}

function extractUpstreamClaims(token: Record<string, unknown>): UpstreamClaims {
  const claims: UpstreamClaims = {};
  if (typeof token["upstream_councilCode"] === "string") claims.councilCode = token["upstream_councilCode"] as string;
  if (typeof token["upstream_gsUserType"] === "string") claims.gsUserType = token["upstream_gsUserType"] as string;
  if (typeof token["upstream_gsGlobalId"] === "string") claims.gsGlobalId = token["upstream_gsGlobalId"] as string;
  if (typeof token["upstream_isAdultUser"] === "string") claims.isAdultUser = token["upstream_isAdultUser"] as string;
  if (typeof token["upstream_teamId"] === "string") claims.teamId = token["upstream_teamId"] as string;
  if (typeof token["upstream_houseHoldId"] === "string") claims.houseHoldId = token["upstream_houseHoldId"] as string;
  return claims;
}

const issuer = process.env.AUTH_ISSUER;

function detectBrokerPlatform(iss: string | undefined): string {
  if (!iss) return "mock";
  if (iss.includes("/realms/")) return "keycloak";
  if (iss.includes("pingone.")) return "pingone";
  return "unknown";
}

const config: NextAuthConfig = {
  providers: [
    {
      id: "broker",
      name: "CIAM Broker",
      type: "oidc",
      issuer,
      clientId: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      authorization: { params: { scope: "openid profile email" } },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (
        token.brokerIssuer &&
        await isSessionRevoked({
          issuer: token.brokerIssuer as string,
          sid: token.sid as string | undefined,
          sub: token.sub,
          issuedAt: token.brokerSessionIssuedAt as number | undefined,
        })
      ) {
        return { ...token, revoked: true };
      }
      if (account) {
        const idTokenClaims = account.id_token
          ? (JSON.parse(Buffer.from(account.id_token.split(".")[1], "base64").toString()) as Record<string, unknown>)
          : {};
        token.roles = extractRoles(idTokenClaims);
        token.upstreamIdp = (idTokenClaims["identity_provider"] as string) ?? "local";
        token.upstreamClaims = extractUpstreamClaims(idTokenClaims);
        token.rawIdToken = idTokenClaims;
        token.idTokenJwt = account.id_token;
        token.brokerPlatform = detectBrokerPlatform(issuer);
        token.brokerIssuer = (idTokenClaims["iss"] as string | undefined) ?? issuer;
        token.brokerSessionIssuedAt = idTokenClaims["iat"] as number | undefined;
        token.sub = idTokenClaims["sub"] as string;
        token.sid = idTokenClaims["sid"] as string;

        if (account.access_token) {
          try {
            token.rawAccessToken = JSON.parse(
              Buffer.from(account.access_token.split(".")[1], "base64").toString()
            ) as Record<string, unknown>;
          } catch {
            token.rawAccessToken = { opaque: account.access_token };
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.revoked) {
        (session as unknown as { revoked: boolean }).revoked = true;
        session.user = undefined as unknown as typeof session.user;
        return session;
      }
      const brokerClaims: BrokerClaims = {
        sub: (token.sub as string) ?? "",
        email: (token.email as string) ?? "",
        name: (token.name as string) ?? "",
        roles: (token.roles as UserRole[]) ?? [],
        upstreamIdp: (token.upstreamIdp as string) ?? "unknown",
        brokerPlatform: (token.brokerPlatform as string) ?? "keycloak",
        brokerIssuer: token.brokerIssuer as string | undefined,
        brokerSessionId: token.sid as string | undefined,
        brokerSessionIssuedAt: token.brokerSessionIssuedAt as number | undefined,
        upstreamClaims: token.upstreamClaims as UpstreamClaims | undefined,
      };
      const rawIdToken = token.rawIdToken as Record<string, unknown> | undefined;
      const rawAccessToken = token.rawAccessToken as Record<string, unknown> | undefined;
      (session as unknown as { brokerClaims: BrokerClaims & { rawIdToken?: Record<string, unknown>; rawAccessToken?: Record<string, unknown> } }).brokerClaims = {
        ...brokerClaims,
        rawIdToken,
        rawAccessToken,
      };
      (session as unknown as { idTokenJwt?: string }).idTokenJwt = token.idTokenJwt as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/en/signin",
  },
  session: { strategy: "jwt", maxAge: getSessionMaxAgeSeconds() },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
