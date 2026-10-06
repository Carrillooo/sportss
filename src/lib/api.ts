import type { RawQuestion } from './quiz'

export type BankResult =
  | { status: 'ok'; bank: RawQuestion[] }
  | { status: 'locked' | 'not-configured' | 'error'; message?: string }

export async function fetchBank(): Promise<BankResult> {
  try {
    const r = await fetch('/api/questions', { credentials: 'same-origin' })
    if (r.ok) return { status: 'ok', bank: (await r.json()).bank }
    if (r.status === 401) return { status: 'locked' }
    if (r.status === 503) return { status: 'not-configured' }
    return { status: 'error', message: `Server responded ${r.status}` }
  } catch {
    return { status: 'error', message: 'Could not reach the server' }
  }
}

export type LoginResult = 'ok' | 'wrong' | 'not-configured' | 'error'

export async function login(password: string): Promise<LoginResult> {
  try {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (r.ok) return 'ok'
    if (r.status === 401) return 'wrong'
    if (r.status === 503) return 'not-configured'
    return 'error'
  } catch {
    return 'error'
  }
}

export async function logout() {
  await fetch('/api/login', { method: 'DELETE' }).catch(() => {})
}
