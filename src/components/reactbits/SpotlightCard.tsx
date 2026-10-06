/** React Bits · SpotlightCard: a radial light follows the pointer; CSS vars only, no re-renders. */
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  /** "r g b" */
  spotlightColor?: string
}

export function SpotlightCard({ spotlightColor = '200 255 77', className, children, onPointerMove, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current
        if (el) {
          const r = el.getBoundingClientRect()
          el.style.setProperty('--mx', `${e.clientX - r.left}px`)
          el.style.setProperty('--my', `${e.clientY - r.top}px`)
        }
        onPointerMove?.(e)
      }}
      className={cn('panel group/spot relative overflow-hidden', className)}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgb(${spotlightColor} / .12), transparent 60%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          padding: 1,
          background: `radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgb(${spotlightColor} / .6), transparent 60%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
