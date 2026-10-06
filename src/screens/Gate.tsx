import { useRef, useState } from 'react'
import { motion, useAnimate } from 'motion/react'
import { ArrowRight, Eye, EyeOff, Lock, LoaderCircle } from 'lucide-react'
import { BlurText, DecryptedText, GradientText, StarBorder } from '@/components/reactbits'
import { login } from '@/lib/api'
import { cn } from '@/lib/utils'

export function Gate({ notConfigured, error, onUnlocked }: { notConfigured?: boolean; error?: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(error ?? null)
  const [scope, animate] = useAnimate<HTMLFormElement>()
  const input = useRef<HTMLInputElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pw || busy) return
    setBusy(true)
    setMsg(null)
    const r = await login(pw)
    setBusy(false)
    if (r === 'ok') return onUnlocked()
    if (scope.current) animate(scope.current, { x: [0, -12, 11, -8, 6, -3, 0] }, { duration: 0.45 })
    setMsg(
      r === 'wrong'
        ? 'Wrong password. Try again.'
        : r === 'not-configured'
          ? 'No password is set on the server yet.'
          : 'Could not reach the server. Check your connection.',
    )
    setPw('')
    input.current?.focus()
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          className="relative mx-auto mb-8 grid h-20 w-20 place-items-center"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lime/40 via-cyan/30 to-violet/40 blur-xl" />
          <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-line-strong bg-panel">
            <Lock className="h-8 w-8 text-lime" strokeWidth={2.2} />
          </div>
        </motion.div>

        <div className="mb-8 text-center">
          <p className="mb-3 font-mono text-[11px] tracking-[.32em] text-cyan uppercase">
            <DecryptedText text="IB SEHS · RESTRICTED ACCESS" />
          </p>
          <h1 className="font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            <BlurText text="Exam" /> <GradientText>Simulator</GradientText>
          </h1>
          <p className="mt-3 text-muted">Enter the password to start practising.</p>
        </div>

        <motion.form
          ref={scope}
          onSubmit={submit}
          className="panel p-5 sm:p-6"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {notConfigured ? (
            <div className="space-y-2 text-sm text-muted">
              <p className="font-semibold text-warn">The password has not been set up yet.</p>
              <p>
                In Vercel open <b className="text-fg">Settings → Environment Variables</b>, add{' '}
                <code className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-lime">SITE_PASSWORD</code> and redeploy.
              </p>
            </div>
          ) : (
            <>
              <label htmlFor="pw" className="mb-2 block text-xs font-medium tracking-wider text-muted uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  ref={input}
                  id="pw"
                  type={show ? 'text' : 'password'}
                  autoFocus
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-13 w-full rounded-xl border border-line-strong bg-bg/70 pr-12 pl-4 font-mono text-lg tracking-widest text-fg outline-none transition placeholder:text-dim focus:border-lime/70 focus:ring-4 focus:ring-lime/15"
                  placeholder="••••••••"
                  aria-invalid={!!msg}
                  aria-describedby={msg ? 'pw-msg' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="focus-ring absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted hover:text-fg"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              <p id="pw-msg" role="alert" className={cn('min-h-6 pt-2 text-sm text-bad', !msg && 'invisible')}>
                {msg ?? '·'}
              </p>
              <StarBorder type="submit" disabled={!pw || busy} className="mt-1 w-full">
                {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Enter <ArrowRight className="h-4.5 w-4.5" /></>}
              </StarBorder>
            </>
          )}
        </motion.form>
        <p className="mt-6 text-center text-xs text-dim">You stay signed in on this device for 30 days.</p>
      </div>
    </main>
  )
}
