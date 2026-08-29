import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { pingOneSamlSloUrl } from '../auth/oidc-config'
import { getBrokerLogoutStrategy } from '../auth/pingone-saml-logout'
import './TopNav.css'
import gsLogo from '../assets/gs-logo.png'

interface TopNavProps {
  cartCount?: number
}

const NAV_ITEMS = [
  { label: 'Become a Girl Scout',  action: 'internal', to: '/register' },
  { label: 'Be a Volunteer',       action: 'external', to: 'https://mygs.girlscouts.org/volunteer' },
  { label: 'Find an event',        action: 'external', to: 'https://mygs.girlscouts.org/search;type=EVENTS' },
] as const

export function TopNav({ cartCount = 0 }: TopNavProps) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavItem = (item: typeof NAV_ITEMS[number]) => {
    setMenuOpen(false)
    if (item.action === 'internal') {
      navigate(item.to)
    } else {
      window.open(item.to, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <nav className="top-nav">
        <div className="top-nav-left">
          <button
            className="icon-btn hamburger-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
          <button type="button" className="logo-btn" onClick={() => { setMenuOpen(false); navigate('/start') }} aria-label="Go to home">
            <GirlScoutsLogo />
          </button>
          <nav className="top-nav-links" aria-label="Main navigation">
            <div className="top-nav-divider" />
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                type="button"
                className="top-nav-link"
                onClick={() => handleNavItem(item)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="top-nav-right">
          <button className="icon-btn cart-btn" aria-label="Cart">
            <CartIcon />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
          {auth.isAuthenticated ? (
            <>
            <span className="role-badge">
              {(() => {
                const realmAccess = auth.user?.profile.realm_access as { roles?: string[] } | undefined;
                const roles = realmAccess?.roles?.filter((r: string) => r === 'admin' || r === 'member') ?? [];
                const idp = auth.user?.profile.identity_provider as string | undefined;
                const idpLabel = idp === 'gigya-b2c' ? 'CDC' : idp === 'okta-workforce' ? 'Okta' : idp ?? '';
                return `${roles.join(', ')}${idpLabel ? ` · ${idpLabel}` : ''}`;
              })()}
            </span>
            <button className="login-btn" onClick={async () => {
              sessionStorage.setItem("sso-checked", Date.now().toString());
              const upstreamIdp = auth.user?.profile.identity_provider as string | undefined;
              const logoutStrategy = getBrokerLogoutStrategy(upstreamIdp, pingOneSamlSloUrl)
              try {
                if (auth.user?.id_token) {
                  await fetch('/api/auth/revoke-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_token: auth.user.id_token }),
                  })
                }
              } finally {
                if (logoutStrategy === 'saml' && pingOneSamlSloUrl) {
                  // Remove only Registration's local OIDC state. The PingOne
                  // browser session must remain available until startslo uses
                  // its record of the participating Okta SAML IdP.
                  try {
                    await auth.removeUser()
                  } finally {
                    window.location.assign(pingOneSamlSloUrl)
                  }
                } else {
                  // Preserve the existing Gigya POC flow: PingOne OIDC signoff
                  // returns through /post-signoff, which marks the next
                  // interactive Gigya authorization for prompt=login.
                  await auth.signoutRedirect()
                }
              }
            }}>
              {auth.user?.profile.given_name ?? 'User'} · Sign out
            </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => {
              console.log('[debug] Sign in clicked')
              // Do not force Gigya here. With no acr_values, PingOne can reuse
              // an existing broker session established through Okta. When no
              // broker session exists, the application's first assigned policy
              // (Gigya-Federated) remains the default interactive login.
              auth.signinRedirect()
                .catch(err => console.error('[debug] signinRedirect failed:', err))
            }}>
              <PersonIcon /> Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Drawer overlay */}
      {menuOpen && (
        <div className="nav-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="nav-drawer" onClick={e => e.stopPropagation()}>
            <ul className="nav-drawer-list">
              {NAV_ITEMS.map(item => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="nav-drawer-item"
                    onClick={() => handleNavItem(item)}
                  >
                    <span>{item.label}</span>
                    {item.action === 'external' ? <ExternalIcon /> : <ChevronIcon />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

function HamburgerIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
      <path d="M0 0H18V1.5H0V0ZM0 5.75H18V7.25H0V5.75ZM0 11.5H18V13H0V11.5Z" fill="#005640"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2L14 14M14 2L2 14" stroke="#005640" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function GirlScoutsLogo() {
  return (
    <img src={gsLogo} alt="Girl Scouts" className="gs-logo-img" />
  )
}

function CartIcon() {
  return (
    <svg width="21" height="19" viewBox="0 0 21 19" fill="none">
      <path d="M7.5 18C8.328 18 9 17.328 9 16.5C9 15.672 8.328 15 7.5 15C6.672 15 6 15.672 6 16.5C6 17.328 6.672 18 7.5 18Z" fill="#005640"/>
      <path d="M16.5 18C17.328 18 18 17.328 18 16.5C18 15.672 17.328 15 16.5 15C15.672 15 15 15.672 15 16.5C15 17.328 15.672 18 16.5 18Z" fill="#005640"/>
      <path d="M0 1.5H3L5.4 11.55C5.52 12.075 6 12.45 6.525 12.45H16.5C17.025 12.45 17.475 12.075 17.625 11.55L19.5 4.5H4.5" stroke="#005640" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
      <path d="M1 5.5H12M8 1L12 5.5L8 10" stroke="#005640" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8M8 1h4m0 0v4m0-4L6 7" stroke="#005640" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#005640" strokeWidth="2" />
      <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" stroke="#005640" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
