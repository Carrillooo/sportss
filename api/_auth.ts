import { createHmac, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

export const COOKIE = 'sehs_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function sitePassword() {
  return process.env.SITE_PASSWORD?.trim() || ''
}

/** Session token derived from the password: changing SITE_PASSWORD signs everyone out. */
function token(password: string) {
  return createHmac('sha256', password).update('sehs-session-v1').digest('hex')
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function passwordMatches(input: string) {
  const pw = sitePassword()
  return !!pw && safeEqual(token(input), token(pw))
}

function readCookie(req: IncomingMessage, name: string) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return ''
}

export function isAuthed(req: IncomingMessage) {
  const pw = sitePassword()
  return !!pw && safeEqual(readCookie(req, COOKIE), token(pw))
}

function secure(req: IncomingMessage) {
  return req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''
}

export function setSession(req: IncomingMessage, res: ServerResponse) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token(sitePassword())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure(req)}`,
  )
}

export function clearSession(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure(req)}`)
}

export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

/** Vercel pre-parses JSON into req.body; the Vite dev server hands us the raw stream. */
export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const pre = (req as IncomingMessage & { body?: unknown }).body
  if (pre && typeof pre === 'object') return pre as Record<string, unknown>
  if (typeof pre === 'string') return safeParse(pre)
  let raw = ''
  for await (const chunk of req) raw += chunk
  return safeParse(raw)
}

function safeParse(s: string) {
  try {
    const v = JSON.parse(s)
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}
