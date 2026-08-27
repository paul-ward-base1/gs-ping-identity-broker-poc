# CIAM Broker POC Findings

**Project:** `gs-ping-setup-poc`  
**Status date:** August 27, 2026  
**Purpose:** Record the behavior, workarounds, limitations, and open questions discovered while testing PingOne as an identity broker for Girl Scouts applications.

## Executive summary

The POC demonstrates that Girl Scouts applications can use PingOne as their only downstream OpenID Connect (OIDC) provider while PingOne delegates authentication to upstream identity providers. This keeps Gigya/SAP Customer Data Cloud (CDC) and Okta configuration out of the applications and gives the applications a consistent PingOne token boundary.

The basic Gigya authentication and cross-application SSO flow works. A POC workaround can also force a fresh Gigya credential challenge after logout. However, this workaround is not true upstream Gigya session termination and should not be treated as the production universal-logout design.

The Okta path is currently blocked after the user authenticates to Okta. PingOne's outbound SAML `AuthnRequest` does not contain a `NameIDPolicy`, while the Okta SAML application validates the request against its configured Name ID format. Okta therefore authenticates the browser but does not complete the SAML handoff to PingOne. The proposed POC workaround is to leave the Okta Name ID format as `Unspecified` and disable Okta's **Signed Requests** enforcement. That workaround has not yet been verified end to end.

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

## Gigya findings

### 1. PingOne console rejects Gigya's issuer

Gigya publishes the unusual dotless issuer:

```text
https://dev-parent-gsusa/
```

The PingOne console's client-side URL validation rejects this issuer even though the PingOne Management API accepts it. The Gigya external OIDC identity provider was therefore created and updated through the Management API using the `poc-mgmt-api` Worker application.

This is a PingOne console limitation, not a reason for downstream applications to connect directly to Gigya.

### 2. Gigya browser authorization endpoint required a resolvable host

Gigya discovery returned a custom dotless hostname that the local browser could not resolve. During testing this produced `DNS_PROBE_FINISHED_NXDOMAIN` for the Gigya authorization URL.

The working POC uses Gigya's public `fidm.us1.gigya.com` authorization endpoint. A local HTTPS authorization proxy at the following address preserves PingOne's complete authorization request and forwards it to that endpoint:

```text
https://cdc-login.gsusa.local/api/auth/gigya-authorize
```

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

### 6. Forced reauthentication is a POC fallback, not universal logout

The implemented fallback marks the next interactive Gigya authorization after application logout. The authorization proxy consumes that marker and adds:

```text
prompt=login
```

This produces a fresh Gigya credential challenge while allowing ordinary cross-application SSO at other times. Silent `prompt=none` requests do not consume the marker.

This proves the desired user experience for the POC, but it does not prove that the upstream Gigya session was terminated. A production solution still requires supported logout orchestration between PingOne and Gigya.

## Okta findings

### 1. Leader Tools initiates the correct broker choice

The **Council Sign In** action starts the normal downstream PingOne OIDC flow and selects the Okta-only PingOne authentication policy through `acr_values=OktaOnly`.

The failure occurs between PingOne and Okta, before PingOne issues an OIDC result to Leader Tools. It is not an Auth.js callback or Leader Tools routing problem.

### 2. Okta authentication succeeds, but broker authentication does not complete

After credentials are accepted, the browser can arrive at:

```text
https://integrator-9136098.okta.com/app/UserHome?session_hint=AUTHENTICATED
```

This confirms only that the browser has an authenticated Okta session. It does not mean that Okta returned a valid SAML response to PingOne or that PingOne created a session for Leader Tools.

The session state at that point is effectively:

```text
Okta:         authenticated
PingOne:      authentication flow incomplete
Leader Tools: no application session
```

### 3. The current blocker is a SAML NameIDPolicy mismatch

Okta reports:

```text
NameIDPolicy '' is not the configured Name ID Format
'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified' for the app
```

The empty value (`''`) indicates that PingOne did not supply an explicit `NameIDPolicy` in its SAML `AuthnRequest`. Changing the Okta application's response Name ID format from `EmailAddress` to `Unspecified` did not, by itself, resolve the request validation failure.

PingOne's documented external SAML identity-provider model supports SSO endpoints, entity IDs, bindings, certificates, and request signing, but it does not expose a supported `NameIDPolicy` or outbound Name ID format property. PingOne custom attribute mappings apply to values received in the SAML assertion; they do not add elements to the outbound `AuthnRequest`.

Keycloak did not show this behavior in the sibling POC because its SAML request explicitly supplied the Name ID policy expected by Okta.

### 4. Proposed Okta workaround

For the POC, the proposed configuration is:

- Okta **Name ID format**: `Unspecified`
- Okta **Signed Requests**: disabled

Okta documents that enabling **Signed Requests** requires the SAML request to include a `NameIDPolicy`. Because this PingOne external-IdP flow omits that field, disabling that enforcement is the most direct POC workaround.

**Status:** awaiting configuration and end-to-end verification. If organizational policy requires Signed Requests to remain enabled, this SAML path requires guidance or a product change from Ping Identity. A parallel Okta OIDC connection is another possible POC path.

### 5. The Okta dashboard tile is not a valid test entry point

The **GSUSA Broker (PingOne)** tile attempts an Okta/IdP-initiated flow. PingOne expects the transaction-specific `RelayState` generated when Leader Tools starts authentication. Clicking the tile without that state produces:

```text
MISSING_RELAY_STATE - RelayState parameter is missing
```

Testing must start at:

```text
https://leadertools.local
```

and then use **Council Sign In**. The Okta application tile should be hidden from users unless an IdP-initiated flow is separately designed and supported.

## Logout and session-propagation findings

- Redis provides a shared revocation store for the POC applications.
- The development start/stop scripts start and stop the Redis Compose service while preserving its named data volume.
- Downstream logout records PingOne session or subject revocation data so other participating applications can reject existing sessions.
- `gs-registration` polls its session-status endpoint because it is a browser SPA.
- Back-channel logout endpoints validate signed logout tokens before revoking sessions.
- A real cloud-to-localhost back-channel push cannot be demonstrated without a publicly reachable HTTPS callback.
- PingOne discovery in the tested tenant does not advertise OIDC back-channel logout support.

Redis-based downstream revocation and upstream identity-provider logout are separate concerns. Redis can invalidate sessions in the POC applications, but it cannot terminate the browser's Gigya or Okta session.

## Security observations

- Worker client credentials must never be stored in the repository, browser code, screenshots, or documentation.
- A Worker secret was exposed during troubleshooting and must be rotated before further use.
- Downstream applications must not receive Gigya's upstream client secret or upstream ID token merely to implement logout.
- The Gigya authorization proxy and forced-login marker are explicitly POC-only behavior.
- Any development-only role or claim bypass must remain disabled outside local development.

## Verified, pending, and blocked status

| Capability | Status | Notes |
|---|---|---|
| Application to PingOne OIDC login | Verified | Downstream broker boundary works. |
| PingOne to Gigya authentication | Verified | Uses API-created IdP and resolvable authorization endpoint. |
| Gigya cross-application SSO | Verified | Registration to Leader Tools tested successfully. |
| Fresh Gigya challenge after logout | Verified for POC | Implemented with one-time `prompt=login`; not true upstream logout. |
| True PingOne-to-Gigya universal logout | Blocked | Tested generic upstream integration did not terminate Gigya session. |
| Redis downstream cross-application logout | Verified | Bidirectional logout propagation was tested between Registration and Leader Tools. Full cloud back-channel push still requires a public endpoint and broker support. |
| PingOne to Okta authentication | Blocked | Okta accepts credentials but rejects/abandons the SAML handoff because NameIDPolicy is absent. |
| Okta `Unspecified` Name ID format | Tested, insufficient alone | Error still reports an empty requested policy. |
| Disable Okta Signed Requests | Proposed | Must be applied and verified. |
| Okta dashboard tile | Not supported | IdP-initiated launch lacks PingOne RelayState. |

## Questions for Ping Identity

1. Why does the PingOne external SAML IdP integration omit `NameIDPolicy` from its outbound `AuthnRequest`?
2. Is there a supported tenant feature, API property, or policy setting for specifying the outbound Name ID format?
3. What is the supported configuration when an upstream SAML IdP requires signed requests and an explicit Name ID policy?
4. Does PingOne support upstream logout propagation for a generic external OIDC provider such as Gigya CDC?
5. Can PingOne retain and use the upstream Gigya ID token when performing broker-owned logout?
6. Which PingOne application and external-IdP configurations support front-channel or back-channel logout propagation?

## Questions for Okta

1. Can **Signed Requests** be disabled for the POC application while retaining the static ACS URL and audience restrictions?
2. When the request omits `NameIDPolicy`, will Okta use the application's configured `Unspecified` format after Signed Requests enforcement is disabled?
3. Can the dashboard tile be hidden so users do not attempt the unsupported IdP-initiated flow?
4. If signed requests are mandatory in production, would an Okta OIDC application be an acceptable alternative to SAML for this broker connection?

## Recommended next steps

1. Disable **Signed Requests** in the Okta SAML application while retaining **Name ID format = Unspecified**.
2. Start a fresh test from Leader Tools **Council Sign In**, not from the Okta dashboard tile.
3. Capture and decode PingOne's outbound `SAMLRequest` to preserve evidence that `RelayState` is present and `NameIDPolicy` is absent.
4. Confirm that Okta posts its SAML response to PingOne and that PingOne returns an OIDC authorization result to Leader Tools.
5. Verify Okta-derived claims and council/admin authorization inside Leader Tools.
6. Rotate the exposed PingOne Worker secret.
7. Review the Gigya and Okta interoperability findings with Ping Identity before treating either workaround as a production design.

## Vendor references

- [PingOne: Create Identity Provider (SAML)](https://developer.pingidentity.com/pingone-api/platform/identity-provider-management/identity-providers/create-identity-provider-saml.html)
- [PingOne: Identity Provider Management](https://developer.pingidentity.com/pingone-api/platform/identity-provider-management.html)
- [Okta: Application Integration Wizard SAML field reference](https://help.okta.com/en-us/Content/Topics/Apps/aiw-saml-reference.htm)
- [Okta: Test a SAML implementation with SAML-tracer](https://developer.okta.com/docs/guides/saml-tracer/-/main/)
