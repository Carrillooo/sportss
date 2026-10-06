/** React Bits · CountUp: animates a number into place, writing straight to the DOM node. */
import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export function CountUp({
  value,
  duration = 1.4,
  delay = 0,
  suffix = '',
  className,
}: {
  value: number
  duration?: number
  delay?: number
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce) {
      node.textContent = `${value}${suffix}`
      return
    }
    const c = animate(0, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (node.textContent = `${Math.round(v)}${suffix}`),
    })
    return () => c.stop()
  }, [value, duration, delay, suffix, reduce])
  return (
    <span ref={ref} className={cn('tabular', className)}>
      0{suffix}
    </span>
  )
}
