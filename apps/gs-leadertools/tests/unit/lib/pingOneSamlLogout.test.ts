import { describe, expect, it } from "vitest";
import { getPingOneSamlSloUrl } from "@/lib/pingOneSamlLogout";

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
