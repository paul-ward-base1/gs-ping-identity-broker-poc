# CIAM Broker POC Findings

**Project:** `gs-ping-identity-broker-poc`
**Status date:** August 31, 2026
**Purpose:** Record the behavior, workarounds, limitations, and open questions discovered while testing PingOne as an identity broker for Girl Scouts applications.

## Executive summary

The POC demonstrates that Girl Scouts applications can use PingOne as their only downstream OpenID Connect (OIDC) provider while PingOne delegates authentication to upstream identity providers. This keeps Gigya/SAP Customer Data Cloud (CDC) and Okta configuration out of the applications and gives the applications a consistent PingOne token boundary.

Gigya authentication, Okta SAML authentication, and cross-application PingOne SSO now work. A user authenticated through Okta in Leader Tools can open Registration and be signed in automatically through the existing PingOne session. When no usable PingOne session exists, Registration continues to use Gigya as its interactive authentication source.

The Okta logout gap is now resolved. Two root causes were identified and fixed on August 31, 2026. First, the Okta org's Early Access **Front-channel Single Logout** feature was disabled, so Okta validated PingOne's signed SAML `LogoutRequest` and returned `Success` without terminating its browser session; enabling the feature in **Settings → Features** made the same `startslo` exchange terminate the session. Second, application logout branching relied on PingOne's `identity_provider` ID-token claim, which reads `local` for a federated login linked to a pre-existing PingOne user; the applications now also branch on the `OktaOnly` `acr` claim and on a Redis-shared record of the session's upstream IdP. Okta-backed logout from Leader Tools and from Registration (after silent Okta SSO) has been live-verified: `/api/v1/sessions/me` reports no session afterward and the next Council Sign In requires credentials.

The remaining functional gap is Gigya upstream logout. The Gigya POC uses a forced-reauthentication marker that produces a fresh Gigya credential challenge but does not terminate the underlying Gigya session. This gap now has a concrete path to closure: Gigya's OIDC OP advertises an `end_session_endpoint` with SAP-documented RP-initiated logout (Gigya finding 5), pending two CDC administrator actions. Separately, the root cause of the Gigya issuer and endpoint workarounds was identified as a broken CDC custom domain configuration (Gigya findings 1 and 2); repairing it is a production prerequisite that also eliminates the POC's authorization proxy.

## Target architecture

```text
Girl Scouts application
        |
        | OIDC
        v
     PingOne
        |
        +---- OIDC ----> Gigya / SAP CDC
        |
        +---- SAML ----> Okta Workforce
```

The applications are relying parties of PingOne. They do not authenticate directly against Gigya or Okta and should not receive or manage upstream provider credentials, client secrets, or upstream ID tokens.

### Applications exercised by the POC

- `gs-leadertools`: Next.js/Auth.js application. Provides **Sign In** for Gigya and **Council Sign In** for Okta.
- `gs-registration`: Vite SPA using `react-oidc-context` and PingOne OIDC.
- `mock-shop` and `mock-mygs`: Next.js/Auth.js mock downstream applications.
- `packages/auth`: Shared claims, logout-token validation, and Redis-backed session-revocation behavior for compatible applications.

## Authentication-policy and cross-provider SSO findings

### 1. Applications remain downstream clients of PingOne

Leader Tools and Registration do not connect directly to one another or directly to both upstream providers. Their shared browser SSO is the PingOne session:

```text
Okta or Gigya authentication
        |
        v
PingOne browser session
        |
        +----> Leader Tools application session
        |
        +----> Registration application session
```

Leader Tools keeps its explicit choices:

- **Sign In** selects `GigyaOnly` with `acr_values=GigyaOnly`.
- **Council Sign In** selects `OktaOnly` with `acr_values=OktaOnly`.

**Design decision (August 31, 2026):** these buttons intentionally remain strict. A Gigya-backed PingOne session does not satisfy **Council Sign In** — clicking it always requires Okta authentication, preserving the guarantee that a council-labeled session is Okta-verified. Cross-application convenience is provided separately: Leader Tools' `SilentAuth` component silently reuses any existing PingOne session on page load (without `acr_values`), so a user already signed in through Registration enters Leader Tools automatically at member level without clicking anything.

Registration exposes only its Gigya-oriented **Sign in** action. It does not send an `acr_values` override, allowing PingOne to reuse an existing session regardless of whether Okta or Gigya originally authenticated it. If PingOne needs an interactive authentication, the first/default assigned policy is `Gigya-Federated`.

### 2. `Gigya-Federated` required a Management API repair

The policy initially referenced a stale external-provider ID:

```text
b33ec955-ada7-4796-9d5f-585d26968457
```

The enabled API-created Gigya provider is:

```text
3e182f33-996f-47f8-bae4-e2c7914c95d8
```

The PingOne console displayed the stale ID with a validation error and could not safely save the API-created provider because of Gigya's dotless issuer. The `poc-mgmt-api` Worker application, with an organization-scoped **Environment Admin** role, was therefore used to update the policy action through the Management API.

The guarded repository command is:

```bash
./scripts/audit-pingone-idp.sh --apply-gigya-federated-sso-window
```

The command requires exactly one policy named `Gigya-Federated` and exactly one `IDENTITY_PROVIDER` action. It preserves the action's priority, user-context, registration, and ACR settings; replaces the stale provider reference; performs the update; and reads the action back for verification.

### 3. The eight-hour condition enables Okta-to-Registration SSO

The verified `Gigya-Federated` action now contains:

```json
{
  "identityProvider": {
    "id": "3e182f33-996f-47f8-bae4-e2c7914c95d8"
  },
  "condition": {
    "secondsSince": "${session.lastSignOn.withAuthenticator.pwd.at}",
    "greater": 28800
  },
  "priority": 1,
  "passUserContext": false,
  "registration": {
    "enabled": false
  }
}
```

This makes Gigya authentication required when the PingOne sign-on is absent or older than eight hours, while allowing a recent PingOne session established through Okta to complete Registration authorization without redirecting to Gigya.

The following flow was verified in one browser session:

1. Open Leader Tools and select **Council Sign In**.
2. Authenticate through Okta.
3. Open Registration without logging out.
4. Registration silently obtains its own application session through PingOne without displaying Gigya authentication.

## Gigya findings

### 1. PingOne console rejects Gigya's issuer

Gigya publishes the unusual dotless issuer:

```text
https://dev-parent-gsusa/
```

The PingOne console's client-side URL validation rejects this issuer even though the PingOne Management API accepts it. The Gigya external OIDC identity provider was therefore created and updated through the Management API using the `poc-mgmt-api` Worker application.

This is a PingOne console limitation, not a reason for downstream applications to connect directly to Gigya.

**Root cause identified (August 31, 2026):** the dotless issuer is not inherent to Gigya — it derives from the CDC site's custom domain (Custom Login Proxy) configuration, which points at a domain that does not exist in DNS (see finding 2). Repairing that CDC configuration would produce a valid issuer and remove the need for the Management API workaround.

### 2. Gigya browser authorization endpoint required a resolvable host

Gigya discovery returned a custom dotless hostname that the local browser could not resolve. During testing this produced `DNS_PROBE_FINISHED_NXDOMAIN` for the Gigya authorization URL.

The working POC uses Gigya's public `fidm.us1.gigya.com` authorization endpoint. A local HTTPS authorization proxy at the following address preserves PingOne's complete authorization request and forwards it to that endpoint:

```text
https://cdc-login.gsusa.local/api/auth/gigya-authorize
```

**Root cause identified (August 31, 2026):** Gigya's OIDC discovery document advertises every endpoint (authorization, token, JWKS, end-session) on the host `gigy-dev-clp.dev-parent-gsusa`, which resolves to `NXDOMAIN` — the CDC site's custom domain / Custom Login Proxy configuration references a domain that was never registered in DNS. The issuer in finding 1 derives from the same setting. The fix is on the CDC side: configure a real custom domain (proper CNAME and certificate) or revert the site to default `gigya.com` endpoints. Either change makes the advertised endpoints resolvable and eliminates the local authorization proxy entirely. This is the highest-priority Gigya request for the CDC administrator and a production prerequisite.

### 3. Authentication and cross-application SSO work

The following behavior has been verified:

- A user can authenticate through PingOne and Gigya from `gs-registration`.
- The same user can then enter Leader Tools through the Gigya option without entering credentials again.
- A user can also authenticate first in Leader Tools and then enter `gs-registration` without entering credentials again.
- Normal authorization requests preserve the existing Gigya session and therefore provide cross-application SSO.

### 4. Downstream cross-application logout propagation works

Bidirectional logout propagation has been verified with both applications authenticated:

- Logging out from `gs-registration` causes the existing Leader Tools session to become logged out.
- Logging out from Leader Tools causes the existing `gs-registration` session to become logged out.

This verifies the Redis-backed downstream session-revocation behavior across the Next.js/Auth.js and Vite/`react-oidc-context` application types. It does not by itself prove that the upstream Gigya browser session was terminated; that remains a separate broker-to-upstream logout concern.

### 5. PingOne logout does not terminate the upstream Gigya OIDC session

Logging out of a downstream application can terminate the application and PingOne sessions, but PingOne's tested `/idpSignoff` behavior does not propagate logout to the generic upstream Gigya OIDC provider.

The downstream applications cannot safely call Gigya's OIDC logout endpoint themselves. Gigya requires the upstream Gigya client ID and Gigya-issued ID token, both of which belong to PingOne's upstream connection. Giving those values to downstream applications would break the broker boundary.

**Revised assessment (August 31, 2026):** this gap is narrower than first recorded. Gigya's OIDC discovery advertises an `end_session_endpoint`, and SAP formally documents [RP-Initiated Logout](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/1953bd89795f4e769b34ef780acb8c29.html?locale=en-US) for the CDC OIDC OP: the caller supplies the RP `client_id` and a post-logout URL registered in the RP configuration's **Trusted Post Logout URLs**. A direct probe of the endpoint (via the reachable `fidm.us1.gigya.com` host) returned a 302 into Gigya's hosted logout page in `fullLogout` mode even without an ID token. Two of the original objections therefore soften: the upstream `client_id` is public information that already transits the browser in every authorization redirect, and the front-channel flow may not require the Gigya-issued ID token at all. The Gigya-issued ID token remains broker-owned and must still not be distributed to applications.

The candidate replacement for the forced-reauthentication marker is a front-channel chain analogous to the deferred Okta alternative, with the advantage that Gigya's endpoint supports a completion redirect: application logout → PingOne OIDC signoff (returns to the application's post-signoff route) → Gigya `end_session?client_id=<upstream client id>&post_logout_redirect_uri=<registered URL>` → back at the application with the CDC session terminated. Prerequisites before this can be live-tested: the CDC administrator must add the application (or proxy) URL to the RP's Trusted Post Logout URLs, and the upstream `client_id` must be confirmed from the CDC console or a login network trace. The decisive test: after the chain, a fresh interactive Gigya authorization must demand credentials without the forced-login marker being involved.

### 6. Forced reauthentication is a POC fallback, not universal logout

The implemented fallback marks the next interactive Gigya authorization after application logout. The authorization proxy consumes that marker and adds:

```text
prompt=login
```

This produces a fresh Gigya credential challenge while allowing ordinary cross-application SSO at other times. Silent `prompt=none` requests do not consume the marker.

This proves the desired user experience for the POC, but it does not prove that the upstream Gigya session was terminated. A production solution still requires supported logout orchestration between PingOne and Gigya.

### 7. Gigya JIT provisioning stores the Gigya UID as the username

The user record created by the Gigya external IdP in the `Gigya Users` population uses the raw Gigya UID as its PingOne username and display identity, with only the email attribute populated from the login. The applications therefore fall back to a generic display name. The IdP's attribute mappings should populate the username and name attributes from Gigya profile claims before production use. The Okta SAML login, by contrast, was linked to an existing PingOne user rather than JIT-creating one, which is why its sessions report `identity_provider` as `local` (see Okta finding 5).

### 8. Gigya OIDC OP capabilities confirmed from discovery metadata

The OP's discovery document (retrieved August 31, 2026 via `fidm.us1.gigya.com`) confirms several capabilities relevant to the production design:

- `end_session_endpoint` is advertised — the basis for the RP-initiated logout path in finding 5.
- `backchannel_logout_supported: true` (`backchannel_logout_session_supported: false`, so logout tokens identify the subject rather than a session) — Gigya can push OIDC back-channel logout tokens to its RPs. Whether PingOne can register as an upstream back-channel logout receiver is a new question for Ping Identity; if it can, Gigya-side logouts from other CDC-connected properties could propagate into the broker.
- The GSUSA custom claims (`GSGLOBALID`, `COUNCILCODE`, `GSUserType`, `TeamID`, `IsAdultUser`, `houseHoldID`) and the `gsusa_data` scope are advertised correctly — this part of the integration is healthy.
- `acr_values_supported` lists `urn:gigya:loa:10/20/30` — not used by the POC, but available if step-up authentication is ever required.

## Okta findings

### 1. Leader Tools to Okta authentication works

The **Council Sign In** action starts the downstream PingOne OIDC flow and selects the Okta-only PingOne authentication policy through `acr_values=OktaOnly`. PingOne redirects to the enabled Okta SAML external IdP, Okta returns the assertion to PingOne, and PingOne completes the OIDC authorization for Leader Tools.

This flow has been verified end to end. Leader Tools does not require a direct Okta integration or Okta credentials.

### 2. The SAML NameID workaround is verified for the POC

The original failed flow reported:

```text
NameIDPolicy '' is not the configured Name ID Format
'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified' for the app
```

PingOne's outbound SAML `AuthnRequest` omitted `NameIDPolicy`. PingOne's external SAML IdP configuration exposes SSO endpoints, entity IDs, bindings, certificates, and authentication-request signing, but not a supported outbound Name ID policy setting.

The working POC configuration is:

- Okta **Name ID format**: `Unspecified`
- Okta **Signed Requests**: disabled

With those settings, Okta SAML authentication completes and returns control through PingOne to Leader Tools. Disabling signed authentication requests is a POC interoperability workaround, not a general production recommendation. If production policy mandates signed authentication requests and Okta mandates an explicit `NameIDPolicy`, the production design requires guidance or a supported configuration change from Ping Identity and Okta.

### 3. The Okta dashboard tile is not a supported entry point

The **GSUSA Broker (PingOne)** tile attempts an Okta/IdP-initiated flow. PingOne expects the transaction-specific `RelayState` generated when Leader Tools starts authentication. Clicking the tile without that state produces:

```text
MISSING_RELAY_STATE - RelayState parameter is missing
```

Testing and user access must start at:

```text
https://leadertools.local
```

and then use **Council Sign In**. The Okta tile should be hidden unless an IdP-initiated flow is separately designed and supported.

### 4. Okta-to-Registration SSO is verified

A user authenticated through Okta in Leader Tools can open Registration in the same browser and proceed automatically without Gigya authentication. Registration's silent OIDC authorization reuses the PingOne session, and the conditional `Gigya-Federated` action does not redirect the recent session to Gigya.

This validates the core broker requirement: the applications trust PingOne, and a PingOne session established through either approved upstream provider can be reused by another application.

### 5. Application logout now initiates provider-aware broker logout

Leader Tools and Registration first clear their local sessions and shared downstream revocation state. Logout then branches on the session's Okta signals. Live testing showed that the `identity_provider` claim alone is insufficient: PingOne populates it from the IdP authoritative for the user record, so it reads `local` for an Okta login linked to a pre-existing PingOne user, and Registration's silently issued token carries neither that claim nor an Okta `acr`. The strategy therefore selects SAML SLO (redirecting to PingOne `/saml20/startslo` while the PingOne browser session still contains its upstream SAML participant context) when any of the following identifies the session as Okta-backed:

- the `identity_provider` claim equals `okta-workforce`;
- the `acr` claim equals `OktaOnly`, the authentication policy requested by Council Sign In; or
- the shared Redis record `broker:upstream:{issuer}:{sid}` equals `okta-workforce`. The application performing the interactive Okta login (Leader Tools) records this against the PingOne session ID, and Registration's backend exposes `/api/auth/session-upstream` so its logout can resolve the shared `sid` from its own verified ID token.

Sessions without any Okta signal retain the existing PingOne OIDC signoff followed by the POC-only Gigya forced-reauthentication marker, and an unavailable or invalid SAML SLO URL safely falls back to the existing OIDC signoff path.

A known UX limitation: the SAML logout path ends on PingOne's **Signed Off** page rather than returning to the application. `startslo` recognizes a `post_logout_redirect_uri` parameter but rejected it with `INVALID_POST_LOGOUT_REDIRECT_URI` in every tested combination (August 31, 2026) — a URI exactly matching the application's registered Signoff URLs, sent bare, with `id_token_hint`, and with `client_id` — and aborts the SLO exchange when the parameter is rejected. The application's Signoff URLs configuration was confirmed correct, so this is endpoint behavior, not configuration. The parameter is not documented for this endpoint ([PingOne SAML 2.0 single logout](https://docs.pingidentity.com/pingone/applications/p1_saml_2_0_slo.html) documents no query parameters), so returning the user to the application after SAML SLO requires Ping Identity guidance (see Questions for Ping Identity, item 8).

**Decision (August 31, 2026):** the SAML SLO flow is retained and the Signed Off landing page is accepted for the POC, because the project requirement mandates SAML for the Okta integration. An alternative was identified and deferred: a front-channel chain of PingOne OIDC signoff (`post_logout_redirect_uri` back to the application) followed by Okta's `/login/signout?fromURI=<app>` (requires the application origins in Okta **Security → API → Trusted Origins**). That chain would terminate all three sessions, return the user to the application at every hop, and remove the dependency on the Okta Early Access Front-channel SLO feature — but it replaces SAML `LogoutRequest`/`LogoutResponse` with Okta's UI signout endpoint (not a formally contracted API) and has the application redirect to Okta directly. It remains viable only if the SAML mandate is clarified to cover authentication but not logout.

Leader Tools accepts an optional server-side `PINGONE_SAML_SLO_URL`. Registration accepts an optional build-time `VITE_PINGONE_SAML_SLO_URL`. Without an override, both derive the SAML endpoint from the HTTPS PingOne OIDC issuer or authority rather than hard-coding an environment-specific logout URL in the control flow.

The shared behavior is covered by focused unit tests for both implementations: `okta-workforce` and the `OktaOnly` `acr` each select SAML SLO, `gigya-b2c` selects the existing OIDC path, and an unavailable SAML endpoint safely falls back to OIDC signoff.

The verified Okta path is therefore:

```text
Application session: logged out
Shared downstream sessions: revoked
PingOne SAML SLO: initiated before OIDC signoff
Okta browser session: terminated (verified via /api/v1/sessions/me)
```

Both applications were live-verified on August 31, 2026: logging out from Leader Tools, and logging out from Registration after silent Okta SSO, each terminate the Okta browser session, and the next **Council Sign In** requires a fresh Okta credential prompt. This verification also required the Okta-side fix described in finding 7.

### 6. Okta SAML SLO configuration and outbound request generation are verified

The Okta administrator enabled application-initiated SLO and supplied metadata that publishes the Okta IdP SLO endpoint. PingOne is now configured with:

- **SLO endpoint:** `https://integrator-9136098.okta.com/app/integrator-9136098_gsusabrokerpingone_1/exk16f5cj0vhP5Zx9698/slo/saml`
- **SLO binding:** `HTTP_POST`
- **SLO response endpoint:** not separately specified; the same Okta endpoint is used
- **SLO window:** two hours
- **Verification certificate:** the existing Okta signing certificate

The corresponding Okta SAML application configuration uses the PingOne SP values from the downloaded PingOne metadata:

- **PingOne SP SLO URL:** `https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/saml20/sp/slo`
- **PingOne SP Entity ID / Okta SP Issuer:** `https://auth.pingone.ca/1cc700eb-f1ae-4700-16b7-6a7c0af53cd3`
- **Signature certificate:** PingOne's downloaded signing certificate

The PingOne signing certificate remains required for SLO even though signed authentication requests are disabled. Authentication-request signing and SLO-message signing are separate concerns.

A direct browser test of PingOne's `/saml20/startslo` endpoint reached PingOne's **Signed Off** page. Inspection of the returned auto-post form and decoded request structure verified that PingOne generated:

- a SAML `LogoutRequest`;
- an HTTP POST to the configured Okta `/slo/saml` endpoint;
- the expected PingOne SP Entity ID as `Issuer`;
- both `NameID` and `SessionIndex`; and
- an embedded XML signature.

The form is configured to submit automatically to Okta. The captured browser sequence was `startslo` → Okta `saml` → PingOne `slo`. The embedded Okta response was safely decoded and verified as a signed SAML `LogoutResponse` with:

- the expected Okta entity ID as `Issuer`;
- PingOne `/saml20/sp/slo` as the destination;
- an `InResponseTo` reference; and
- SAML status `Success`.

This proves that Okta received the request and returned a successful signed SAML response that PingOne accepted before displaying **Signed Off**. It does not prove that Okta terminated its organization browser session.

### 7. Okta browser-session termination — resolved (August 31, 2026)

The unresolved behavior — Okta returning a signed SAML `Success` `LogoutResponse` while `/api/v1/sessions/me` continued to report the same browser session as active — was caused by the Okta org's **Front-channel Single Logout** feature being disabled. The feature is an Early Access toggle at **Settings → Features** in the Okta Admin Console and is off by default in the Integrator org. With it disabled, Okta validated and acknowledged PingOne's signed `LogoutRequest` at the protocol level without performing session termination.

After enabling the feature, the direct PingOne `/saml20/startslo` test terminated the Okta browser session: `/api/v1/sessions/me` returned `E0000007` (`Resource not found: me (Session)`), and the next Council Sign In required a fresh credential prompt. The same result was then verified through both applications' Sign Out paths once the application-side branching fix in finding 5 was in place.

Production note: because the fix depends on an Early Access feature, confirm the feature's availability and enablement in the production Okta tenant, and obtain Okta's general-availability timeline, before the production design relies on it.

#### Okta System Log evidence procedure (retained for regression verification)

Okta's event catalog defines the two decisive events differently:

- `user.authentication.slo` means that the user performed SLO from an application.
- `user.session.end` means that the user logged out from Okta itself.

The Okta administrator should perform a controlled test for each application logout entry point. Use a fresh Okta-backed sign-in immediately before each test and record the exact start and completion times in UTC. Also record whether the test originated from Leader Tools, Registration, or direct PingOne `/saml20/startslo`. Internally compare the Okta `/api/v1/sessions/me` session ID before and after logout, but do not place the full session ID in tickets, chat, screenshots, or this repository.

In the Okta Admin Console, open **Reports → System Log**, select a bounded window beginning at least five minutes before the test and ending at least five minutes afterward, and run these event-type filters separately:

```text
eventType eq "user.authentication.slo"
eventType eq "user.session.end"
eventType eq "user.session.start"
eventType eq "user.authentication.sso"
```

Start with the event-type filter and then narrow the results to the test user and the **GSUSA Broker (PingOne)** application. Searching separately is intentional: it makes the absence of `user.session.end` visible instead of hiding it inside a broad result set. The Okta System Log is near real time, but Okta notes that bounded results can rarely be delayed, so repeat the search with a wider time window before concluding that an event is absent.

For every matching event, capture the following fields in a sanitized troubleshooting record:

- `published`, `eventType`, and `displayMessage`;
- `outcome.result` and `outcome.reason`;
- `actor.id` and `actor.displayName`;
- each `target` entry's `id`, `type`, and `displayName`, confirming both the user and application where present;
- `transaction.id`, `transaction.type`, and `transaction.detail`;
- `authenticationContext.externalSessionId`, if populated, using a redacted or hashed value when sharing it;
- `client.ipAddress`, user agent, and device context, to distinguish another browser or device session; and
- relevant `debugContext.debugData` fields such as a request ID, trace ID, request URI, protocol, or failure reason, after removing tokens, SAML payloads, and personal data.

Correlate adjacent events using `transaction.id`, request/trace identifiers, the target user and application, and the bounded timestamp window. Do not share API tokens, cookies, raw `SAMLRequest` or `SAMLResponse` values, complete session IDs, or an unredacted HAR/System Log export.

Interpret the evidence as follows:

| Okta System Log result | Meaning and next action |
|---|---|
| No `user.authentication.slo` | First recheck the UTC window, user/app filters, administrator permissions, and delayed-event possibility. The captured browser exchange proves that Okta received the request and returned SAML `Success`, so a persistent absence becomes an Okta logging/support question rather than a PingOne transport failure. |
| `user.authentication.slo` with `FAILURE` | Capture `outcome.reason`, transaction/request IDs, targets, and sanitized debug data. This would conflict with the returned SAML `Success` and should be escalated to Okta. |
| `user.authentication.slo` with `SUCCESS`, but no `user.session.end` | This is the leading hypothesis: Okta ended the application SAML session but did not end the organization browser session. Ask Okta whether that is expected for this application-initiated SLO configuration and what setting or supported flow terminates the Okta session. |
| Both SLO and `user.session.end` succeed, and no new `user.session.start` appears | `/api/v1/sessions/me` should no longer report the original session. If it does, compare the redacted external-session correlation and escalate the inconsistency to Okta. |
| `user.session.end` is followed by `user.session.start` | The original session ended but was recreated. Inspect the new event's client, authentication context, policy/device behavior, other tabs, and FastPass or device SSO behavior. |
| A later `user.authentication.sso` succeeds without a new session start | Compare its transaction and external-session context with the logout events to determine whether an existing Okta session survived application SLO. |

The minimum evidence package for Okta support is therefore: exact UTC test window, originating application, sanitized before/after session comparison, the four event searches above, full sanitized details for every matching event, and the already verified browser sequence `startslo` → Okta `saml` → PingOne `slo` with a signed SAML `Success` response.

The application orchestration initiates PingOne SAML SLO while PingOne still has the upstream Okta participation context. Registration and Leader Tools use the same broker-owned behavior and do not call Okta directly or contain Okta certificates or credentials. Live browser verification from both logout buttons is complete: each terminates the Okta browser session, confirmed by `/api/v1/sessions/me` and by the fresh credential prompt on the next Council Sign In.

### 8. A parallel Okta OIDC provider is no longer required for the POC login path

A parallel Okta OIDC provider was considered while SAML authentication was blocked. Because the SAML login workaround is now verified, that alternative is deferred. It remains a possible production architecture comparison, but it should not be presented as required to complete this POC.

## Logout and session-propagation findings

- Redis provides a shared revocation store for the POC applications.
- The development start/stop scripts start and stop the Redis Compose service while preserving its named data volume.
- Downstream logout records PingOne session or subject revocation data so other participating applications can reject existing sessions.
- `gs-registration` polls its session-status endpoint because it is a browser SPA.
- Back-channel logout endpoints validate signed logout tokens before revoking sessions.
- A real cloud-to-localhost back-channel push cannot be demonstrated without a publicly reachable HTTPS callback.
- PingOne discovery in the tested tenant does not advertise OIDC back-channel logout support.
- The Gigya forced-login marker and authorization proxy make the next interactive Gigya request use `prompt=login`; they do not terminate the upstream Gigya session.
- Okta-backed application logout initiates PingOne SAML SLO before OIDC signoff and is verified to terminate the Okta browser session; Gigya-backed logout retains the existing OIDC and forced-reauthentication path.
- Leader Tools records the session's upstream IdP against the shared PingOne `sid` in Redis at interactive Okta login, and Registration's logout resolves it through its backend, so logging out from either application invokes the same broker-owned SAML SLO flow. This cross-application requirement is now verified.

Redis-based downstream revocation and upstream identity-provider logout are separate concerns. Redis can invalidate sessions in the POC applications, but it cannot terminate the browser's Gigya or Okta session.

## Security observations

- Worker client credentials must never be stored in the repository, browser code, screenshots, or documentation.
- A Worker secret was exposed during troubleshooting. The exposed value must remain revoked, and replacement secrets must never be pasted into chat, logs, screenshots, or repository files.
- Downstream applications must not receive Gigya's upstream client secret or upstream ID token merely to implement logout.
- Registration's verbose `oidc-client-ts` logging is disabled by default and can be enabled only in a local Vite development build with `VITE_OIDC_DEBUG=true`.
- The Gigya authorization proxy and forced-login marker are explicitly POC-only behavior.
- Any development-only role or claim bypass must remain disabled outside local development.

## Verified, pending, and blocked status

| Capability | Status | Notes |
|---|---|---|
| Application to PingOne OIDC login | Verified | Downstream broker boundary works. |
| PingOne to Gigya authentication | Verified | Uses API-created IdP and resolvable authorization endpoint. |
| Gigya cross-application SSO | Verified | Registration to Leader Tools tested successfully. |
| Fresh Gigya challenge after logout | Verified for POC | Implemented with one-time `prompt=login`; not true upstream logout. |
| True PingOne-to-Gigya universal logout | Achievable; test pending | Gigya advertises `end_session_endpoint` and SAP documents RP-initiated logout. Requires the CDC administrator to register a Trusted Post Logout URL and confirm the upstream `client_id`; see Gigya findings 5 and 8. |
| Redis downstream cross-application logout | Verified | Bidirectional logout propagation was tested between Registration and Leader Tools. Full cloud back-channel push still requires a public endpoint and broker support. |
| PingOne to Okta SAML authentication | Verified | Leader Tools Council Sign In completes through PingOne and Okta. |
| Okta SAML interoperability workaround | Verified for POC | Uses Name ID format `Unspecified` with Okta Signed Requests disabled. |
| Okta-to-Registration SSO | Verified | Registration silently reused the PingOne session created by Leader Tools through Okta. |
| Conditional `Gigya-Federated` policy | Verified | API repair selected provider `3e182f33-996f-47f8-bae4-e2c7914c95d8` and stored an eight-hour last-sign-on condition. |
| Okta SAML SLO configuration | Verified | Okta publishes its IdP SLO endpoint; PingOne stores that endpoint with `HTTP_POST`, a two-hour SLO window, and the Okta verification certificate. |
| PingOne outbound Okta `LogoutRequest` | Verified | Direct `/saml20/startslo` testing produced an auto-posted, signed request with the correct destination and issuer plus `NameID` and `SessionIndex`. |
| Okta upstream session termination | Verified | Required enabling the Okta Early Access **Front-channel Single Logout** feature. With it enabled, direct `/saml20/startslo` and both application logout paths terminate the Okta browser session. |
| Provider-aware application logout orchestration | Verified | Both apps revoke downstream state first and select SAML `startslo` from the `identity_provider` claim, the `OktaOnly` `acr`, or the Redis-shared session-upstream record; the Gigya signoff path is retained. |
| Provider-aware logout strategy tests | Verified | Both app implementations cover Okta SAML selection via the claim and via the `OktaOnly` `acr`, Gigya OIDC selection, and missing-SLO fallback. |
| Logout from either app clears Okta | Verified | Leader Tools logout and Registration logout after silent Okta SSO each terminate the Okta browser session, confirmed via `/api/v1/sessions/me` and a fresh credential prompt. |
| Parallel Okta OIDC provider | Deferred | No longer required for the working POC login path. |
| Okta dashboard tile | Not supported | IdP-initiated launch lacks PingOne RelayState. |

## Questions for Ping Identity

1. Why does the PingOne external SAML IdP integration omit `NameIDPolicy` from its outbound `AuthnRequest`?
2. Is there a supported production configuration for an upstream SAML IdP that requires both signed authentication requests and an explicit Name ID policy?
3. What is the recommended logout sequence when downstream applications use OIDC but the participating upstream external IdP uses SAML SLO?
4. Does PingOne support upstream logout propagation for a generic external OIDC provider such as Gigya CDC?
5. Can PingOne retain and use the upstream Gigya ID token when performing broker-owned logout?
6. Which PingOne application and external-IdP configurations support front-channel or back-channel logout propagation?
7. The `identity_provider` ID-token claim reflects the IdP authoritative for the user record and reads `local` for federated logins linked to a pre-existing PingOne user. Is there a supported session-level claim or attribute-mapping expression that identifies the IdP that authenticated the current session?
8. Is there a supported way to return the browser to the application after `/saml20/startslo` completes, instead of ending on the PingOne Signed Off page? The endpoint recognizes `post_logout_redirect_uri` but rejects it with `INVALID_POST_LOGOUT_REDIRECT_URI` in every tested combination (August 31, 2026): a URI that exactly matches an entry in the application's registered Signoff URLs, sent bare, with `id_token_hint`, and with `client_id`. If the endpoint does not support a completion redirect, what is the recommended pattern — a product enhancement, or a DaVinci-orchestrated logout journey?
9. Gigya's OIDC OP advertises `end_session_endpoint` and `backchannel_logout_supported: true`. Can PingOne call an upstream OIDC IdP's `end_session_endpoint` during signoff (using the upstream ID token it holds), and can PingOne register as a back-channel logout receiver so upstream Gigya logouts propagate into the broker?

## Questions for Okta

1. Resolved during the POC: the missing session termination after signed SAML `Success` was explained by the disabled Early Access **Front-channel Single Logout** feature; enabling it produced full session termination.
2. What is the general-availability timeline for Front-channel Single Logout, and is the feature available and supportable in the production Okta tenant's SKU?
3. Can the dashboard tile be hidden so users do not attempt the unsupported IdP-initiated flow?
4. If signed authentication requests are mandatory in production, would an Okta OIDC application or another supported SAML configuration be acceptable for this broker connection?

## Recommended next steps

1. Confirm with the Okta administrator that the production Okta tenant supports the Early Access **Front-channel Single Logout** feature, and obtain Okta's general-availability timeline before the production design relies on it.
2. Ask the CDC administrator to repair the Gigya site's custom domain / Custom Login Proxy configuration (`gigy-dev-clp.dev-parent-gsusa` resolves to `NXDOMAIN`) — a real custom domain with DNS and certificate, or reversion to default `gigya.com` endpoints. This fixes the dotless issuer and removes the local authorization proxy (Gigya findings 1 and 2), and is a production prerequisite.
3. Ask the CDC administrator to add the application (or proxy) URL to the PingOne RP's Trusted Post Logout URLs and confirm the upstream `client_id`, then live-test RP-initiated logout against Gigya's `end_session_endpoint` to replace the forced-reauthentication marker with true upstream logout (Gigya finding 5).
4. Clarify with the architecture owners whether the SAML mandate for the Okta integration covers logout as well as authentication. If it covers authentication only, the deferred front-channel logout chain (Okta finding 5) would restore the post-logout return to the application and remove the Early Access feature dependency.
5. Capture the Okta System Log evidence pair (`user.authentication.slo` and `user.session.end`) for one verified logout using the retained procedure in Okta finding 7, as root-cause documentation.
6. Review the `identity_provider` claim limitation with Ping Identity and ask for a supported session-level IdP claim (Questions for Ping Identity, item 7).
7. Ask Ping Identity for the supported post-SLO redirect pattern and upstream OIDC logout support (Questions for Ping Identity, items 8 and 9); until answered, the Signed Off landing page is the accepted Okta behavior.
8. Repair the upstream JIT-provisioning attribute mappings so federated users are created with a human-readable username, email, and name attributes instead of the raw provider identifier.
9. Re-run the Gigya logout scenarios to ensure the existing forced-reauthentication fallback remains intact after the logout orchestration changes.
10. Verify the optional `PINGONE_SAML_SLO_URL` and `VITE_PINGONE_SAML_SLO_URL` overrides in the deployment environments or leave them unset to use issuer-based derivation.
11. Confirm the previously exposed Worker secret has been revoked and retain only a securely stored replacement.
12. Review the Gigya and Okta interoperability findings with Ping Identity before treating either workaround as a production design.

## Vendor references

- [PingOne: Create Identity Provider (SAML)](https://developer.pingidentity.com/pingone-api/platform/identity-provider-management/identity-providers/create-identity-provider-saml.html)
- [PingOne: Identity Provider Management](https://developer.pingidentity.com/pingone-api/platform/identity-provider-management.html)
- [Okta: Application Integration Wizard SAML field reference](https://help.okta.com/en-us/Content/Topics/Apps/aiw-saml-reference.htm)
- [Okta: Test a SAML implementation with SAML-tracer](https://developer.okta.com/docs/guides/saml-tracer/-/main/)
- [Okta: Single Sign-On overview and protocol guidance](https://developer.okta.com/docs/concepts/sso-overview/)
- [Okta: Sign users in to a web application using OIDC](https://developer.okta.com/docs/guides/sign-into-web-app-redirect/main/)
- [PingOne: Adding an external OIDC identity provider](https://docs.pingidentity.com/pingone/integrations/p1_add_idp_oidc.html)
- [PingOne: Authentication policies](https://docs.pingidentity.com/pingone/authentication/p1_authenticationpolicies.html)
- [PingOne: Sign-on policy actions API](https://developer.pingidentity.com/pingone-api/platform/sign-on-policies/sign-on-policy-actions.html)
- [PingOne: SAML 2.0 single logout](https://docs.pingidentity.com/pingone/integrations/p1_saml_slo_externalidp.html)
- [PingOne: Downloading metadata for SAML IdPs](https://docs.pingidentity.com/pingone/integrations/p1_download_metadata_for_saml_idps.html)
- [Okta: Configure Single Logout in app integrations](https://help.okta.com/en-us/content/topics/apps/apps_single_logout.htm)
- [Okta: System Log query guide](https://developer.okta.com/docs/reference/system-log-query/)
- [Okta: System Log event types catalog](https://developer.okta.com/docs/reference/api/event-types/)
