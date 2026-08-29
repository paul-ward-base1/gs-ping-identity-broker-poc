# Girl Scouts – Simplified Registration Prototype

A React prototype for the Girl Scouts USA simplified member registration experience. The project covers the full end-to-end registration journey across four user flows, built as a mobile-first single-page application.

---

## Overview

This prototype was created to support UX design exploration and stakeholder review of the simplified registration process. Registration data remains client-side only. For the CIAM broker POC, the app also uses PingOne OIDC and mounts development/production session-status and logout-revocation endpoints; those endpoints support authentication testing and do not persist registration data.

### User Flows

| Flow | Entry point | Description |
|------|-------------|-------------|
| **New Girl Scout** | `/` → `/become-a-girl-scout` | Primary flow for registering a new Girl Scout member and caregiver |
| **Troop Invitation** | `/troop-invitation` | Registration initiated from a troop invitation code |
| **Renew Membership** | `/renew` | Existing member membership renewal |
| **Event Registration** | `/register-event` | Browse and register for Girl Scout events |

### New Girl Scout Flow (primary)

```
Splash → Caregiver Name → Caregiver Email → Caregiver Address → Caregiver Phone
       → Girl's Name → Grade & DOB → Race & Ethnicity
       → Girl Membership → Caregiver Membership → Cart → Payment → Confirmation
```

**Payment options supported:**
- Credit card (Girl and/or Caregiver)
- Financial aid application (Girl and/or Caregiver)
- Mixed: credit card for one, financial aid for the other

---

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18 |
| TypeScript | 5 |
| React Router | 6 |
| Vite | 6 |

No external UI libraries or CSS frameworks are used. All styling is hand-authored CSS with design tokens defined in `src/styles/tokens.css`.

---

## Project Structure

```
src/
├── App.tsx                    # Root router — all route definitions
├── main.tsx                   # React entry point
├── context/
│   └── RegistrationContext.tsx  # Global state store (flat object, update() pattern)
├── components/                # Shared UI components
│   ├── Button.tsx / .css
│   ├── CheckboxCard.tsx / .css
│   ├── Footer.tsx / .css
│   ├── ProgressBar.tsx / .css
│   ├── RadioCard.tsx / .css
│   ├── TextField.tsx / .css   # Floating-label text input
│   └── TopNav.tsx / .css
├── screens/
│   ├── Home.tsx               # Flow selector landing page
│   ├── GirlScoutSplash.tsx    # New Girl Scout entry splash
│   ├── CaregiverName.tsx
│   ├── CaregiverEmail.tsx
│   ├── CaregiverAddress.tsx
│   ├── CaregiverPhone.tsx
│   ├── GirlsName.tsx
│   ├── Schooling.tsx          # Grade & date of birth
│   ├── GirlsRaceEthnicity.tsx
│   ├── MembershipOptions.tsx  # Girl membership selection
│   ├── CaregiverMembership.tsx
│   ├── Cart.tsx
│   ├── Payment.tsx            # Payment options + credit card form
│   ├── Confirmation.tsx       # Order confirmation + account creation
│   ├── event-registration/    # Event registration sub-flow
│   ├── renew/                 # Membership renewal sub-flow
│   └── troop-invitation/      # Troop invitation sub-flow
└── styles/
    ├── tokens.css             # Design tokens (colours, spacing, typography)
    └── global.css             # Base/reset styles
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app runs at **http://localhost:3300** by default.

### Build for production

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## PingOne broker POC

The PingOne SPA authority and client ID are defined in `src/auth/oidc-config.ts`. The PingOne application must register the exact callback, silent-renew, and post-logout URLs for the origin being tested. Use `https://gsregistration.local` with the repository's Caddy setup, or `http://localhost:3300` without Caddy; a plain-HTTP `.local` origin does not provide the secure browser context required for OIDC PKCE.

Optional local settings:

```bash
# Override PingOne's derived SAML SLO start URL when needed
VITE_PINGONE_SAML_SLO_URL=https://auth.pingone.ca/<environment-id>/saml20/startslo

# Local troubleshooting only; OIDC logging is disabled by default
VITE_OIDC_DEBUG=true
```

An Okta-authenticated PingOne session can be reused silently by Registration. Logout is provider-aware: Okta-backed sessions initiate PingOne SAML SLO, while Gigya-backed sessions retain the existing PingOne OIDC/forced-reauthentication path. See the repository's [`docs/ciam-broker-poc-findings.md`](../../docs/ciam-broker-poc-findings.md) for verified behavior and unresolved upstream logout limitations.

---

## State Management

All registration data is held in a single flat context object (`RegistrationContext`). Any screen can read or update it via the `useRegistration()` hook:

```tsx
const { data, update, reset } = useRegistration()

// Read
data.caregiverFirstName

// Write (partial update, other fields unchanged)
update({ caregiverFirstName: 'Jane' })

// Reset entire form
reset()
```

---

## Key Design Patterns

- **Floating labels** — `TextField` uses `placeholder=" "` + CSS `:placeholder-shown` to animate the label between placeholder and floated states without JavaScript.
- **Select fields** — Dropdowns use a React-controlled `select-field-label--active` class to achieve the same floating-label effect.
- **Mobile-first** — Designed for 390 × 844 (iPhone 14) viewport; no responsive breakpoints are required since this is a dedicated mobile experience.
- **Per-screen validation** — Each screen validates its own fields on submit and renders inline error messages; no form library is used.
