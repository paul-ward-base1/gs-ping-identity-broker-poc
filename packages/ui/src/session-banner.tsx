"use client";

interface SessionBannerProps {
  user?: { name?: string | null; email?: string | null } | null;
  roles: string[];
  upstreamIdp: string;
  brokerPlatform: string;
  sessionId?: string;
  amr?: string[];
  gsUserType?: string;
  councilCode?: string;
}

const idpColors: Record<string, string> = {
  "okta-workforce": "#1d4ed8",
  "gigya-b2c": "#9333ea",
  "local": "#0d9488",
  "mock": "#4b5563",
  "unknown": "#4b5563",
};

export function SessionBanner({
  user,
  roles,
  upstreamIdp,
  brokerPlatform,
  sessionId,
  amr,
  gsUserType,
  councilCode,
}: SessionBannerProps) {
  if (!user) return null;

  const bgColor = idpColors[upstreamIdp] ?? idpColors.unknown;

  return (
    <div style={{ backgroundColor: bgColor }} className="text-white px-4 py-2 text-sm flex items-center gap-4 flex-wrap">
      <span className="font-semibold">{user.name ?? user.email}</span>
      <span className="opacity-80">|</span>
      <span>
        Roles:{" "}
        {roles.map((r) => (
          <span
            key={r}
            className="inline-block px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono mr-1"
          >
            {r}
          </span>
        ))}
      </span>
      <span className="opacity-80">|</span>
      <span>
        IdP: <span className="font-mono">{upstreamIdp}</span>
      </span>
      <span className="opacity-80">|</span>
      <span>
        Broker: <span className="font-mono font-semibold">{brokerPlatform}</span>
      </span>
      {amr && amr.length > 0 && (
        <>
          <span className="opacity-80">|</span>
          <span>MFA: <span className="font-mono">{amr.join(", ")}</span></span>
        </>
      )}
      {gsUserType && (
        <>
          <span className="opacity-80">|</span>
          <span>Type: <span className="font-mono">{gsUserType}</span></span>
        </>
      )}
      {councilCode && (
        <>
          <span className="opacity-80">|</span>
          <span>Council: <span className="font-mono">{councilCode}</span></span>
        </>
      )}
      {sessionId && (
        <>
          <span className="opacity-80">|</span>
          <span className="font-mono text-xs opacity-70">sid: {sessionId.slice(0, 8)}...</span>
        </>
      )}
    </div>
  );
}
