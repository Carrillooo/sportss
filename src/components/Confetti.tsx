import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

const COLORS = ['#c8ff4d', '#3ee0ff', '#8b7bff', '#fbbf24', '#fb7185']

/** One celebratory burst for strong scores. */
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || reduce) return
    const w = (canvas.width = window.innerWidth)
    const h = (canvas.height = window.innerHeight)
    const bits = Array.from({ length: 160 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      s: Math.random() * 6 + 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const fade = Math.max(0, 1 - (t - start) / 3200)
      for (const b of bits) {
        b.vy += 0.32
        b.vx *= 0.99
        b.x += b.vx
        b.y += b.vy
        b.r += b.vr
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(b.x, b.y)
        ctx.rotate(b.r)
        ctx.fillStyle = b.c
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2)
        ctx.restore()
      }
      if (fade > 0) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce])
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50" />
}
