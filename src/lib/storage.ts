/** Everything here is per-device progress; reads never throw (private mode, blocked storage). */
const KEY = { seen: 'sehs-seen', history: 'sehs-sim', mistakes: 'sehs-mistakes', mastery: 'sehs-mastery' }

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export const getSeen = () => new Set(read<number[]>(KEY.seen, []))
export function markSeen(ids: number[]) {
  const s = getSeen()
  ids.forEach((x) => s.add(x))
  write(KEY.seen, [...s])
}
export const resetSeen = () => write(KEY.seen, [])

export interface HistoryEntry {
  c: number
  n: number
  /** ms timestamp; missing on scores saved by the old single-file version */
  at?: number
  mode?: string
}
export const getHistory = () => read<HistoryEntry[]>(KEY.history, [])
export function saveHistory(e: HistoryEntry) {
  write(KEY.history, [...getHistory(), e].slice(-30))
}

/** Questions answered wrong and not yet answered right since. */
export const getMistakes = () => read<number[]>(KEY.mistakes, [])
export function updateMistakes(wrong: number[], right: number[]) {
  const s = new Set(getMistakes())
  wrong.forEach((x) => s.add(x))
  right.forEach((x) => s.delete(x))
  write(KEY.mistakes, [...s])
}

/** Running correct/total per topic group across every test on this device. */
export type Mastery = Record<string, [number, number]>
export const getMastery = () => read<Mastery>(KEY.mastery, {})
export function updateMastery(rows: { group: string; c: number; n: number }[]) {
  const m = getMastery()
  for (const r of rows) {
    const [c, n] = m[r.group] ?? [0, 0]
    m[r.group] = [c + r.c, n + r.n]
  }
  write(KEY.mastery, m)
}

export function resetProgress() {
  Object.values(KEY).forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
}
