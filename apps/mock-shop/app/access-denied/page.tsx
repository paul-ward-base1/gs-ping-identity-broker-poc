import Link from "next/link";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string; current?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-md mx-auto mt-20 p-8 text-center">
      <div className="text-5xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        {params.required === "member"
          ? "This area requires a consumer account. Sign out and log in with your consumer credentials."
          : "You don't have the required role to view that page."}
      </p>
      {params.required && (
        <p className="text-sm text-gray-500 mb-2">
          Required: <span className="font-mono font-semibold">{params.required}</span>
        </p>
      )}
      {params.current && (
        <p className="text-sm text-gray-500 mb-6">
          Your roles: <span className="font-mono">{params.current || "none"}</span>
        </p>
      )}
      <Link
        href="/"
        className="inline-block px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
