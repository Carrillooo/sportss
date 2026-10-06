/** React Bits · ClickSpark: short radial sparks wherever the user clicks inside the wrapper. */
import { useCallback, useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface Spark {
  x: number
  y: number
  angle: number
  start: number
}

export function ClickSpark({ children, color = '#c8ff4d', count = 9, radius = 22 }: { children: React.ReactNode; color?: string; count?: number; radius?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparks = useRef<Spark[]>([])
  const raf = useRef(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  const draw = useCallback(
    (t: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      sparks.current = sparks.current.filter((s) => {
        const p = (t - s.start) / 420
        if (p >= 1) return false
        const e = p * (2 - p)
        const d = e * radius
        const len = 9 * (1 - e)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(s.x + d * Math.cos(s.angle), s.y + d * Math.sin(s.angle))
        ctx.lineTo(s.x + (d + len) * Math.cos(s.angle), s.y + (d + len) * Math.sin(s.angle))
        ctx.stroke()
        return true
      })
      if (sparks.current.length) raf.current = requestAnimationFrame(draw)
    },
    [color, radius],
  )

  const onClick = (e: React.MouseEvent) => {
    if (reduce) return
    const now = performance.now()
    for (let i = 0; i < count; i++) sparks.current.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / count, start: now })
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(draw)
  }

  return (
    <div onClick={onClick} className="contents">
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-50" />
      {children}
    </div>
  )
}
