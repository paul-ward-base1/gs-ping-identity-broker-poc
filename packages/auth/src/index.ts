export { createAuthConfig } from "./auth-config";
export { extractRoles, extractUpstreamIdp, detectBrokerPlatform, extractUpstreamClaims } from "./claims";
export {
  getSessionMaxAgeSeconds,
  isSessionRevoked,
  revokeBrokerSession,
} from "./backchannel-logout";
export type { BrokerSessionReference } from "./backchannel-logout";
export type { UserRole, BrokerClaims, UpstreamClaims } from "./types";
