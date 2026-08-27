export type UserRole = "member" | "admin";

export interface UpstreamClaims {
  amr?: string[];
  upstreamGroups?: string[];
  gsUserType?: string;
  councilCode?: string;
  gsGlobalId?: string;
  isAdultUser?: string;
  teamId?: string;
  houseHoldId?: string;
}

export interface BrokerClaims {
  sub: string;
  email: string;
  name: string;
  roles: UserRole[];
  upstreamIdp: string;
  brokerPlatform: string;
  brokerIssuer?: string;
  brokerSessionId?: string;
  brokerSessionIssuedAt?: number;
  rawIdToken?: Record<string, unknown>;
  rawAccessToken?: Record<string, unknown>;
  upstreamClaims?: UpstreamClaims;
}
