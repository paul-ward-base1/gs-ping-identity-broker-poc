import express from 'express'
import Redis from 'ioredis'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const DEFAULT_ISSUER = 'https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/as'
const DEFAULT_CLIENT_ID = 'c9193ae2-d29e-4dc5-b0ff-79ac9b9a4e07'
const DEFAULT_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60
const BACKCHANNEL_LOGOUT_EVENT = 'http://schemas.openid.net/event/backchannel-logout'

const issuer = process.env.AUTH_ISSUER ?? DEFAULT_ISSUER
const audience = process.env.AUTH_CLIENT_ID ?? DEFAULT_CLIENT_ID
const sessionMaxAge = Number(process.env.AUTH_SESSION_MAX_AGE) || DEFAULT_SESSION_MAX_AGE_SECONDS
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
})
redis.on('error', () => {})

let verificationKeyPromise

function identifierKey(kind, value) {
  return `bcl:revoked:${kind}:${encodeURIComponent(issuer)}:${encodeURIComponent(value)}`
}

function upstreamKey(sid) {
  return `broker:upstream:${encodeURIComponent(issuer)}:${encodeURIComponent(sid)}`
}

async function getVerificationKey() {
  if (!verificationKeyPromise) {
    verificationKeyPromise = fetch(`${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`)
      .then(response => {
        if (!response.ok) throw new Error(`unable to load OIDC discovery (${response.status})`)
        return response.json()
      })
      .then(metadata => {
        if (!metadata.jwks_uri) throw new Error('OIDC discovery is missing jwks_uri')
        return createRemoteJWKSet(new URL(metadata.jwks_uri))
      })
  }
  return verificationKeyPromise
}

async function verifyToken(token, options = {}) {
  return jwtVerify(token, await getVerificationKey(), {
    issuer,
    audience,
    algorithms: ['RS256'],
    clockTolerance: 5,
    ...options,
  })
}

async function revokeSession(payload, revokedAt = Math.floor(Date.now() / 1000)) {
  const writes = []
  if (typeof payload.sid === 'string') {
    writes.push(redis.set(identifierKey('sid', payload.sid), '1', 'EX', sessionMaxAge))
  }
  if (typeof payload.sub === 'string') {
    writes.push(redis.set(identifierKey('sub', payload.sub), String(revokedAt), 'EX', sessionMaxAge))
  }
  if (writes.length) await Promise.all(writes)
}

async function sessionIsRevoked(payload) {
  const [sidRevoked, subjectCutoff] = await Promise.all([
    typeof payload.sid === 'string' ? redis.get(identifierKey('sid', payload.sid)) : null,
    typeof payload.sub === 'string' ? redis.get(identifierKey('sub', payload.sub)) : null,
  ])
  if (sidRevoked) return true
  if (!subjectCutoff) return false

  const cutoff = Number(subjectCutoff)
  return typeof payload.iat !== 'number' || !Number.isFinite(cutoff) || payload.iat <= cutoff
}

export function createSessionRevocationRouter() {
  const router = express.Router()

  router.post('/api/auth/backchannel-logout', express.urlencoded({ extended: false }), async (req, res) => {
    try {
      const logoutToken = req.body.logout_token
      if (typeof logoutToken !== 'string') {
        res.status(400).json({ error: 'missing logout_token' })
        return
      }

      const { payload } = await verifyToken(logoutToken, {
        requiredClaims: ['iat', 'jti', 'events'],
        maxTokenAge: '5 minutes',
      })
      const events = payload.events
      if (
        !events ||
        typeof events !== 'object' ||
        !(BACKCHANNEL_LOGOUT_EVENT in events) ||
        payload.nonce !== undefined ||
        typeof payload.jti !== 'string' ||
        (typeof payload.sid !== 'string' && typeof payload.sub !== 'string')
      ) {
        throw new Error('invalid logout token claims')
      }

      await revokeSession(payload, payload.iat)
      res.json({ ok: true })
    } catch (error) {
      console.warn('[BCL] Rejected logout token', error)
      res.status(400).json({ error: 'invalid logout_token' })
    }
  })

  router.post('/api/auth/revoke-session', express.json(), async (req, res) => {
    try {
      const idToken = req.body.id_token
      if (typeof idToken !== 'string') {
        res.status(400).json({ error: 'missing id_token' })
        return
      }
      const { payload } = await verifyToken(idToken)
      await revokeSession(payload)
      res.json({ ok: true })
    } catch (error) {
      console.warn('[logout] Rejected ID token', error)
      res.status(400).json({ error: 'invalid id_token' })
    }
  })

  // Reports which upstream IdP authenticated this token's PingOne browser
  // session, as recorded by the application that performed the interactive
  // login. Lets a silently SSO'd application choose SAML SLO for a session
  // whose own token carries no Okta acr or identity_provider signal.
  router.post('/api/auth/session-upstream', express.json(), async (req, res) => {
    try {
      const idToken = req.body.id_token
      if (typeof idToken !== 'string') {
        res.status(400).json({ error: 'missing id_token' })
        return
      }
      const { payload } = await verifyToken(idToken)
      const upstream =
        typeof payload.sid === 'string' ? await redis.get(upstreamKey(payload.sid)) : null
      res.json({ upstream: upstream ?? null })
    } catch {
      res.status(401).json({ error: 'invalid id_token' })
    }
  })

  router.post('/api/auth/session-status', express.json(), async (req, res) => {
    try {
      const idToken = req.body.id_token
      if (typeof idToken !== 'string') {
        res.status(400).json({ error: 'missing id_token' })
        return
      }
      const { payload } = await verifyToken(idToken)
      res.json({ revoked: await sessionIsRevoked(payload) })
    } catch {
      res.status(401).json({ error: 'invalid id_token' })
    }
  })

  return router
}

export function createSessionRevocationApp() {
  const app = express()
  app.use(createSessionRevocationRouter())
  return app
}
