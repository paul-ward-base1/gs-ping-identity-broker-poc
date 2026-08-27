"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error] = useState(searchParams.get("error") ?? "unknown");

  useEffect(() => {
    sessionStorage.setItem("sso-checked", Date.now().toString());
    const timer = setTimeout(() => router.replace("/"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Authentication Issue</h1>
        <p className="text-gray-500 text-sm mb-4">
          {error === "Configuration" ? "Identity provider configuration error." : `Error: ${error}`}
        </p>
        <p className="text-gray-400 text-xs">Redirecting to homepage...</p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
