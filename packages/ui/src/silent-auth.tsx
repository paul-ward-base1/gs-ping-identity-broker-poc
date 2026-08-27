"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

const SSO_CHECK_COOLDOWN_MS = 30000;

export function SilentAuth() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "unauthenticated") return;

    const path = window.location.pathname;
    if (path.startsWith("/signin") || path.startsWith("/auth-error") || path.startsWith("/api/auth")) return;

    const checked = sessionStorage.getItem("sso-checked");
    const isRecent = checked && (Date.now() - parseInt(checked, 10)) < SSO_CHECK_COOLDOWN_MS;
    if (isRecent) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem("sso-checked", Date.now().toString());
      signIn("broker", { callbackUrl: window.location.href }, { prompt: "none" });
    }, 500);

    return () => clearTimeout(timer);
  }, [status]);

  return null;
}
