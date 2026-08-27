import { auth } from "@/auth";

const mockOrders = [
  { id: "GS-10042", date: "2026-03-15", items: "Cookie Starter Kit x2", total: "$49.98", status: "Delivered" },
  { id: "GS-10038", date: "2026-03-02", items: "Trefoil Badge Sash", total: "$18.50", status: "Delivered" },
  { id: "GS-10051", date: "2026-03-28", items: "Camp Essentials Pack", total: "$42.00", status: "Shipped" },
  { id: "GS-10055", date: "2026-04-05", items: "S'mores Deluxe Box x3", total: "$47.97", status: "Processing" },
];

export default async function OrdersPage() {
  await auth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Order ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Items</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Total</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-sm text-green-700">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{order.items}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{order.total}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center">
        Mock data — not real orders.
      </p>
    </div>
  );
}
