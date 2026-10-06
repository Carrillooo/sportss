import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Aurora, ClickSpark, Particles } from '@/components/reactbits'
import { fetchBank, logout } from '@/lib/api'
import { buildTest, type AnswerRecord, type Question, type RawQuestion, type TestConfig } from '@/lib/quiz'
import { getMistakes, markSeen } from '@/lib/storage'
import { Gate } from '@/screens/Gate'
import { Home } from '@/screens/Home'
import { Quiz } from '@/screens/Quiz'
import { Results } from '@/screens/Results'
import { Loader } from '@/screens/Loader'

type Phase =
  | { name: 'loading' }
  | { name: 'gate'; notConfigured?: boolean; error?: string }
  | { name: 'home' }
  | { name: 'quiz'; cfg: TestConfig; test: Question[] }
  | { name: 'results'; cfg: TestConfig; answers: AnswerRecord[]; seconds: number }

const page = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(6px)' },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
}

export function App() {
  const [bank, setBank] = useState<RawQuestion[]>([])
  const [phase, setPhase] = useState<Phase>({ name: 'loading' })

  const load = useCallback(async () => {
    const r = await fetchBank()
    if (r.status === 'ok') {
      setBank(r.bank)
      setPhase({ name: 'home' })
    } else if (r.status === 'not-configured') setPhase({ name: 'gate', notConfigured: true })
    else if (r.status === 'error') setPhase({ name: 'gate', error: r.message })
    else setPhase({ name: 'gate' })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const start = (cfg: TestConfig) => {
    const test = buildTest(bank, cfg)
    if (!test.length) return
    markSeen(test.map((q) => q.id))
    setPhase({ name: 'quiz', cfg, test })
    window.scrollTo({ top: 0 })
  }

  const key = phase.name === 'quiz' ? `quiz-${phase.test[0]?.id}-${phase.test.length}` : phase.name

  return (
    <ClickSpark>
      <div className="noise relative min-h-dvh overflow-x-hidden">
        <Aurora intensity={phase.name === 'quiz' ? 0.55 : 1} />
        <Particles count={phase.name === 'quiz' ? 30 : 70} />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={key} {...page}>
              {phase.name === 'loading' && <Loader />}
              {phase.name === 'gate' && <Gate notConfigured={phase.notConfigured} error={phase.error} onUnlocked={load} />}
              {phase.name === 'home' && (
                <Home
                  bank={bank}
                  onStart={start}
                  onLock={async () => {
                    await logout()
                    setBank([])
                    setPhase({ name: 'gate' })
                  }}
                />
              )}
              {phase.name === 'quiz' && (
                <Quiz
                  cfg={phase.cfg}
                  test={phase.test}
                  onDone={(answers, seconds) => setPhase({ name: 'results', cfg: phase.cfg, answers, seconds })}
                  onExit={() => setPhase({ name: 'home' })}
                />
              )}
              {phase.name === 'results' && (
                <Results
                  cfg={phase.cfg}
                  answers={phase.answers}
                  seconds={phase.seconds}
                  onAgain={() => {
                    const ids = getMistakes()
                    start(phase.cfg.mode === 'mistakes' ? { ...phase.cfg, ids, size: Math.min(ids.length, 50) } : phase.cfg)
                  }}
                  onRetryMissed={(ids) => start({ mode: 'mistakes', size: ids.length, exam: false, ids })}
                  onHome={() => setPhase({ name: 'home' })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ClickSpark>
  )
}
