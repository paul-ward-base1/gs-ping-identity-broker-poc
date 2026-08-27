import { auth } from "@/auth";
import type { BrokerClaims } from "@ciam-poc/auth";
import { RoleGate } from "@ciam-poc/ui";

const mockMembers = [
  { name: "Sarah Chen", grade: "5th", badges: 14, status: "Active" },
  { name: "Maya Johnson", grade: "4th", badges: 8, status: "Active" },
  { name: "Lily Park", grade: "5th", badges: 11, status: "Active" },
  { name: "Emma Davis", grade: "4th", badges: 6, status: "Inactive" },
  { name: "Sophia Martinez", grade: "5th", badges: 9, status: "Active" },
  { name: "Olivia Williams", grade: "3rd", badges: 3, status: "Active" },
];

export default async function TroopAdminPage() {
  const session = await auth();
  const claims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;
  const roles = claims?.roles ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Troop Management</h1>
      <p className="text-sm text-gray-500 mb-8">
        This page requires the <span className="font-mono">admin</span> role.
      </p>

      <RoleGate requiredRole="admin" currentRoles={roles}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold">Troop #4521 — Roster</h2>
            <span className="text-sm text-blue-200">{mockMembers.length} members</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Grade</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Badges</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockMembers.map((m) => (
                <tr key={m.name} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.grade}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{m.badges}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        m.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RoleGate>
    </div>
  );
}
