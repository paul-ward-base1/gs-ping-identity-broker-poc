import { auth } from "@/auth";
import type { BrokerClaims } from "@ciam-poc/auth";

export default async function DashboardPage() {
  const session = await auth();
  const claims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-lg text-blue-800 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-800">{claims?.name ?? session?.user?.name ?? "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-800">{claims?.email ?? session?.user?.email ?? "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Roles</label>
              <div className="flex gap-2 mt-1">
                {(claims?.roles ?? []).map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Upstream IdP</label>
              <p className="font-mono text-sm text-gray-600">{claims?.upstreamIdp ?? "unknown"}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-lg text-blue-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-800">12</div>
              <div className="text-sm text-gray-500 mt-1">Badges Earned</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-3xl font-bold text-amber-700">3</div>
              <div className="text-sm text-gray-500 mt-1">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">47</div>
              <div className="text-sm text-gray-500 mt-1">Cookie Boxes Sold</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-700">5</div>
              <div className="text-sm text-gray-500 mt-1">Events Attended</div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-400 text-center">Mock data for PoC demonstration.</p>
    </div>
  );
}
