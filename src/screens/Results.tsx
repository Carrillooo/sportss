import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Clock, Home as HomeIcon, RotateCcw, X } from 'lucide-react'
import { BlurText, CountUp, GradientText, SpotlightCard, StarBorder } from '@/components/reactbits'
import { Confetti } from '@/components/Confetti'
import { tallyByGroup, type AnswerRecord, type TestConfig } from '@/lib/quiz'
import { saveHistory, updateMastery, updateMistakes } from '@/lib/storage'
import { cn, formatTime } from '@/lib/utils'

const L = 'ABCD'
const TONE = {
  bad: { text: 'text-bad', bg: 'bg-bad', rgb: '251 113 133' },
  warn: { text: 'text-warn', bg: 'bg-warn', rgb: '251 191 36' },
  ok: { text: 'text-ok', bg: 'bg-ok', rgb: '52 211 153' },
}

export function Results({
  cfg,
  answers,
  seconds,
  onAgain,
  onRetryMissed,
  onHome,
}: {
  cfg: TestConfig
  answers: AnswerRecord[]
  seconds: number
  onAgain: () => void
  onRetryMissed: (ids: number[]) => void
  onHome: () => void
}) {
  const n = answers.length
  const correct = answers.filter((a) => a.picked === a.q.answer).length
  const pct = n ? Math.round((correct / n) * 100) : 0
  const missed = answers.filter((a) => a.picked !== a.q.answer)
  const rows = useMemo(() => tallyByGroup(answers), [answers])

  // Persist once (StrictMode runs effects twice in dev)
  const saved = useRef(false)
  useEffect(() => {
    if (saved.current || !n) return
    saved.current = true
    saveHistory({ c: correct, n, at: Date.now(), mode: cfg.mode })
    updateMastery(rows)
    updateMistakes(
      missed.map((a) => a.q.id),
      answers.filter((a) => a.picked === a.q.answer).map((a) => a.q.id),
    )
  }, [n, correct, cfg.mode, rows, missed, answers])

  const verdict =
    pct >= 80 ? 'Strong. Check the few misses, then rest.' : pct >= 60 ? 'Good base. Drill your weakest topics below, then take another test.' : 'Go over the topics in red, then take another test.'

  if (!n) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="text-center">
          <p className="mb-4 text-muted">No questions were answered.</p>
          <StarBorder onClick={onHome}>Back to menu</StarBorder>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6">
      {pct >= 80 && <Confetti />}
      <section className="mb-10 flex flex-col items-center text-center">
        <p className="mb-6 font-mono text-[11px] tracking-[.28em] text-cyan uppercase">Results{cfg.exam ? ' · exam conditions' : ''}</p>
        <ScoreRing pct={pct} />
        <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
          <CountUp value={correct} /> <span className="text-muted">/ {n}</span>
        </h1>
        <BlurText as="p" text={verdict} className="mt-3 max-w-md text-muted" delay={0.6} />
        <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-dim">
          <Clock className="h-3.5 w-3.5" /> {formatTime(seconds)} · {Math.round(seconds / n)} s per question
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <StarBorder onClick={onAgain}>
            Next test (same type) <ArrowRight className="h-4.5 w-4.5" />
          </StarBorder>
          {missed.length > 0 && (
            <button
              onClick={() => onRetryMissed(missed.map((a) => a.q.id))}
              className="focus-ring flex cursor-pointer items-center gap-2 rounded-2xl border border-bad/40 px-5 py-3.5 font-display font-semibold text-bad transition hover:bg-bad/10"
            >
              <RotateCcw className="h-4.5 w-4.5" /> Retry the {missed.length} missed
            </button>
          )}
          <button onClick={onHome} className="focus-ring flex cursor-pointer items-center gap-2 rounded-2xl border border-line-strong px-5 py-3.5 font-display font-semibold transition hover:bg-panel-2">
            <HomeIcon className="h-4.5 w-4.5" /> Menu
          </button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-semibold">By topic <span className="text-sm font-normal text-muted">· weakest first</span></h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {rows.map((r, i) => {
            const p = r.c / r.n
            const tone = TONE[p < 0.6 ? 'bad' : p < 0.8 ? 'warn' : 'ok']
            return (
              <motion.div key={r.group} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.04 }}>
                <SpotlightCard spotlightColor={tone.rgb} className="rounded-2xl p-4">
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="truncate">{r.group}</span>
                    <span className={cn('font-mono tabular', tone.text)}>
                      {r.c}/{r.n}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line">
                    <motion.div
                      className={cn('h-full rounded-full', tone.bg)}
                      initial={{ width: 0 }}
                      animate={{ width: `${p * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.04 }}
                    />
                  </div>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">
          {missed.length ? (
            <>
              Questions you missed <span className="text-sm font-normal text-muted">· {missed.length}</span>
            </>
          ) : (
            <GradientText>No mistakes. Full marks.</GradientText>
          )}
        </h2>
        <ol className="grid gap-3">
          {missed.map((a, i) => (
            <motion.li key={a.q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + Math.min(i, 12) * 0.04 }} className="panel rounded-2xl p-5">
              <div className="flex gap-4">
                {a.q.img && <img src={`/img/${a.q.img}.jpg`} alt="" loading="lazy" className="hidden h-24 w-24 shrink-0 rounded-xl bg-white object-contain p-1 sm:block" />}
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[11px] tracking-[.16em] text-cyan uppercase">{a.q.group}</p>
                  <p className="mb-3 whitespace-pre-line">{a.q.q}</p>
                  {a.picked !== null ? (
                    <p className="flex items-start gap-2 text-sm text-bad">
                      <X className="mt-0.5 h-4 w-4 shrink-0" /> <span>{L[a.picked]}) {a.q.options[a.picked]}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-dim">Not answered</p>
                  )}
                  <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-ok">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" /> <span>{L[a.q.answer]}) {a.q.options[a.q.answer]}</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">{a.q.explain}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>
    </main>
  )
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 70
  const c = 2 * Math.PI * r
  const color = pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#fb7185'
  return (
    <div className="relative h-44 w-44">
      <div className="absolute inset-4 rounded-full blur-2xl" style={{ background: `${color}33` }} />
      <svg viewBox="0 0 160 160" className="relative h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgb(148 163 184 / .14)" strokeWidth="10" />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-4xl font-bold">
          <CountUp value={pct} suffix="%" delay={0.2} />
        </span>
      </div>
    </div>
  )
}
