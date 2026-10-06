import type { IncomingMessage, ServerResponse } from 'node:http'
import { isAuthed, json, sitePassword } from './_auth.js'
import { BANK } from './_bank.js'

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  if (!sitePassword()) return json(res, 503, { error: 'not-configured' })
  if (!isAuthed(req)) return json(res, 401, { error: 'locked' })
  return json(res, 200, { bank: BANK })
}
