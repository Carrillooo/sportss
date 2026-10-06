/** React Bits · DecryptedText: characters scramble, then settle into the real text. */
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/'

export function DecryptedText({ text, className, speed = 38 }: { text: string; className?: string; speed?: number }) {
  const reduce = useReducedMotion()
  const [out, setOut] = useState(reduce ? text : '')
  useEffect(() => {
    if (reduce) return setOut(text)
    let frame = 0
    const id = setInterval(() => {
      frame++
      const done = Math.floor(frame / 2)
      setOut(
        Array.from(text)
          .map((ch, i) => (i < done || ch === ' ' ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join(''),
      )
      if (done >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, reduce])
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  )
}
