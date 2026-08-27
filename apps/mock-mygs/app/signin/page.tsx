"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const adminPaths = ["/troop-admin"];
const domainRouting: Record<string, string> = {
  "gsusa.org": "okta-workforce",
  "girlscouts.org": "okta-workforce",
  "base1.com": "gigya-b2c",
};

function getIdpHintFromEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? (domainRouting[domain] ?? null) : null;
}

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    if (manualMode) return;
    if (searchParams.get("error")) {
      sessionStorage.setItem("sso-checked", Date.now().toString());
      window.location.href = callbackUrl.startsWith("/") ? callbackUrl : "/";
      return;
    }
    const isAdminContext = adminPaths.some((p) => callbackUrl.includes(p));
    if (isAdminContext) {
      signIn("broker", { callbackUrl }, { kc_idp_hint: "okta-workforce" });
    } else {
      signIn("broker", { callbackUrl }, { kc_idp_hint: "gigya-b2c" });
    }
  }, [callbackUrl, manualMode, searchParams]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hint = getIdpHintFromEmail(email);
    if (hint) {
      signIn("broker", { callbackUrl }, { kc_idp_hint: hint });
    } else {
      signIn("broker", { callbackUrl });
    }
  };

  if (!manualMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Redirecting to login...</p>
          <button
            onClick={() => setManualMode(true)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
          >
            Having trouble? Sign in manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Sign in to myGS
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Enter your email and we&apos;ll route you to the right login.
        </p>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
          >
            Continue
          </button>
        </form>

        <button
          onClick={() => signIn("broker", { callbackUrl })}
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Show all login options
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
