import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Brain, Check, Image as ImageIcon, LogOut, RotateCcw, Shuffle, Target, Timer, Type, Zap } from 'lucide-react'
import { BlurText, CountUp, GradientText, Magnet, ShinyText, SpotlightCard, StarBorder } from '@/components/reactbits'
import { allGroups, isPicture, SECONDS_PER_QUESTION, type Mode, type RawQuestion, type TestConfig } from '@/lib/quiz'
import { getHistory, getMastery, getMistakes, getSeen, resetProgress } from '@/lib/storage'
import { cn } from '@/lib/utils'

const fade = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
})

export function Home({ bank, onStart, onLock }: { bank: RawQuestion[]; onStart: (c: TestConfig) => void; onLock: () => void }) {
  const [exam, setExam] = useState(false)
  const [, refresh] = useState(0)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [topicSize, setTopicSize] = useState(20)

  const groups = useMemo(() => allGroups(bank), [bank])
  const seen = getSeen().size
  const history = getHistory()
  const mistakes = getMistakes().filter((i) => i < bank.length)
  const mastery = getMastery()
  const pics = bank.filter(isPicture).length
  const pct = (h: { c: number; n: number }) => Math.round((h.c / h.n) * 100)
  const last = history.at(-1)
  const recent = history.slice(-5)
  const avg = recent.length ? Math.round(recent.reduce((s, h) => s + pct(h), 0) / recent.length) : 0
  const masteryRows = Object.entries(mastery)
    .filter(([g]) => groups.some((x) => x.name === g))
    .map(([g, [c, n]]) => ({ g, c, n, p: c / n }))
    .sort((a, b) => a.p - b.p)

  const go = (mode: Mode, size: number, extra: Partial<TestConfig> = {}) => onStart({ mode, size, exam, ...extra })
  const pickedCount = groups.filter((g) => picked.includes(g.name)).reduce((s, g) => s + g.n, 0)

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-20 sm:px-6">
      <nav className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <span className="font-display font-semibold tracking-tight">SEHS<span className="text-muted">/sim</span></span>
        </div>
        <button onClick={onLock} className="focus-ring flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-panel-2 hover:text-fg">
          <LogOut className="h-4 w-4" /> Lock
        </button>
      </nav>

      <header className="mb-10">
        <motion.p {...fade(0)} className="mb-4 font-mono text-[11px] tracking-[.28em] text-cyan uppercase">
          IB SEHS · A.1.1.1 + B.1.1–B.1.3 · Paper 1 practice
        </motion.p>
        <h1 className="font-display text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.98] font-bold tracking-tight text-balance">
          <BlurText text="Nervous &" /> <GradientText>musculoskeletal</GradientText> <BlurText text="systems" delay={0.25} />
        </h1>
        <motion.p {...fade(2)} className="mt-5 max-w-xl text-lg text-muted">
          Every test pulls questions you haven't seen yet first, spread across every topic. Answer order is shuffled each time.
        </motion.p>
      </header>

      <motion.section {...fade(3)} className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions" value={bank.length} hint={`${pics} with pictures`} />
        <Stat label="Seen" value={Math.min(seen, bank.length)} hint={`${Math.round((Math.min(seen, bank.length) / bank.length) * 100)}% of the bank`} />
        <Stat label="Last score" value={last ? pct(last) : null} suffix="%" hint={last ? `${last.c}/${last.n}` : 'No tests yet'} />
        <Stat label="Average · last 5" value={recent.length ? avg : null} suffix="%" hint={recent.length ? <Spark values={recent.map(pct)} /> : 'No tests yet'} />
      </motion.section>

      <motion.div {...fade(4)} className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Start a test</h2>
        <button
          role="switch"
          aria-checked={exam}
          onClick={() => setExam((e) => !e)}
          className={cn(
            'focus-ring flex cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-2 text-sm transition',
            exam ? 'border-lime/50 bg-lime/10 text-fg' : 'border-line text-muted hover:text-fg',
          )}
        >
          <Timer className={cn('h-4 w-4', exam && 'text-lime')} />
          Exam conditions
          <span className={cn('relative h-5 w-9 rounded-full transition', exam ? 'bg-lime' : 'bg-line-strong')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-all', exam ? 'left-4.5' : 'left-0.5')} />
          </span>
        </button>
      </motion.div>
      <AnimatePresence>
        {exam && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="-mt-2 mb-5 overflow-hidden text-sm text-muted"
          >
            A countdown of {SECONDS_PER_QUESTION} s per question, and no feedback until the end — like the real paper.
          </motion.p>
        )}
      </AnimatePresence>

      <section className="grid gap-3 sm:grid-cols-6">
        <motion.div {...fade(5)} className="sm:col-span-4 sm:row-span-2">
          <SpotlightCard className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
            <div>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-lime/15 text-lime">
                <Shuffle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-3xl font-bold">Mixed test</h3>
              <p className="mt-2 max-w-md text-muted">50 questions across all topics, about 40% picture questions and 60% text. The best match for the real paper.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Magnet>
                <StarBorder onClick={() => go('mix', 50)}>
                  <Zap className="h-4.5 w-4.5 text-lime" /> Start · 50 questions
                </StarBorder>
              </Magnet>
              <button onClick={() => go('mix', 20)} className="focus-ring cursor-pointer rounded-2xl border border-line-strong px-5 py-3.5 font-display font-semibold transition hover:bg-panel-2">
                Quick · 20
              </button>
            </div>
          </SpotlightCard>
        </motion.div>
        <ModeCard i={6} className="sm:col-span-2" icon={<ImageIcon />} color="62 224 255" title="Pictures only" desc="50 labelled diagrams and photos" onClick={() => go('pic', 50)} />
        <ModeCard i={7} className="sm:col-span-2" icon={<Type />} color="139 123 255" title="No pictures" desc="50 text questions" onClick={() => go('text', 50)} />
        <ModeCard
          i={8}
          className="sm:col-span-3"
          icon={<RotateCcw />}
          color="251 113 133"
          title="Review mistakes"
          desc={mistakes.length ? `${mistakes.length} question${mistakes.length === 1 ? '' : 's'} you got wrong and haven't fixed yet` : 'Nothing to review — wrong answers will collect here'}
          disabled={!mistakes.length}
          badge={mistakes.length || undefined}
          onClick={() => go('mistakes', Math.min(mistakes.length, 50), { ids: mistakes })}
        />
        <ModeCard
          i={9}
          className="sm:col-span-3"
          icon={<Target />}
          color="251 191 36"
          title="Practise by topic"
          desc="Choose exactly which topics to drill"
          active={topicsOpen}
          onClick={() => setTopicsOpen((o) => !o)}
        />
      </section>

      <AnimatePresence>
        {topicsOpen && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="panel mt-3 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  <b className="text-fg">{picked.length}</b> topic{picked.length === 1 ? '' : 's'} · <b className="text-fg">{pickedCount}</b> questions available
                </p>
                <div className="flex gap-2 text-sm">
                  <button className="focus-ring cursor-pointer rounded-lg px-2 py-1 text-muted hover:text-fg" onClick={() => setPicked(groups.map((g) => g.name))}>All</button>
                  <button className="focus-ring cursor-pointer rounded-lg px-2 py-1 text-muted hover:text-fg" onClick={() => setPicked([])}>None</button>
                  {masteryRows.length > 0 && (
                    <button className="focus-ring cursor-pointer rounded-lg px-2 py-1 text-warn hover:text-fg" onClick={() => setPicked(masteryRows.slice(0, 3).map((r) => r.g))}>
                      My 3 weakest
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const on = picked.includes(g.name)
                  return (
                    <button
                      key={g.name}
                      aria-pressed={on}
                      onClick={() => setPicked((p) => (on ? p.filter((x) => x !== g.name) : [...p, g.name]))}
                      className={cn(
                        'focus-ring flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
                        on ? 'border-warn/60 bg-warn/12 text-fg' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5 text-warn" />}
                      {g.name.replace('Picture: ', '🖼 ')}
                      <span className="font-mono text-[11px] text-dim">{g.n}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex rounded-xl border border-line p-1" role="radiogroup" aria-label="Number of questions">
                  {[10, 20, 30, 50].map((n) => (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={topicSize === n}
                      onClick={() => setTopicSize(n)}
                      className={cn('focus-ring cursor-pointer rounded-lg px-3 py-1.5 font-mono text-sm transition', topicSize === n ? 'bg-panel-2 text-fg' : 'text-muted')}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <StarBorder color="#fbbf24" disabled={!picked.length} onClick={() => go('topics', Math.min(topicSize, pickedCount), { groups: picked })}>
                  Start · {Math.min(topicSize, pickedCount)} questions
                </StarBorder>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {masteryRows.length > 0 && (
        <motion.section {...fade(10)} className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <Brain className="h-5 w-5 text-cyan" /> Topic mastery
            </h2>
            <ShinyText className="hidden text-xs sm:inline">weakest first · all tests on this device</ShinyText>
          </div>
          <div className="panel grid gap-x-8 gap-y-3 p-5 sm:grid-cols-2 sm:p-6">
            {masteryRows.map((r, i) => (
              <div key={r.g}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="truncate">{r.g}</span>
                  <span className="font-mono text-muted tabular">
                    {r.c}/{r.n}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <motion.div
                    className={cn('h-full rounded-full', r.p < 0.6 ? 'bg-bad' : r.p < 0.8 ? 'bg-warn' : 'bg-ok')}
                    initial={{ width: 0 }}
                    animate={{ width: `${r.p * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {(seen > 0 || history.length > 0) && (
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              if (confirm('Reset all progress on this device? Seen questions, scores, mistakes and mastery will be cleared.')) {
                resetProgress()
                refresh((n) => n + 1)
              }
            }}
            className="focus-ring cursor-pointer rounded-lg px-3 py-2 text-sm text-dim transition hover:text-bad"
          >
            Reset progress on this device
          </button>
        </div>
      )}
    </main>
  )
}

function Stat({ label, value, suffix, hint }: { label: string; value: number | null; suffix?: string; hint: React.ReactNode }) {
  return (
    <div className="panel p-4 sm:p-5">
      <p className="text-xs font-medium tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold sm:text-4xl">
        {value === null ? <span className="text-dim">—</span> : <CountUp value={value} suffix={suffix} />}
      </p>
      <div className="mt-1 text-xs text-dim">{hint}</div>
    </div>
  )
}

function Spark({ values }: { values: number[] }) {
  return (
    <div className="flex h-4 items-end gap-1" aria-label={`Recent scores: ${values.join('%, ')}%`}>
      {values.map((v, i) => (
        <motion.span
          key={i}
          className={cn('w-2 rounded-sm', v >= 80 ? 'bg-ok' : v >= 60 ? 'bg-warn' : 'bg-bad')}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(12, v)}%` }}
          transition={{ delay: 0.5 + i * 0.08 }}
        />
      ))}
    </div>
  )
}

function ModeCard({
  i,
  icon,
  title,
  desc,
  color,
  onClick,
  className,
  disabled,
  badge,
  active,
}: {
  i: number
  icon: React.ReactNode
  title: string
  desc: string
  color: string
  onClick: () => void
  className?: string
  disabled?: boolean
  badge?: number
  active?: boolean
}) {
  return (
    <motion.div {...fade(i)} className={className}>
      <SpotlightCard spotlightColor={color} className={cn('h-full', disabled && 'opacity-55', active && 'border-line-strong')}>
        <button
          disabled={disabled}
          onClick={onClick}
          aria-expanded={active}
          className="focus-ring flex h-full w-full cursor-pointer items-start gap-4 rounded-[20px] p-5 text-left disabled:cursor-not-allowed"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl [&>svg]:h-5 [&>svg]:w-5" style={{ background: `rgb(${color} / .14)`, color: `rgb(${color})` }}>
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-display text-lg font-semibold">
              {title}
              {badge !== undefined && (
                <span className="rounded-full px-2 py-0.5 font-mono text-[11px]" style={{ background: `rgb(${color} / .18)`, color: `rgb(${color})` }}>
                  {badge}
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-sm text-muted">{desc}</span>
          </span>
        </button>
      </SpotlightCard>
    </motion.div>
  )
}
