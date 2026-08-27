import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { BrokerClaims, UpstreamClaims, UserRole } from "./types";
import { extractRoles, extractUpstreamIdp, detectBrokerPlatform, extractUpstreamClaims } from "./claims";
import { getSessionMaxAgeSeconds, isSessionRevoked } from "./backchannel-logout";

export function createAuthConfig(): NextAuthConfig {
  const issuer = process.env.AUTH_ISSUER;
  const useMock = !issuer;

  const providers: NextAuthConfig["providers"] = [];

  if (!useMock) {
    providers.push({
      id: "broker",
      name: "CIAM Broker",
      type: "oidc",
      issuer,
      clientId: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      style: { logo: "", text: "#fff", bg: "#0d9488" },
    });
  } else {
    providers.push(
      Credentials({
        id: "mock",
        name: "Mock Login",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "user@gsusa-poc.com" },
          name: { label: "Name", type: "text", placeholder: "Test User" },
          role: { label: "Role", type: "text", placeholder: "member or admin" },
        },
        async authorize(credentials) {
          const email = (credentials?.email as string) || "member@gsusa-poc.com";
          const name = (credentials?.name as string) || "Test User";
          const roleStr = (credentials?.role as string) || "member";
          const roles = roleStr.split(",").map((r) => r.trim()) as UserRole[];

          return {
            id: email,
            email,
            name,
            roles,
            upstreamIdp: "mock",
          };
        },
      })
    );
  }

  return {
    providers,
    callbacks: {
      async jwt({ token, user, account }) {
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
        if (user) {
          if (useMock) {
            const mockUser = user as { roles?: UserRole[]; upstreamIdp?: string };
            token.roles = mockUser.roles ?? ["member"];
            token.upstreamIdp = mockUser.upstreamIdp ?? "mock";
            token.brokerPlatform = "mock";
          } else if (account) {
            const idTokenClaims = (account.id_token
              ? JSON.parse(
                  Buffer.from(account.id_token.split(".")[1], "base64").toString()
                )
              : {}) as Record<string, unknown>;

            token.roles = extractRoles(idTokenClaims);
            token.upstreamIdp = extractUpstreamIdp(idTokenClaims);
            token.upstreamClaims = extractUpstreamClaims(idTokenClaims);
            token.rawIdToken = idTokenClaims;
            token.idTokenJwt = account.id_token;
            token.brokerPlatform = detectBrokerPlatform(issuer);
            token.brokerIssuer = (idTokenClaims.iss as string | undefined) ?? issuer;
            token.sid = idTokenClaims.sid as string | undefined;
            token.brokerSessionIssuedAt = idTokenClaims.iat as number | undefined;

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
          roles: (token.roles as UserRole[]) ?? ["member"],
          upstreamIdp: (token.upstreamIdp as string) ?? "unknown",
          brokerPlatform: (token.brokerPlatform as string) ?? "mock",
          brokerIssuer: token.brokerIssuer as string | undefined,
          brokerSessionId: token.sid as string | undefined,
          brokerSessionIssuedAt: token.brokerSessionIssuedAt as number | undefined,
          rawIdToken: token.rawIdToken as Record<string, unknown> | undefined,
          rawAccessToken: token.rawAccessToken as Record<string, unknown> | undefined,
          upstreamClaims: token.upstreamClaims as UpstreamClaims | undefined,
        };
        (session as unknown as { brokerClaims: BrokerClaims }).brokerClaims = brokerClaims;
        (session as unknown as { idTokenJwt?: string }).idTokenJwt = token.idTokenJwt as string | undefined;
        return session;
      },
    },
    pages: {
      signIn: "/signin",
      error: "/auth-error",
    },
    session: {
      strategy: "jwt",
      maxAge: getSessionMaxAgeSeconds(),
    },
    trustHost: true,
  };
}
