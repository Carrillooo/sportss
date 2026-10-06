import { ShinyText } from '@/components/reactbits'

export function Loader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-line" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-lime" />
        </div>
        <ShinyText className="font-mono text-xs tracking-[.3em] uppercase">Loading</ShinyText>
      </div>
    </div>
  )
}
