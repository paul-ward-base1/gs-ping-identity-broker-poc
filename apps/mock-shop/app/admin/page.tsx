import { auth } from "@/auth";
import type { BrokerClaims } from "@ciam-poc/auth";
import { RoleGate } from "@ciam-poc/ui";

const mockInventory = [
  { sku: "CK-001", name: "Thin Mints", stock: 2450, price: "$5.00" },
  { sku: "CK-002", name: "Samoas", stock: 1820, price: "$5.00" },
  { sku: "CK-003", name: "Tagalongs", stock: 980, price: "$5.00" },
  { sku: "GR-010", name: "Badge Sash (Brownie)", stock: 340, price: "$18.50" },
  { sku: "GR-011", name: "Badge Sash (Junior)", stock: 275, price: "$18.50" },
  { sku: "CP-020", name: "Camp Essentials Pack", stock: 150, price: "$42.00" },
];

export default async function AdminPage() {
  const session = await auth();
  const claims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;
  const roles = claims?.roles ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Store Admin</h1>
      <p className="text-sm text-gray-500 mb-8">
        This page requires the <span className="font-mono">admin</span> role.
      </p>

      <RoleGate requiredRole="admin" currentRoles={roles}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-700 text-white px-4 py-3">
            <h2 className="font-semibold">Inventory Management</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
              </tr>
            </thead>
            <tbody>
              {mockInventory.map((item) => (
                <tr key={item.sku} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        item.stock < 200
                          ? "text-red-600 font-semibold"
                          : "text-gray-800"
                      }
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RoleGate>
    </div>
  );
}
