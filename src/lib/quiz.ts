import { shuffle } from './utils'
import { getSeen } from './storage'

/** [topic, image | null, question, options, correct index, explanation, 1 = keep option order] */
export type RawQuestion = [string, string | null, string, string[], number, string, 1?]

export interface Question {
  id: number
  topic: string
  group: string
  img: string | null
  q: string
  options: string[]
  answer: number
  explain: string
}

export type Mode = 'mix' | 'pic' | 'text' | 'topics' | 'mistakes'

export interface TestConfig {
  mode: Mode
  size: number
  /** Exam conditions: countdown, no feedback until the end */
  exam: boolean
  groups?: string[]
  ids?: number[]
}

export const SECONDS_PER_QUESTION = 72

const GROUP_ALIASES: Record<string, string> = {
  'Divisions of the nervous system': 'Nervous system divisions',
  'Connective tissue and joints': 'Joints and connective tissue',
  Joints: 'Joints and connective tissue',
  'Agonist and antagonist (scenarios)': 'Agonist and antagonist',
}

export const groupOf = (topic: string) => GROUP_ALIASES[topic] ?? topic
export const isPicture = (q: RawQuestion) => !!q[1]

export function allGroups(bank: RawQuestion[]) {
  const count = new Map<string, number>()
  for (const q of bank) count.set(groupOf(q[0]), (count.get(groupOf(q[0])) ?? 0) + 1)
  return [...count.entries()]
    .map(([name, n]) => ({ name, n, picture: name.startsWith('Picture:') }))
    .sort((a, b) => Number(a.picture) - Number(b.picture) || a.name.localeCompare(b.name))
}

/** Round-robin across topics so a test covers everything; unseen questions come first. */
function draw(bank: RawQuestion[], filter: (idx: number) => boolean, n: number) {
  const seen = getSeen()
  const by = new Map<string, number[]>()
  bank.forEach((q, idx) => {
    if (!filter(idx)) return
    const g = groupOf(q[0])
    by.set(g, [...(by.get(g) ?? []), idx])
  })
  // pop() takes from the end, so unseen questions go last
  const pools = shuffle([...by.values()]).map((ids) => {
    const p = shuffle(ids)
    return [...p.filter((x) => seen.has(x)), ...p.filter((x) => !seen.has(x))]
  })
  const out: number[] = []
  while (out.length < n && pools.some((p) => p.length)) {
    for (const p of pools) {
      if (out.length >= n) break
      const x = p.pop()
      if (x !== undefined) out.push(x)
    }
  }
  return out
}

export function toQuestion(bank: RawQuestion[], id: number): Question {
  const [topic, img, q, options, answer, explain, fixed] = bank[id]
  const order = fixed ? options.map((_, k) => k) : shuffle(options.map((_, k) => k))
  return {
    id,
    topic,
    group: groupOf(topic),
    img,
    q,
    options: order.map((k) => options[k]),
    answer: order.indexOf(answer),
    explain,
  }
}

export function buildTest(bank: RawQuestion[], cfg: TestConfig): Question[] {
  const pic = (i: number) => isPicture(bank[i])
  let ids: number[]
  switch (cfg.mode) {
    case 'pic':
      ids = draw(bank, pic, cfg.size)
      break
    case 'text':
      ids = draw(bank, (i) => !pic(i), cfg.size)
      break
    case 'topics': {
      const set = new Set(cfg.groups ?? [])
      ids = draw(bank, (i) => set.has(groupOf(bank[i][0])), cfg.size)
      break
    }
    case 'mistakes':
      ids = shuffle((cfg.ids ?? []).filter((i) => i < bank.length)).slice(0, cfg.size)
      break
    default: {
      const np = Math.round(cfg.size * 0.4)
      ids = [...draw(bank, pic, np), ...draw(bank, (i) => !pic(i), cfg.size - np)]
    }
  }
  return shuffle(ids).map((id) => toQuestion(bank, id))
}

export interface AnswerRecord {
  q: Question
  picked: number | null
}

export function tallyByGroup(answers: AnswerRecord[]) {
  const t = new Map<string, { c: number; n: number }>()
  for (const a of answers) {
    const row = t.get(a.q.group) ?? { c: 0, n: 0 }
    row.n++
    if (a.picked === a.q.answer) row.c++
    t.set(a.q.group, row)
  }
  return [...t.entries()].map(([group, v]) => ({ group, ...v })).sort((a, b) => a.c / a.n - b.c / b.n)
}
