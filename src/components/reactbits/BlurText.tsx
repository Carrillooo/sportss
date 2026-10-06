/** React Bits · BlurText: words fade in from blur with a stagger. */
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.08,
  as = 'span',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'p' | 'span'
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  if (reduce) {
    const Plain = as
    return <Plain className={className}>{text}</Plain>
  }
  const words = text.split(' ')
  return (
    <Tag className={cn(className)} aria-label={text}>
      {words.map((wd, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 14, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
        >
          {wd}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  )
}
