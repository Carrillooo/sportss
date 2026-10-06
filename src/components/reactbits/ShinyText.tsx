/** React Bits · ShinyText: a light sweep across muted text. */
import { cn } from '@/lib/utils'

export function ShinyText({ children, className, speed = 4 }: { children: React.ReactNode; className?: string; speed?: number }) {
  return (
    <span
      className={cn('animate-shine bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: 'linear-gradient(110deg, rgb(139 151 174 / .8) 35%, #fff 50%, rgb(139 151 174 / .8) 65%)',
        backgroundSize: '250% 100%',
        animationDuration: `${speed}s`,
      }}
    >
      {children}
    </span>
  )
}
