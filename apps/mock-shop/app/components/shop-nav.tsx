"use client";

import { useSession, signIn } from "next-auth/react";
import { NavBar } from "@ciam-poc/ui";

const links = [
  { href: "/account", label: "My Account" },
  { href: "/orders", label: "Orders" },
  { href: "/admin", label: "Store Admin", adminOnly: true },
  { href: "/debug", label: "Token Inspector" },
];

export function ShopNav() {
  const { data: session } = useSession();
  const claims = (session as unknown as { brokerClaims?: { roles?: string[] } })?.brokerClaims;

  return (
    <NavBar
      appName="GS Shop"
      links={links}
      user={session?.user}
      roles={claims?.roles ?? []}
      accentColor="bg-green-700"
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
