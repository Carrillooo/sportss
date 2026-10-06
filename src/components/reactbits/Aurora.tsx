/** React Bits · Aurora (CSS version): slow-moving blurred colour fields behind the page. */
import { cn } from '@/lib/utils'

const BLOBS = [
  { c: '200 255 77', cls: '-left-[20%] -top-[30%] h-[80vh] w-[60vw]', a: 'aurora-a 22s' , o: 0.18 },
  { c: '62 224 255', cls: '-right-[15%] -top-[20%] h-[70vh] w-[55vw]', a: 'aurora-b 26s', o: 0.2 },
  { c: '139 123 255', cls: 'left-[20%] top-[45%] h-[70vh] w-[50vw]', a: 'aurora-a 30s reverse', o: 0.16 },
]

export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}>
      <style>{`
        @keyframes aurora-a{0%,100%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(8%,6%) scale(1.15)}}
        @keyframes aurora-b{0%,100%{transform:translate(6%,0) scale(1.1)}50%{transform:translate(-8%,8%) scale(.92)}}
      `}</style>
      {BLOBS.map((b) => (
        <div
          key={b.c}
          className={cn('absolute rounded-full blur-[110px]', b.cls)}
          style={{ background: `rgb(${b.c} / ${b.o * intensity})`, animation: `${b.a} ease-in-out infinite` }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-bg)_100%)]" />
    </div>
  )
}
