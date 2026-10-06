import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Flame, Maximize2, Timer, X } from 'lucide-react'
import { StarBorder } from '@/components/reactbits'
import { SECONDS_PER_QUESTION, type AnswerRecord, type Question, type TestConfig } from '@/lib/quiz'
import { cn, formatTime } from '@/lib/utils'

const L = 'ABCD'

export function Quiz({
  cfg,
  test,
  onDone,
  onExit,
}: {
  cfg: TestConfig
  test: Question[]
  onDone: (answers: AnswerRecord[], seconds: number) => void
  onExit: () => void
}) {
  const [i, setI] = useState(0)
  const [picks, setPicks] = useState<(number | null)[]>(() => test.map(() => null))
  /** practice mode: the current question has been answered and feedback is showing */
  const [locked, setLocked] = useState(false)
  const [streak, setStreak] = useState(0)
  const [zoom, setZoom] = useState(false)
  const started = useRef(Date.now())
  const limit = test.length * SECONDS_PER_QUESTION
  const [left, setLeft] = useState(limit)

  const x = test[i]
  const picked = picks[i]
  const correct = picks.filter((p, k) => p !== null && p === test[k].answer).length
  const answered = picks.filter((p) => p !== null).length

  const finish = useCallback(
    (all: boolean, current = picks) => {
      const n = all ? test.length : current.filter((p) => p !== null).length
      const answers = test.slice(0, n).map((q, k) => ({ q, picked: current[k] }))
      onDone(answers, Math.round((Date.now() - started.current) / 1000))
    },
    [picks, test, onDone],
  )

  // Exam countdown
  useEffect(() => {
    if (!cfg.exam) return
    const id = setInterval(() => {
      const l = limit - (Date.now() - started.current) / 1000
      setLeft(l)
      if (l <= 0) {
        clearInterval(id)
        finish(true)
      }
    }, 250)
    return () => clearInterval(id)
  }, [cfg.exam, limit, finish])

  // Preload the next figure
  useEffect(() => {
    const next = test[i + 1]?.img
    if (next) new Image().src = `/img/${next}.jpg`
  }, [i, test])

  const choose = useCallback(
    (k: number) => {
      if (k >= x.options.length || (locked && !cfg.exam)) return
      setPicks((p) => p.map((v, n) => (n === i ? k : v)))
      if (!cfg.exam) {
        setLocked(true)
        setStreak((s) => (k === x.answer ? s + 1 : 0))
      }
    },
    [x, i, locked, cfg.exam],
  )

  const canAdvance = picked !== null || cfg.exam
  const next = useCallback(() => {
    if (!canAdvance) return
    if (i + 1 >= test.length) return finish(true)
    setI(i + 1)
    setLocked(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [canAdvance, i, test.length, finish])

  const prev = () => cfg.exam && i > 0 && setI(i - 1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom) {
        if (e.key === 'Escape') setZoom(false)
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement)?.tagName === 'INPUT') return
      const key = e.key.toLowerCase()
      const n = '1234'.indexOf(key) >= 0 ? '1234'.indexOf(key) : 'abcd'.indexOf(key)
      if (n >= 0) {
        e.preventDefault()
        choose(n)
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        if (canAdvance) {
          e.preventDefault()
          next()
        }
      } else if (e.key === 'ArrowLeft' && cfg.exam && i > 0) {
        setI(i - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choose, next, canAdvance, zoom, cfg.exam, i])

  const end = () => {
    const msg = cfg.exam
      ? `Submit now? ${test.length - answered} unanswered question${test.length - answered === 1 ? '' : 's'} will count as wrong.`
      : 'End the test and see results for the questions answered so far?'
    if (confirm(msg)) cfg.exam ? finish(true) : answered ? finish(false) : onExit()
  }

  const showFeedback = !cfg.exam && locked
  const ok = picked === x.answer
  const lowTime = cfg.exam && left < 60

  return (
    <main className="mx-auto max-w-3xl px-4 pt-5 pb-20 sm:px-6">
      {/* Progress header */}
      <div className="sticky top-3 z-20 mb-6 rounded-2xl border border-line bg-bg/70 px-3 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={end} aria-label="End test" className="focus-ring grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-line text-muted transition hover:text-fg">
            <X className="h-4.5 w-4.5" />
          </button>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-lime via-cyan to-violet"
                animate={{ width: `${((i + (picked !== null ? 1 : 0)) / test.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
          <span className="font-mono text-sm text-muted tabular">
            {i + 1}/{test.length}
          </span>
          {cfg.exam ? (
            <span className={cn('flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-sm tabular', lowTime ? 'bg-bad/15 text-bad' : 'text-fg')}>
              <Timer className="h-4 w-4" /> {formatTime(left)}
            </span>
          ) : (
            <span className="flex items-center gap-2 font-mono text-sm tabular">
              <span className="text-ok">{correct}</span>
              <AnimatePresence>
                {streak >= 3 && (
                  <motion.span
                    key={streak}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="flex items-center gap-0.5 text-warn"
                    title={`${streak} in a row`}
                  >
                    <Flame className="h-4 w-4" />
                    {streak}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={i}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="panel p-5 sm:p-7"
        >
          {x.img && (
            <button
              onClick={() => setZoom(true)}
              className="focus-ring group relative mb-6 flex w-full cursor-zoom-in justify-center overflow-hidden rounded-2xl bg-white p-2"
              aria-label="Enlarge figure"
            >
              <img src={`/img/${x.img}.jpg`} alt={`Figure for question ${i + 1}`} className="block max-h-[420px] w-auto max-w-full object-contain" />
              <span className="absolute right-2 bottom-2 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
          )}

          <p className="mb-2 font-mono text-[11px] tracking-[.18em] text-cyan uppercase">
            Q{i + 1} · {x.group}
          </p>
          <h2 className="mb-6 text-lg leading-relaxed font-medium whitespace-pre-line sm:text-xl">{x.q}</h2>

          <div className="grid gap-2.5" role="radiogroup" aria-label="Answers">
            {x.options.map((o, k) => {
              const isPicked = picked === k
              const state = showFeedback ? (k === x.answer ? 'right' : isPicked ? 'wrong' : 'idle') : isPicked ? 'picked' : 'idle'
              return (
                <motion.button
                  key={k}
                  role="radio"
                  aria-checked={isPicked}
                  disabled={showFeedback}
                  onClick={() => choose(k)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={state === 'wrong' ? { opacity: 1, y: 0, x: [0, -6, 6, -3, 0] } : { opacity: 1, y: 0 }}
                  transition={{ delay: state === 'idle' ? 0.05 + k * 0.05 : 0, duration: 0.3 }}
                  whileTap={showFeedback ? undefined : { scale: 0.985 }}
                  className={cn(
                    'focus-ring group flex w-full cursor-pointer items-start gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-colors disabled:cursor-default',
                    state === 'idle' && 'border-line bg-bg/40 hover:border-line-strong hover:bg-panel-2',
                    state === 'picked' && 'border-cyan/70 bg-cyan/10',
                    state === 'right' && 'border-ok/70 bg-ok/12',
                    state === 'wrong' && 'border-bad/70 bg-bad/12',
                    showFeedback && state === 'idle' && 'opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-lg border font-mono text-sm transition-colors',
                      state === 'idle' && 'border-line-strong text-muted group-hover:text-fg',
                      state === 'picked' && 'border-cyan bg-cyan text-bg',
                      state === 'right' && 'border-ok bg-ok text-bg',
                      state === 'wrong' && 'border-bad bg-bad text-bg',
                    )}
                  >
                    {state === 'right' ? <Check className="h-4 w-4" strokeWidth={3} /> : state === 'wrong' ? <X className="h-4 w-4" strokeWidth={3} /> : L[k]}
                  </span>
                  <span className="pt-0.5">{o}</span>
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className={cn('mt-5 rounded-2xl border p-4', ok ? 'border-ok/30 bg-ok/8' : 'border-bad/30 bg-bad/8')}>
                  <p className={cn('mb-1 font-display font-semibold', ok ? 'text-ok' : 'text-bad')}>
                    {ok ? pickPraise(streak) : `Not quite — the answer is ${L[x.answer]}.`}
                  </p>
                  <p className="text-muted">{x.explain}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="hidden text-xs text-dim sm:block">
              Keys: <Kbd>1</Kbd>–<Kbd>4</Kbd> or <Kbd>A</Kbd>–<Kbd>D</Kbd> to answer · <Kbd>Enter</Kbd> next{cfg.exam && <> · <Kbd>←</Kbd> back</>}
            </span>
            <div className="ml-auto flex gap-2">
              {cfg.exam && i > 0 && (
                <button onClick={prev} className="focus-ring cursor-pointer rounded-2xl border border-line-strong px-4 py-3 text-sm font-semibold transition hover:bg-panel-2">
                  Back
                </button>
              )}
              <StarBorder onClick={next} disabled={!canAdvance} color={cfg.exam ? '#3ee0ff' : ok ? '#34d399' : '#c8ff4d'}>
                {i + 1 < test.length ? (cfg.exam && picked === null ? 'Skip' : 'Next') : cfg.exam ? 'Submit' : 'See results'} <ArrowRight className="h-4.5 w-4.5" />
              </StarBorder>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <AnimatePresence>
        {zoom && x.img && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 z-40 grid cursor-zoom-out place-items-center bg-black/85 p-4 backdrop-blur-sm"
            role="dialog"
            aria-label="Enlarged figure"
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={`/img/${x.img}.jpg`}
              alt={`Figure for question ${i + 1}, enlarged`}
              className="max-h-[92dvh] max-w-full rounded-xl bg-white object-contain p-2"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-line-strong bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{children}</kbd>
}

function pickPraise(streak: number) {
  if (streak >= 10) return `Correct · ${streak} in a row. Unstoppable.`
  if (streak >= 5) return `Correct · ${streak} in a row!`
  if (streak >= 3) return `Correct · ${streak} in a row.`
  return 'Correct.'
}
