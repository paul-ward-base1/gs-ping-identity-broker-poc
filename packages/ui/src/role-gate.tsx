interface RoleGateProps {
  requiredRole: string;
  currentRoles: string[];
  children: React.ReactNode;
}

export function RoleGate({ requiredRole, currentRoles, children }: RoleGateProps) {
  if (currentRoles.includes(requiredRole)) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
      <p className="text-red-600 mb-4">
        This page requires the <span className="font-mono font-bold">{requiredRole}</span> role.
      </p>
      <p className="text-sm text-red-500">
        Your current roles:{" "}
        {currentRoles.length > 0
          ? currentRoles.map((r) => (
              <span
                key={r}
                className="inline-block px-2 py-0.5 bg-red-100 rounded font-mono text-xs mr-1"
              >
                {r}
              </span>
            ))
          : "none"}
      </p>
    </div>
  );
}
