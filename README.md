# gs-ping-identity-broker-poc

A proof-of-concept pnpm/Turborepo monorepo exploring CIAM (Customer Identity & Access Management) SSO via PingOne. Two mock relying-party apps (`mock-shop`, `mock-mygs`) share a broker-based OIDC login and session state through a common `@ciam-poc/auth` package, so single sign-on / single sign-out behavior can be demonstrated across apps. The repo also hosts a couple of unrelated Girl Scouts prototypes (`gs-registration`, `gs-leadertools`).

---

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 10.33.0 (declared in `package.json#packageManager`; run via [corepack](https://nodejs.org/api/corepack.html) or install directly)
- Docker with Docker Compose — `start-dev.sh` uses the root [`compose.yml`](./compose.yml) to run the shared Redis service required for downstream logout propagation and backchannel-logout revocation. The apps degrade gracefully if Redis isn't running, so Docker is optional for basic sign-in but required to demonstrate cross-app logout.

## Install

From the repo root:

```bash
pnpm install
```

This installs and links all workspace apps/packages except `gs-leadertools`, which is excluded from the pnpm workspace (see [`pnpm-workspace.yaml`](./pnpm-workspace.yaml)) and manages its own dependencies separately.

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

`https://` URLs above require the [Caddy HTTPS setup](#local-hostnames-over-real-https-optional) below; without Caddy running, use `http://<hostname>:<port>` instead (e.g. `http://girlscoutsshop.local:3100`).

### Test Credentials

| User | Email | Password | IdP |
|---|---|---|---|
| CDC Consumer | `ryan.mchale+ciampoc@base1.com` | `Testing123!` | Gigya (SAP CDC) |
| Okta Admin | `pward+counciluser@girlscouts.org` | `Testing123!` | Okta Workforce |

> **Okta sign-in is currently blocked.** PingOne's outbound SAML `AuthnRequest` omits `NameIDPolicy`, so Okta authenticates the browser but never completes the handoff back to PingOne. See [`docs/ciam-broker-poc-findings.md`](./docs/ciam-broker-poc-findings.md) for the current status and proposed workaround. The Gigya credential above works end-to-end.

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
| [`gs-registration`](./apps/gs-registration) | Standalone React/Vite prototype for the simplified member registration flow (client-side only, no backend) | `cd apps/gs-registration && pnpm dev` |
| [`gs-leadertools`](./apps/gs-leadertools) | Unrelated Next.js app for the Girl Scouts Virtual Trail Kit (badges/activities via AEM). Excluded from this pnpm workspace — see its own README | `cd apps/gs-leadertools && yarn install && ENV=dev yarn dev` |

### Local hostnames

Instead of `localhost`, apps can be reached via friendly hostnames by adding this line to `/etc/hosts`:

```
127.0.0.1  girlscoutsshop.local my-gs.local auth.gsusa.local gsregistration.local leadertools.local cdc-login.gsusa.local
```

The port is still required in the URL (e.g. `http://girlscoutsshop.local:3100`) since nothing in this repo proxies port 80 — `/etc/hosts` only maps the hostname to `127.0.0.1`. `gs-registration`'s Vite dev server explicitly allowlists `gsregistration.local` (see `apps/gs-registration/vite.config.ts`); the other apps' dev servers don't restrict the `Host` header, so they work with any of these names without extra config.

`auth.gsusa.local` isn't served by anything in this repo — it only appears as an example issuer URL in `packages/auth/src/claims.test.ts`. If you sign in via a real PingOne tenant (`AUTH_ISSUER` set) rather than the mock Credentials login, using a hostname other than `localhost` means the OAuth redirect URI (`http://<host>:<port>/api/auth/callback/broker`) must also be registered on the PingOne application, or the login callback will be rejected. Leave `AUTH_URL` unset in `.env.local` for this to work — `trustHost: true` derives the redirect URI from whichever hostname the browser actually used, instead of a fixed one (see [Environment variables](#environment-variables-mock-shop--mock-mygs) below).

`gs-registration` is a separate case: it's a client-side OIDC flow (`react-oidc-context`), and plain-HTTP `.local` hostnames aren't a secure browsing context in Chrome, so `crypto.subtle` (needed for PKCE) is unavailable there. Always use `http://localhost:3300` for `gs-registration`'s real PingOne login, not `gsregistration.local:3300` — unless you're using the HTTPS-via-Caddy setup below, which sidesteps this entirely.

### `.local` hostnames over real HTTPS (optional)

The plain `/etc/hosts` mapping above still leaves you on `http://`. For real HTTPS on all four `.local` hostnames (no port, and no PKCE/secure-context restriction), this repo has its own [`Caddyfile`](./Caddyfile), started/stopped automatically by `start-dev.sh`/`stop-dev.sh` whenever the `caddy` CLI is installed (`brew install caddy`; run `caddy trust` once to add its local CA to your system trust store). If `caddy` isn't installed, both scripts skip it silently and everything still works over plain `http://localhost`.

The four application origins (`girlscoutsshop.local`, `my-gs.local`, `gsregistration.local`, `leadertools.local`) are registered as extra `redirectUris`/`postLogoutRedirectUris` on their respective PingOne applications alongside the `localhost` ones, so either origin works for real PingOne login. `cdc-login.gsusa.local` is not another PingOne application. It hosts the browser-only POC authorization proxy described below and is already present in Gigya's SSO `validDomains` configuration.

Two things worth knowing:
- The sibling `gs-identity-broker-poc` (Keycloak) repo has its **own**, separate Caddyfile proxying the same hostnames to its own ports. Only one Caddy instance can bind 80/443 at a time — `start-dev.sh` runs `caddy stop` before starting this repo's instance, so switching between the two repos means re-running whichever one's `start-dev.sh` you want active.
- `next-auth`/`@auth/core` (used by `gs-leadertools`) builds its OAuth `redirect_uri` from the raw request URL, which doesn't reflect Caddy's proxied hostname on its own — `apps/gs-leadertools/src/app/api/auth/[...nextauth]/route.ts` and `src/lib/requestOrigin.ts` correct this using `X-Forwarded-Host`/`X-Forwarded-Proto`, which Caddy sets by default. If you build a new API route in that app that needs the "real" origin, use `getRequestOrigin(request)` from `src/lib/requestOrigin.ts` rather than `request.nextUrl.origin`, which is unreliable behind any reverse proxy.

### Logout architecture and Gigya limitation

The applications now preserve the broker boundary during logout:

1. The initiating app records its PingOne `sid` and a subject revocation cutoff in Redis. This invalidates existing sessions in the other POC apps without invalidating a new session created after the logout.
2. The app clears its own session and sends the browser to PingOne's advertised `end_session_endpoint` (`/signoff`) with the PingOne ID token as `id_token_hint`.
3. The other Next.js apps check the shared revocation state while resolving their Auth.js session. `gs-registration` polls its server-side session-status endpoint with its signed ID token; the same API is mounted by both the production Express server and the normal Vite dev server.
4. Each `/api/auth/backchannel-logout` endpoint also supports a real OIDC logout token. It verifies the JWT signature against the broker's discovery/JWKS metadata and validates issuer, audience, age, event, nonce, and `sid`/`sub` claims before writing revocation state.

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
