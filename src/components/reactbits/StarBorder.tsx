/** React Bits · StarBorder: a button whose border has a travelling light. */
import { cn } from '@/lib/utils'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
}

export function StarBorder({ color = '#c8ff4d', className, children, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        'focus-ring group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl p-px font-display font-semibold transition-transform active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{
        background: `conic-gradient(from var(--border-angle), transparent 60%, ${color} 80%, transparent 95%), var(--color-line-strong)`,
      }}
    >
      <span aria-hidden className="absolute inset-0 animate-border-spin rounded-2xl" style={{ background: 'inherit' }} />
      <span className="relative z-10 flex w-full items-center justify-center gap-2 rounded-[15px] bg-panel px-6 py-3.5 text-fg transition-colors group-hover:bg-panel-2">
        {children}
      </span>
    </button>
  )
}
