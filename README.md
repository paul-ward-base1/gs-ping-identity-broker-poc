# gs-ping-identity-broker-poc

A proof-of-concept pnpm/Turborepo monorepo exploring CIAM (Customer Identity & Access Management) SSO via PingOne. Two mock relying-party apps (`mock-shop`, `mock-mygs`) share a broker-based OIDC login and session state through a common `@ciam-poc/auth` package. The POC also integrates the Girl Scouts Registration and Leader Tools prototypes with PingOne to verify cross-application SSO, shared downstream logout, and provider-aware upstream logout through Gigya and Okta.

---

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 10.33.0 (declared in `package.json#packageManager`; run via [corepack](https://nodejs.org/api/corepack.html) or install directly)
- Docker with Docker Compose — `start-dev.sh` uses the root [`compose.yml`](./compose.yml) to run the shared Redis service required for downstream logout propagation and backchannel-logout revocation. The apps degrade gracefully if Redis isn't running, so Docker is optional for basic sign-in but required to demonstrate cross-app logout.
- [Caddy](https://caddyserver.com/) plus the documented `/etc/hosts` entries — optional for mock/localhost development, but required for the current live Gigya flow because its POC authorization proxy is registered at `https://cdc-login.gsusa.local`.

## Install

From the repo root:

```bash
pnpm install
```

This installs and links all workspace apps/packages except `gs-leadertools`, which is excluded from the pnpm workspace (see [`pnpm-workspace.yaml`](./pnpm-workspace.yaml)) and manages its own dependencies separately.

`gs-leadertools` needs its own one-time install before running it. Neither the root `pnpm install` nor `start-dev.sh` installs these dependencies:

```bash
cd apps/gs-leadertools && yarn install
```

Skipping this leaves `apps/gs-leadertools/node_modules` missing — `start-dev.sh` still launches `yarn dev` for it regardless, which fails immediately with `next: command not found` (visible in `.logs/gs-leadertools.log`), and the app never comes up.

## First-time POC configuration

A fresh checkout can start the application development servers after dependency installation, but the authentication flows do **not** run entirely out of the box. Even mock Auth.js login needs a locally generated session secret, and the complete live POC depends on the existing PingOne environment and additional local secrets that are deliberately excluded from Git.

| Component | Secret required locally? | Fresh-checkout behavior |
|---|---:|---|
| `mock-shop` / `mock-mygs` mock login | Locally generated Auth.js secret | Runs without PingOne when `AUTH_ISSUER` is unset, but each app still needs `AUTH_SECRET` in its `.env.local` for signed sessions. This is generated locally, not obtained from PingOne. |
| `mock-shop` / `mock-mygs` real PingOne login | Yes | Each app needs its own PingOne OIDC client ID and client secret plus `AUTH_ISSUER` and `AUTH_SECRET`. |
| `gs-registration` | No OIDC client secret | Its PingOne SPA client ID and authority are public and currently defined in `src/auth/oidc-config.ts`. The existing PingOne application and registered redirect URIs must still remain available. |
| `gs-leadertools` | Yes | Requires the Leader Tools PingOne OIDC client ID and client secret plus an Auth.js `AUTH_SECRET` in `apps/gs-leadertools/.env.local`. Without them, the site may start, but **Council Sign In** cannot complete. |
| Redis logout propagation | No | Uses `redis://localhost:6379` by default. Docker Compose starts it automatically; without Redis, basic login can work but cross-application revocation is unavailable. |
| `poc-mgmt-api` audit/repair script | Yes, only when the script is run | `scripts/audit-pingone-idp.sh` securely prompts for the Worker client secret. This secret is not used by any browser application or normal application startup. |
| Upstream Gigya and Okta connections | No local upstream secret | Gigya's client secret and the Okta SAML certificates/settings belong in PingOne/Okta, not in these downstream applications. |

The repository does not provision a new PingOne environment, Okta SAML application, or Gigya OIDC provider from scratch. The current application configuration assumes that the existing POC tenant, applications, authentication policies, external IdPs, redirect URIs, and certificates described in [`docs/ciam-broker-poc-findings.md`](./docs/ciam-broker-poc-findings.md) remain available. Reproducing the POC in another tenant requires recreating those resources; `poc-mgmt-api` is a narrowly scoped Worker application used by the audit/repair script, not a replacement identity provider and not a general environment bootstrapper.

For live Leader Tools authentication, create the ignored `apps/gs-leadertools/.env.local` and obtain the values through the secure POC handoff:

```bash
AUTH_ISSUER=https://auth.pingone.ca/<environment-id>/as
AUTH_CLIENT_ID=<leader-tools-pingone-client-id>
AUTH_CLIENT_SECRET=<leader-tools-pingone-client-secret>
AUTH_SECRET=<generate-a-separate-random-authjs-secret>
REDIS_URL=redis://localhost:6379

# Optional; normally derived from AUTH_ISSUER
PINGONE_SAML_SLO_URL=https://auth.pingone.ca/<environment-id>/saml20/startslo
```

`AUTH_CLIENT_SECRET` above is the secret for the **Leader Tools PingOne OIDC application**. Do not use the `poc-mgmt-api` Worker secret there. Generate `AUTH_SECRET` locally, for example with `openssl rand -base64 32`; it protects the local Auth.js session and is not supplied by PingOne.

### Finding PingOne IDs and secrets

An administrator can enter the existing environment through the verified [PingOne POC sign-on URL](https://apps.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/signon/?flowId=1799aa08-bf92-4e47-8913-1ee2bfef842e), then retrieve the application details as follows:

1. Sign in with an account that has access to administer the POC environment.
2. Use **Explore** to enter PingOne administration and select the existing POC environment.
3. Go to **Applications → Applications**.
4. Open the OIDC application used by Leader Tools.
5. On **Configuration**, expand **General** and copy the **Environment ID**, **Client ID**, and **Client Secret**. Use the eye and copy controls to reveal/copy the existing secret; do not generate a replacement merely to complete local setup because rotating it can interrupt another developer's configuration.
6. Store the values only in the ignored `apps/gs-leadertools/.env.local`, using the mapping shown above.

For `poc-mgmt-api`, follow the same path and open that Worker application. Its **Client ID** and **Client Secret** are used only by `scripts/audit-pingone-idp.sh`. Review its **Roles** tab if the script receives an authorization error. Do not place the Worker secret in any application's `AUTH_CLIENT_SECRET` setting.

`gs-registration` is a single-page application using authorization code with PKCE, so its browser configuration uses a public client ID and must not contain a client secret. The mock applications need their own OIDC application credentials only when they are being tested against real PingOne rather than the built-in mock provider.

The working `apps.pingone.ca/.../signon/?flowId=...` link above is the entry point for accessing this PingOne POC environment; it is not itself the page containing application credentials. If that tenant-specific link stops working, ask the PingOne environment owner for its current sign-on URL. Continue to start application authentication tests from `https://leadertools.local` or `https://gsregistration.local` so the complete downstream OIDC authorization and callback context is present.

### Existing Okta SAML configuration

A developer using the existing POC environment does not need an Okta client ID or client secret. The upstream Okta connection is SAML and is already stored in PingOne. The values below are the minimum verified configuration needed to audit the existing setup or reproduce it in another environment.

#### PingOne external IdP (`Okta`)

In PingOne, go to **Integrations → External IdPs**, open **Okta**, and confirm:

| Setting | Verified POC value |
|---|---|
| Type | `SAML` |
| Enabled | Yes |
| Okta SSO endpoint | `https://integrator-9136098.okta.com/app/integrator-9136098_gsusabrokerpingone_1/exk16f5cj0vhP5Zx9698/sso/saml` |
| Okta IdP entity ID | `http://www.okta.com/exk16f5cj0vhP5Zx9698` |
| SSO binding | `HTTP_REDIRECT` |
| Okta SLO endpoint | `https://integrator-9136098.okta.com/app/integrator-9136098_gsusabrokerpingone_1/exk16f5cj0vhP5Zx9698/slo/saml` |
| SLO binding | `HTTP_POST` |
| SLO response endpoint | Not separately specified |
| SLO window | Two hours |
| Verification certificate | Current Okta signing certificate from the Okta application metadata |
| Username mapping | PingOne Username is populated from the SAML assertion subject/NameID; preserve the existing update condition |

The Okta metadata source used for this POC is:

```text
https://integrator-9136098.okta.com/app/exk16f5cj0vhP5Zx9698/sso/saml/metadata
```

From the PingOne IdP's **Connection** tab, download the PingOne metadata and signing certificate when configuring or checking the Okta side. The certificate contains a public key and is not an OIDC client secret, but it should still be transferred through the approved team channel rather than pasted into tickets or chat.

#### Okta SAML application (`GSUSA Broker (PingOne)`)

The Okta administrator should confirm:

| Setting | Verified POC value |
|---|---|
| Single sign-on URL / ACS | `https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/saml20/sp/acs` |
| Audience URI / SP entity ID | `https://auth.pingone.ca/1cc700eb-f1ae-4700-16b7-6a7c0af53cd3` |
| Name ID format | `Unspecified` |
| Signed Requests | Disabled for the POC |
| Allow application to initiate Single Logout | Enabled |
| Single Logout URL | `https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/saml20/sp/slo` |
| SP Issuer | `https://auth.pingone.ca/1cc700eb-f1ae-4700-16b7-6a7c0af53cd3` |
| Signature certificate | PingOne signing certificate downloaded from the external IdP's **Connection** tab |
| User assignment | The Okta test user must be assigned to this application |

`Unspecified` and disabled **Signed Requests** are verified POC interoperability workarounds. PingOne's outbound authentication request omitted `NameIDPolicy`; changing the former Okta `EmailAddress` format to `Unspecified` and disabling the signed-request requirement allowed login to complete. This is not yet approved as the production security design. PingOne and Okta must identify a supported production configuration if signed authentication requests and an explicit Name ID policy are required.

The PingOne signing certificate is still needed for SAML logout even though Okta's signed authentication-request requirement is disabled. Authentication-request validation and SLO-message signing are separate concerns.

#### PingOne policy and test path

- The `OktaOnly` authentication policy must reference the enabled `Okta` external IdP and remain assigned to the Leader Tools PingOne application.
- Leader Tools sends `acr_values=OktaOnly` when the user selects **Council Sign In**.
- Start the test at `https://leadertools.local` and select **Council Sign In**. Do not start from the Okta dashboard tile; that IdP-initiated path lacks PingOne's transaction-specific `RelayState` and produces `MISSING_RELAY_STATE`.
- After Leader Tools succeeds, open `https://gsregistration.local` in the same browser to verify that Registration silently reuses the PingOne session.
- Login and cross-application SSO are verified. Full Okta browser-session termination after logout remains unresolved; follow the detailed System Log procedure in [`docs/ciam-broker-poc-findings.md`](./docs/ciam-broker-poc-findings.md#okta-logging-required-to-resolve-the-remaining-logout-issue).

Before starting a live test, also confirm:

1. The exact callback, silent-renew, popup-callback, and post-logout URLs for the origin being used are registered on the corresponding PingOne application. Registration's popup sign-in (`auth.signinPopup()`) redirects to `/popup-callback.html` rather than `/callback`, so that URL needs its own redirect URI entry (e.g. `https://gsregistration.local/popup-callback.html`) alongside the existing ones. Leader Tools' popup sign-in reuses the existing `/api/auth/callback/broker` redirect URI — no new PingOne registration needed there.
2. `OktaOnly`, `GigyaOnly`, and the conditional `Gigya-Federated` policy remain assigned/configured as recorded in the findings document.
3. The Okta and Gigya external IdPs are enabled in PingOne.
4. `/etc/hosts` and Caddy are configured for the complete live Gigya flow. PingOne currently sends Gigya authorization through `https://cdc-login.gsusa.local/api/auth/gigya-authorize`; that POC proxy is unavailable over a localhost-only setup. The mock flows and other locally registered callbacks can still use the documented localhost URLs.
5. Docker is running if the test includes cross-application logout propagation.

Never commit `.env.local`, client secrets, Worker secrets, test-user passwords, tokens, cookies, or decoded SAML messages.

## Running the apps

The easiest way to start everything (including `gs-leadertools`, which isn't part of the pnpm workspace) is:

```bash
./start-dev.sh
```

This frees ports 3100/3200/3300/3000 if anything stale is bound to them, starts the Redis Compose service on port 6379, starts `mock-shop`, `mock-mygs`, and `gs-registration` via `pnpm dev` (turbo), starts `gs-leadertools` separately with `ENV=dev yarn dev`, and tails the application logs (written to `.logs/`). Press `Ctrl+C` to stop everything, including the Redis container. Its named data volume is preserved between runs.

To run or inspect Redis independently:

```bash
docker compose up -d redis
docker compose ps
docker compose exec redis redis-cli ping
docker compose stop redis
```

The Redis container binds only to `127.0.0.1:6379`. Delete its persisted POC data, when intentionally starting fresh, with `docker compose down --volumes`.

To start apps individually instead:

```bash
pnpm dev          # runs `turbo dev` — starts every workspace app concurrently
pnpm dev:shop     # mock-shop only
pnpm dev:mygs     # mock-mygs only
```

`gs-leadertools` is not part of the workspace, so it isn't included in `pnpm dev` — see its own setup below.

## Apps

| App | URL | Port |
|---|---|---|
| [Mock Shop](./apps/mock-shop) | https://girlscoutsshop.local | 3100 |
| [Mock myGS](./apps/mock-mygs) | https://my-gs.local | 3200 |
| [GS Registration](./apps/gs-registration) | https://gsregistration.local | 3300 |
| [Leader Tools (VTK)](./apps/gs-leadertools) | https://leadertools.local | 3000 |

`https://` URLs above require the [Caddy HTTPS setup](#local-hostnames-over-real-https) below; without Caddy running, use `http://<hostname>:<port>` instead (e.g. `http://girlscoutsshop.local:3100`). The current live Gigya proxy is the exception and requires its HTTPS `.local` hostname.

### Test Credentials

| User | Email | Credential source | IdP |
|---|---|---|---|
| CDC Consumer | `ryan.mchale+ciampoc@base1.com` | Obtain through the secure POC handoff | Gigya (SAP CDC) |
| Okta test user | `pward+counciluser@girlscouts.org` | Obtain through the secure POC handoff | Okta Workforce |

> **Current status:** Gigya login, Okta login, and Okta-to-Registration SSO are verified. Okta application-initiated SAML logout reaches PingOne's **Signed Off** page with a signed `Success` response, but the tested Okta organization browser session remains active. See the [verified findings and Okta logging procedure](./docs/ciam-broker-poc-findings.md#okta-logging-required-to-resolve-the-remaining-logout-issue) before continuing logout diagnosis.

## Architecture

```text
Upstream IdPs          Broker                    Downstream Apps
┌──────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│ Okta (SAML)  │───▶│                  │───▶│ Mock Shop (:3100)    │
│              │    │  Ping Identity   │───▶│ Mock myGS (:3200)    │
│ SAP CDC      │───▶│  (PingOne)       │───▶│ GS Registration      │
│ (OIDC)       │    │                  │───▶│ Leader Tools (:3000) │
└──────────────┘    └──────────────────┘    └──────────────────────┘
```

| App | Description | Run command |
|---|---|---|
| [`mock-shop`](./apps/mock-shop) | Mock e-commerce relying-party app; signs in via the shared PingOne OIDC broker | `pnpm dev:shop` |
| [`mock-mygs`](./apps/mock-mygs) | Mock "MyGS" member-portal relying-party app; shares SSO session with `mock-shop` | `pnpm dev:mygs` |
| [`gs-registration`](./apps/gs-registration) | React/Vite simplified-registration prototype integrated with PingOne OIDC, silent cross-application SSO, shared session-status checks, and provider-aware logout | `cd apps/gs-registration && pnpm dev` |
| [`gs-leadertools`](./apps/gs-leadertools) | Next.js Girl Scouts Virtual Trail Kit integrated with PingOne OIDC, Okta-only workforce authentication policy selection, shared revocation, and provider-aware logout. Excluded from this pnpm workspace — see its own README | `cd apps/gs-leadertools && yarn install && ENV=dev yarn dev` |

### Local hostnames

Instead of `localhost`, apps can be reached via friendly hostnames by adding this line to `/etc/hosts`:

```
127.0.0.1  girlscoutsshop.local my-gs.local auth.gsusa.local gsregistration.local leadertools.local cdc-login.gsusa.local
```

The port is still required in the URL (e.g. `http://girlscoutsshop.local:3100`) since nothing in this repo proxies port 80 — `/etc/hosts` only maps the hostname to `127.0.0.1`. `gs-registration`'s Vite dev server explicitly allowlists `gsregistration.local` (see `apps/gs-registration/vite.config.ts`); the other apps' dev servers don't restrict the `Host` header, so they work with any of these names without extra config.

`auth.gsusa.local` isn't served by anything in this repo — it only appears as an example issuer URL in `packages/auth/src/claims.test.ts`. If you sign in via a real PingOne tenant (`AUTH_ISSUER` set) rather than the mock Credentials login, using a hostname other than `localhost` means the OAuth redirect URI (`http://<host>:<port>/api/auth/callback/broker`) must also be registered on the PingOne application, or the login callback will be rejected. Leave `AUTH_URL` unset in `.env.local` for this to work — `trustHost: true` derives the redirect URI from whichever hostname the browser actually used, instead of a fixed one (see [Environment variables](#environment-variables-mock-shop--mock-mygs) below).

`gs-registration` is a separate case: it's a client-side OIDC flow (`react-oidc-context`), and plain-HTTP `.local` hostnames aren't a secure browsing context in Chrome, so `crypto.subtle` (needed for PKCE) is unavailable there. Always use `http://localhost:3300` for `gs-registration`'s real PingOne login, not `gsregistration.local:3300` — unless you're using the HTTPS-via-Caddy setup below, which sidesteps this entirely.

### Local hostnames over real HTTPS

The plain `/etc/hosts` mapping above still leaves you on `http://`. For real HTTPS on all four `.local` hostnames (no port, and no PKCE/secure-context restriction), this repo has its own [`Caddyfile`](./Caddyfile), started/stopped automatically by `start-dev.sh`/`stop-dev.sh` whenever the `caddy` CLI is installed (`brew install caddy`; run `caddy trust` once to add its local CA to your system trust store). If Caddy is not installed, the scripts skip it and the applications can still run over plain `http://localhost`; however, the current live Gigya federation path will not complete because PingOne's configured POC authorization proxy uses `https://cdc-login.gsusa.local`.

The four application origins (`girlscoutsshop.local`, `my-gs.local`, `gsregistration.local`, `leadertools.local`) are registered as extra `redirectUris`/`postLogoutRedirectUris` on their respective PingOne applications alongside the `localhost` ones, so either origin works for real PingOne login. `cdc-login.gsusa.local` is not another PingOne application. It hosts the browser-only POC authorization proxy described below and is already present in Gigya's SSO `validDomains` configuration.

Two things worth knowing:
- The sibling `gs-identity-broker-poc` (Keycloak) repo has its **own**, separate Caddyfile proxying the same hostnames to its own ports. Only one Caddy instance can bind 80/443 at a time — `start-dev.sh` runs `caddy stop` before starting this repo's instance, so switching between the two repos means re-running whichever one's `start-dev.sh` you want active.
- `next-auth`/`@auth/core` (used by `gs-leadertools`) builds its OAuth `redirect_uri` from the raw request URL, which doesn't reflect Caddy's proxied hostname on its own — `apps/gs-leadertools/src/app/api/auth/[...nextauth]/route.ts` and `src/lib/requestOrigin.ts` correct this using `X-Forwarded-Host`/`X-Forwarded-Proto`, which Caddy sets by default. If you build a new API route in that app that needs the "real" origin, use `getRequestOrigin(request)` from `src/lib/requestOrigin.ts` rather than `request.nextUrl.origin`, which is unreliable behind any reverse proxy.

### Logout architecture and Gigya limitation

The applications now preserve the broker boundary during logout:

1. The initiating app records its PingOne `sid` and a subject revocation cutoff in Redis. This invalidates existing sessions in the other POC apps without invalidating a new session created after the logout.
2. The app clears its own local session and selects the broker logout mechanism from PingOne's `identity_provider` claim.
3. An Okta-backed session redirects to PingOne's SAML `/saml20/startslo` endpoint before an OIDC signoff can destroy PingOne's upstream-participant context. A Gigya-backed session retains the existing PingOne OIDC `/idpSignoff` or `/signoff` path and POC forced-reauthentication marker.
4. The other Next.js apps check the shared revocation state while resolving their Auth.js session. `gs-registration` instead opens a persistent `/api/auth/session-events` connection (server-sent events) with its signed ID token, so a revocation is pushed to it immediately rather than discovered on the next poll; the underlying revocation store is published to via Redis pub/sub so the push works across multiple app instances, not just within one process. The same API (including a one-shot `/api/auth/session-status` check) is mounted by both the production Express server and the normal Vite dev server.
5. Each `/api/auth/backchannel-logout` endpoint also supports a real OIDC logout token. It verifies the JWT signature against the broker's discovery/JWKS metadata and validates issuer, audience, age, event, nonce, and `sid`/`sub` claims before writing revocation state.

The SAML SLO URL is not tied to the current environment ID in logout code. Leader Tools reads the optional server-side `PINGONE_SAML_SLO_URL`; Registration reads the optional build-time `VITE_PINGONE_SAML_SLO_URL`. When an override is absent, each app derives `/saml20/startslo` from its HTTPS PingOne OIDC issuer or authority. Example overrides are:

```bash
# apps/gs-leadertools/.env.local
PINGONE_SAML_SLO_URL=https://auth.pingone.ca/<environment-id>/saml20/startslo

# gs-registration build/dev environment
VITE_PINGONE_SAML_SLO_URL=https://auth.pingone.ca/<environment-id>/saml20/startslo

# Optional local troubleshooting only; ignored by production builds
VITE_OIDC_DEBUG=true
```

Direct SAML testing verifies that PingOne sends Okta a signed `LogoutRequest` with the expected issuer, `NameID`, and `SessionIndex`; Okta returns a signed `Success` `LogoutResponse`; and PingOne reaches **Signed Off**. Okta's organization browser session nevertheless remains active in the tested tenant. The application orchestration is therefore implemented, but an Okta administrator must still determine why successful application-initiated SLO does not produce the expected Okta session termination.

Verbose `oidc-client-ts` browser logging is disabled by default because it can expose authorization details in developer tools. It can be enabled only in a Vite development build with `VITE_OIDC_DEBUG=true`. Unit coverage verifies that both applications select SAML SLO for `okta-workforce`, retain OIDC signoff for `gigya-b2c`, and fall back to OIDC signoff when no safe SAML endpoint is available.

The POC's PingOne discovery document advertises RP-initiated logout and session checking, but it does not advertise OIDC backchannel logout support. A cloud broker also cannot push to a localhost-only endpoint; testing a real push requires a public HTTPS callback and a broker/application type that supports OIDC Back-Channel Logout.

Production upstream Gigya logout should remain broker-owned. SAP CDC's RP-initiated OIDC logout requires the current Gigya-issued ID token and the Gigya RP client ID. Those belong to PingOne's upstream OIDC connection, not to the downstream Girl Scouts apps. PingOne's `/idpSignoff` endpoint clears the PingOne session using a downstream PingOne ID token, but testing confirmed that it does not propagate OIDC logout to the generic upstream Gigya IdP.

The Gigya external OIDC IdP was provisioned through the PingOne Management API because the PingOne console incorrectly rejects Gigya's dotless issuer (`https://dev-parent-gsusa/`). Its individual login/token endpoints were originally stored without a `discoveryEndpoint`, so PingOne could not discover Gigya's advertised `end_session_endpoint`. Audit or repair that metadata with the Worker application (`poc-mgmt-api`):

```bash
./scripts/audit-pingone-idp.sh
./scripts/audit-pingone-idp.sh --apply-gigya-logout
```

Both modes securely prompt for the Worker client secret and omit all secrets and access tokens from their output. The apply mode first asks PingOne to parse Gigya's well-known document, then preserves the existing OIDC connection fields while adding the validated discovery URL. The PingOne API ignores the generic SAML-style `sloEndpoint` fields for this OIDC provider, and storing a discovery document that advertises `end_session_endpoint` was not sufficient to make `/idpSignoff` terminate Gigya's session. The downstream application must still have **Terminate User Session by ID Token** enabled and its exact post-logout URL registered in PingOne.

An attempted POC browser fallback using Gigya's public Web SDK was removed. The SDK's `accounts.logout` operation returned success, but it did not terminate the separate Gigya OIDC provider session used by PingOne; the next OIDC authorization therefore still completed silently. A production implementation needs supported PingOne orchestration/external-IdP logout behavior or a Ping/SAP integration change that can use PingOne's upstream Gigya ID token.

As a POC-only forced-reauthentication fallback, Leader Tools exposes `https://cdc-login.gsusa.local/api/auth/gigya-authorize`. PingOne can use this as the Gigya external IdP's authorization endpoint. Normal authorization requests pass through unchanged, preserving Gigya SSO between applications. Completing an application logout visits `/api/auth/mark-gigya-logout`, which sets a short-lived, HTTP-only marker on the proxy hostname. The proxy consumes that marker on the next interactive authorization, adds `prompt=login`, and then removes it. Background `prompt=none` requests neither consume the marker nor become interactive.

The proxy preserves PingOne's complete authorization query (including state, nonce, redirect URI, and PKCE parameters) and redirects the browser to Gigya's public `fidm.us1.gigya.com` authorization endpoint. The public endpoint is intentional: Gigya's discovery metadata returns a custom dotless hostname that local browsers cannot resolve, while the `fidm` endpoint was the working endpoint already stored in PingOne. This demonstrates a fresh Gigya credential challenge after application logout while retaining ordinary cross-application SSO, but it is not upstream universal logout and must not be presented as the production design.

Apply or remove that PingOne configuration through the same secure management script:

```bash
./scripts/audit-pingone-idp.sh --apply-gigya-force-login-proxy
./scripts/audit-pingone-idp.sh --restore-gigya-authorization-endpoint
```

Both commands preserve the other Gigya provider fields and securely prompt for the `poc-mgmt-api` Worker secret. The restore action reads the real authorization endpoint from Gigya's current discovery metadata instead of relying on a hard-coded backup.

If the PingOne console cannot save an authentication policy that references the
API-created Gigya provider, update the existing `Gigya-Federated` policy action
through the same Worker application:

```bash
./scripts/audit-pingone-idp.sh --apply-gigya-federated-sso-window
```

This guarded action requires exactly one `Gigya-Federated` policy and one
`IDENTITY_PROVIDER` action. It replaces a stale provider reference with the
enabled Gigya OIDC provider, preserves the other action settings, and configures
Gigya reauthentication only when the PingOne sign-on is older than eight hours.

Relevant vendor references: [PingOne OIDC application sign-off settings](https://docs.pingidentity.com/pingone/applications/p1_edit_application_singlepage.html), [PingOne generic external OIDC IdP settings](https://docs.pingidentity.com/pingone/integrations/p1_add_idp_oidc.html), and [SAP CDC RP-Initiated Logout](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/1953bd89795f4e769b34ef780acb8c29.html).

## Packages

| Package | Description |
|---|---|
| [`@ciam-poc/auth`](./packages/auth) | Shared NextAuth (Auth.js) config: PingOne OIDC broker provider (falls back to a mock Credentials provider when `AUTH_ISSUER` is unset), claims extraction, signed logout-token validation, and Redis-backed session revocation |
| [`@ciam-poc/ui`](./packages/ui) | Shared React components used by both mock apps — nav bar, session banner, token inspector, role gate, logout button, silent-auth handler |
| [`@ciam-poc/config`](./packages/config) | Shared config (lint/tsconfig, etc.) |

## Environment variables (`mock-shop` / `mock-mygs`)

Each app reads its own `.env.local` (gitignored). Copy the pattern below into `apps/mock-shop/.env.local` and `apps/mock-mygs/.env.local`, filling in the PingOne application credentials:

```bash
# PingOne OIDC Configuration
# Leave AUTH_ISSUER empty to fall back to the mock credentials login (no PingOne needed)
AUTH_ISSUER=
AUTH_CLIENT_ID=
AUTH_CLIENT_SECRET=

# Next Auth
# Leave AUTH_URL unset — trustHost:true (packages/auth/src/auth-config.ts) derives the
# redirect_uri base from the request's Host header, so both localhost:<port> and the
# friendly .local hostname (e.g. girlscoutsshop.local:3100) work without editing this file.
# Whichever origin(s) you use must have their callback/post-logout URI registered on the
# PingOne application (e.g. http://localhost:3100/api/auth/callback/broker AND
# http://girlscoutsshop.local:3100/api/auth/callback/broker for mock-shop).
AUTH_SECRET=
```

With `AUTH_ISSUER` left blank, both apps use a mock Credentials sign-in form (any email/name/role) instead of hitting a real PingOne tenant — the fastest way to exercise the SSO flow locally.

Optional:

```bash
REDIS_URL=redis://localhost:6379   # shared logout / session revocation store
AUTH_SESSION_MAX_AGE=2592000       # optional; revocation TTL and Auth.js max age (30 days)
```

## Other scripts

```bash
pnpm build   # turbo build — builds all workspace apps
pnpm lint    # turbo lint — lints all workspace apps
```

## Documentation

- [`docs/ciam-broker-poc-findings.md`](./docs/ciam-broker-poc-findings.md) — current status, behavior, workarounds, and open questions from testing PingOne as the broker (what's working, what's blocked, and why)
