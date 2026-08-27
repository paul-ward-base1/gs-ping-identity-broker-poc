"use client";

import { useSession, signIn } from "next-auth/react";
import { NavBar } from "@ciam-poc/ui";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/badges", label: "My Badges" },
  { href: "/troop-admin", label: "Troop Admin", adminOnly: true },
  { href: "/debug", label: "Token Inspector" },
];

export function MyGSNav() {
  const { data: session } = useSession();
  const claims = (session as unknown as { brokerClaims?: { roles?: string[] } })?.brokerClaims;

  return (
    <NavBar
      appName="myGS"
      links={links}
      user={session?.user}
      roles={claims?.roles ?? []}
      accentColor="bg-blue-800"
      onSignIn={() => {
        sessionStorage.removeItem("sso-checked");
        signIn("broker", { callbackUrl: "/" }, { kc_idp_hint: "gigya-b2c" });
      }}
      onSignOut={() => {
        sessionStorage.setItem("sso-checked", Date.now().toString());
        window.location.href = "/api/auth/federated-logout";
      }}
    />
  );
}
