/** React Bits · GradientText: animated multi-stop gradient fill. */
import { cn } from '@/lib/utils'

export function GradientText({
  children,
  className,
  colors = ['#c8ff4d', '#3ee0ff', '#8b7bff', '#c8ff4d'],
  speed = 8,
}: {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}) {
  return (
    <span
      className={cn('animate-shine bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '300% 100%',
        animationDuration: `${speed}s`,
      }}
    >
      {children}
    </span>
  )
}
