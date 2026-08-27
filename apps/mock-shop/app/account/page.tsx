import { auth } from "@/auth";
import type { BrokerClaims } from "@ciam-poc/auth";

export default async function AccountPage() {
  const session = await auth();
  const claims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-lg text-gray-800">{claims?.name ?? session?.user?.name ?? "—"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-lg text-gray-800">{claims?.email ?? session?.user?.email ?? "—"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Roles</label>
          <div className="flex gap-2 mt-1">
            {(claims?.roles ?? []).map((role) => (
              <span
                key={role}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Upstream IdP</label>
          <p className="font-mono text-gray-800">{claims?.upstreamIdp ?? "unknown"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Subject (sub)</label>
          <p className="font-mono text-sm text-gray-600">{claims?.sub ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
