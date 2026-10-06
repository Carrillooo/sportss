import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffle<T>(a: readonly T[]): T[] {
  const out = a.slice()
  for (let k = out.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1))
    ;[out[k], out[j]] = [out[j], out[k]]
  }
  return out
}

export const pad = (n: number) => String(n).padStart(2, '0')

export function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}
