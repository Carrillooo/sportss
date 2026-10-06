import type { IncomingMessage, ServerResponse } from 'node:http'
import { clearSession, json, passwordMatches, readJson, setSession, sitePassword } from './_auth.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'DELETE') {
    clearSession(req, res)
    return json(res, 200, { ok: true })
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!sitePassword()) return json(res, 503, { error: 'not-configured' })

  const { password } = await readJson(req)
  if (typeof password !== 'string' || !passwordMatches(password)) {
    // Small fixed delay makes guessing slower without needing a store
    await new Promise((r) => setTimeout(r, 600))
    return json(res, 401, { error: 'wrong-password' })
  }
  setSession(req, res)
  return json(res, 200, { ok: true })
}
