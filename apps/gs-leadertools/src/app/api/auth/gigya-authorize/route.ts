import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestOrigin } from "@/lib/requestOrigin";

const PROXY_ORIGIN = "https://cdc-login.gsusa.local";
const GIGYA_AUTHORIZATION_ENDPOINT =
  "https://fidm.us1.gigya.com/oidc/op/v1.0/" +
  "3_YoJzW6wU2ztZGfCO9kiWJybg7MzyR7im1O9zDUGiVGqjofalYsOmdLtL9ULdjQG5/authorize";
const FORCE_LOGIN_COOKIE = "poc_force_gigya_login";

const REQUIRED_PARAMETERS = ["client_id", "redirect_uri", "response_type", "state"];

export async function GET(request: NextRequest) {
  // This endpoint is intentionally available only on the local hostname that
  // will be registered as PingOne's temporary POC authorization endpoint.
  if (getRequestOrigin(request) !== PROXY_ORIGIN) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const incoming = new URL(request.url);
  const missingParameters = REQUIRED_PARAMETERS.filter(
    (parameter) => !incoming.searchParams.has(parameter),
  );
  if (missingParameters.length > 0) {
    return NextResponse.json(
      { error: "invalid_request", missingParameters },
      { status: 400 },
    );
  }

  const gigyaAuthorizationUrl = new URL(GIGYA_AUTHORIZATION_ENDPOINT);
  gigyaAuthorizationUrl.search = incoming.search;

  const promptValues = incoming.searchParams.get("prompt")?.split(" ") ?? [];
  const isSilentRequest = promptValues.includes("none");
  const shouldForceLogin =
    request.cookies.get(FORCE_LOGIN_COOKIE)?.value === "1" && !isSilentRequest;

  // Preserve normal Gigya SSO across applications. Only the first interactive
  // authorization after an explicit logout is changed to prompt=login.
  if (shouldForceLogin) {
    gigyaAuthorizationUrl.searchParams.set("prompt", "login");
  }

  const response = NextResponse.redirect(gigyaAuthorizationUrl);
  if (shouldForceLogin) {
    response.cookies.set({
      name: FORCE_LOGIN_COOKIE,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
