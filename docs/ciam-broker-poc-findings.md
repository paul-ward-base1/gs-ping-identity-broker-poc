# CIAM Broker POC Findings

**Project:** `gs-ping-identity-broker-poc`
**Status date:** August 28, 2026
**Purpose:** Record the behavior, workarounds, limitations, and open questions discovered while testing PingOne as an identity broker for Girl Scouts applications.

## Executive summary

The POC demonstrates that Girl Scouts applications can use PingOne as their only downstream OpenID Connect (OIDC) provider while PingOne delegates authentication to upstream identity providers. This keeps Gigya/SAP Customer Data Cloud (CDC) and Okta configuration out of the applications and gives the applications a consistent PingOne token boundary.

Gigya authentication, Okta SAML authentication, and cross-application PingOne SSO now work. A user authenticated through Okta in Leader Tools can open Registration and be signed in automatically through the existing PingOne session. When no usable PingOne session exists, Registration continues to use Gigya as its interactive authentication source.

The remaining functional gap is upstream logout. The Gigya POC uses a forced-reauthentication marker that produces a fresh Gigya credential challenge but does not terminate the underlying Gigya session. Okta SAML single logout (SLO) is now configured on both sides, and a direct PingOne SLO test completes a signed request/response exchange with an Okta `Success` result. Provider-aware application logout orchestration is implemented in both Leader Tools and Registration, but the Okta browser session nevertheless remains active. Okta session handling remains the external blocker, and the new application paths still require live browser verification.

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

Leader Tools and Registration first clear their local sessions and shared downstream revocation state. Logout then branches on PingOne's `identity_provider` claim:

- `okta-workforce` redirects to PingOne `/saml20/startslo` while the PingOne browser session still contains its upstream SAML participant context;
- `gigya-b2c` retains the existing PingOne OIDC signoff followed by the POC-only Gigya forced-reauthentication marker; and
- an unavailable or invalid SAML SLO URL safely falls back to the existing OIDC signoff path.

Leader Tools accepts an optional server-side `PINGONE_SAML_SLO_URL`. Registration accepts an optional build-time `VITE_PINGONE_SAML_SLO_URL`. Without an override, both derive the SAML endpoint from the HTTPS PingOne OIDC issuer or authority rather than hard-coding an environment-specific logout URL in the control flow.

The shared behavior is covered by focused unit tests for both implementations: `okta-workforce` selects SAML SLO, `gigya-b2c` selects the existing OIDC path, and an unavailable SAML endpoint safely falls back to OIDC signoff.

The implemented Okta path is therefore:

```text
Application session: logged out
Shared downstream sessions: revoked
PingOne SAML SLO: initiated before OIDC signoff
Okta browser session: expected to be logged out, but direct testing still shows it active
```

The code path is complete but has not yet been live-tested from both applications. Even after direct SAML SLO, the next **Council Sign In** can complete at Okta without another credential prompt because the Okta browser session still exists. This is the remaining Okta functional gap, not an Okta login-policy failure.

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

### 7. Okta browser-session termination remains unresolved

After the direct PingOne SLO test, Okta's `/api/v1/sessions/me` endpoint continued to report the same browser session as active. Closing and reopening the browser and clearing the application cache did not change the result. This is stronger evidence than the absence of a credential prompt because Okta can otherwise reuse a session through device or authentication policy behavior.

The SAML transport, endpoint, issuer, request signature, correlation, and success response are no longer the unresolved fault boundary. Okta System Log evidence is still needed at the test timestamp, especially `user.authentication.slo` and `user.session.end`. If Okta records successful SLO but no session-end event, or records a session-end event while the same session ID remains active, Okta session handling requires vendor investigation.

#### Okta logging required to resolve the remaining logout issue

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

The application orchestration now initiates PingOne SAML SLO while PingOne still has the upstream Okta participation context. Registration and Leader Tools use the same broker-owned behavior and do not call Okta directly or contain Okta certificates or credentials. Live browser verification from both logout buttons remains pending.

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
- Okta-backed application logout now initiates PingOne SAML SLO before OIDC signoff; Gigya-backed logout retains the existing OIDC and forced-reauthentication path.
- If a user authenticates through Okta in Leader Tools and then enters Registration through PingOne SSO, logging out from either application must eventually invoke the same broker-owned SAML SLO flow to meet the requirement that Okta also be released.

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
| True PingOne-to-Gigya universal logout | Blocked | Tested generic upstream integration did not terminate Gigya session. |
| Redis downstream cross-application logout | Verified | Bidirectional logout propagation was tested between Registration and Leader Tools. Full cloud back-channel push still requires a public endpoint and broker support. |
| PingOne to Okta SAML authentication | Verified | Leader Tools Council Sign In completes through PingOne and Okta. |
| Okta SAML interoperability workaround | Verified for POC | Uses Name ID format `Unspecified` with Okta Signed Requests disabled. |
| Okta-to-Registration SSO | Verified | Registration silently reused the PingOne session created by Leader Tools through Okta. |
| Conditional `Gigya-Federated` policy | Verified | API repair selected provider `3e182f33-996f-47f8-bae4-e2c7914c95d8` and stored an eight-hour last-sign-on condition. |
| Okta SAML SLO configuration | Verified | Okta publishes its IdP SLO endpoint; PingOne stores that endpoint with `HTTP_POST`, a two-hour SLO window, and the Okta verification certificate. |
| PingOne outbound Okta `LogoutRequest` | Verified | Direct `/saml20/startslo` testing produced an auto-posted, signed request with the correct destination and issuer plus `NameID` and `SessionIndex`. |
| Okta upstream session termination | Pending investigation | Okta received the request and returned signed SAML `Success`, but the same Okta browser session remained active. Inspect the corresponding Okta System Log events. |
| Provider-aware application logout orchestration | Implemented; live verification pending | Both apps revoke downstream state first, use SAML `startslo` for `okta-workforce`, and retain the existing Gigya signoff path. |
| Provider-aware logout strategy tests | Verified | Both app implementations cover Okta SAML selection, Gigya OIDC selection, and missing-SLO fallback. |
| Logout from either app clears Okta | Pending external resolution | Application SAML SLO initiation is implemented, but Okta still leaves its organization browser session active after returning SAML `Success`. |
| Parallel Okta OIDC provider | Deferred | No longer required for the working POC login path. |
| Okta dashboard tile | Not supported | IdP-initiated launch lacks PingOne RelayState. |

## Questions for Ping Identity

1. Why does the PingOne external SAML IdP integration omit `NameIDPolicy` from its outbound `AuthnRequest`?
2. Is there a supported production configuration for an upstream SAML IdP that requires both signed authentication requests and an explicit Name ID policy?
3. What is the recommended logout sequence when downstream applications use OIDC but the participating upstream external IdP uses SAML SLO?
4. Does PingOne support upstream logout propagation for a generic external OIDC provider such as Gigya CDC?
5. Can PingOne retain and use the upstream Gigya ID token when performing broker-owned logout?
6. Which PingOne application and external-IdP configurations support front-channel or back-channel logout propagation?

## Questions for Okta

1. Does the System Log record `user.authentication.slo` when PingOne initiates the verified signed `LogoutRequest`?
2. Does the successful SAML exchange produce `user.session.end`, or does Okta treat application-initiated SLO as ending only the application session?
3. Why does `/api/v1/sessions/me` continue to report the same browser session as active after Okta returns signed SAML `Success`?
4. Can the dashboard tile be hidden so users do not attempt the unsupported IdP-initiated flow?
5. If signed authentication requests are mandatory in production, would an Okta OIDC application or another supported SAML configuration be acceptable for this broker connection?

## Recommended next steps

1. Have the Okta administrator follow the bounded, four-event System Log procedure documented above and return a sanitized event package correlated by UTC time, user/app targets, transaction ID, and request/trace identifiers.
2. Resolve the Okta session-termination behavior and repeat the direct test until `/api/v1/sessions/me` no longer reports the original session as active.
3. Live-test Leader Tools logout: authenticate through Okta, select **Sign Out**, verify the `startslo` → Okta `saml` → PingOne `slo` sequence, and inspect the Okta session.
4. Live-test Registration logout after Okta SSO: authenticate through Okta in Leader Tools, enter Registration silently, log out from Registration, and confirm the same SAML sequence and downstream revocation behavior.
5. After the Okta issue is resolved, repeat both application tests and confirm the original Okta browser session is no longer active.
6. Verify the optional `PINGONE_SAML_SLO_URL` and `VITE_PINGONE_SAML_SLO_URL` overrides in the deployment environments or leave them unset to use issuer-based derivation.
7. Re-run the Gigya logout scenarios to ensure the existing forced-reauthentication fallback remains intact.
8. Confirm the previously exposed Worker secret has been revoked and retain only a securely stored replacement.
9. Review the Gigya and Okta interoperability findings with Ping Identity before treating either workaround as a production design.

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
