import { describe, expect, it } from "vitest";
import {
  getBrokerLogoutStrategy as getLeaderToolsLogoutStrategy,
  getPingOneSamlSloUrl,
} from "@/lib/pingOneSamlLogout";
import { getBrokerLogoutStrategy as getRegistrationLogoutStrategy } from "../../../../gs-registration/src/auth/pingone-saml-logout";

describe("getPingOneSamlSloUrl", () => {
  it("uses an explicitly configured HTTPS endpoint", () => {
    expect(
      getPingOneSamlSloUrl(
        "https://auth.pingone.ca/environment/as",
        "https://broker.example.test/custom/startslo",
      ),
    ).toBe("https://broker.example.test/custom/startslo");
  });

  it("derives the SAML SLO endpoint from a PingOne OIDC issuer", () => {
    expect(
      getPingOneSamlSloUrl(
        "https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/as",
        "",
      ),
    ).toBe(
      "https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/saml20/startslo",
    );
  });

  it("does not derive an endpoint for a non-PingOne issuer", () => {
    expect(
      getPingOneSamlSloUrl("https://issuer.example.test/as", ""),
    ).toBeUndefined();
  });

  it("rejects an insecure configured endpoint", () => {
    expect(
      getPingOneSamlSloUrl(
        "https://issuer.example.test/as",
        "http://broker.example.test/startslo",
      ),
    ).toBeUndefined();
  });
});

describe.each([
  ["Leader Tools", getLeaderToolsLogoutStrategy],
  ["Registration", getRegistrationLogoutStrategy],
])("%s broker logout strategy", (_app, getStrategy) => {
  it("selects SAML SLO for an Okta-backed session", () => {
    expect(
      getStrategy("okta-workforce", "https://auth.pingone.ca/environment/saml20/startslo"),
    ).toBe("saml");
  });

  it("retains OIDC signoff for a Gigya-backed session", () => {
    expect(
      getStrategy("gigya-b2c", "https://auth.pingone.ca/environment/saml20/startslo"),
    ).toBe("oidc");
  });

  it("falls back to OIDC signoff when the SAML endpoint is unavailable", () => {
    expect(getStrategy("okta-workforce", undefined)).toBe("oidc");
  });
});
