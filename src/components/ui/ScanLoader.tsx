import { cn } from '../../lib/utils'

interface ScanLoaderProps {
  label?: string
  className?: string
}

export function ScanLoader({ label = 'Analyzing…', className }: ScanLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-10', className)}>
      <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-raised">
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-accent/40 to-transparent animate-scan" />
        <div className="absolute inset-0 bg-grid-faint" />
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <p className="font-mono text-sm text-ink-secondary">{label}</p>
      </div>
    </div>
  )
}
