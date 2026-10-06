/** React Bits · Particles (canvas 2D): drifting dots that gently react to the pointer. */
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export function Particles({ className, count = 70, color = '200 255 77' }: { className?: string; count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || reduce) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const mouse = { x: -9999, y: -9999 }
    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
      a: Math.random() * 0.5 + 0.2,
    }))
    let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 14000) {
          p.vx += dx / 9000
          p.vy += dy / 9000
        }
        p.vx *= 0.985
        p.vy *= 0.985
        p.x = (p.x + p.vx + 0.05 + w) % w
        p.y = (p.y + p.vy - 0.08 + h) % h
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${color} / ${p.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
    }
  }, [count, color, reduce])

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none fixed inset-0 h-full w-full', className)} />
}
