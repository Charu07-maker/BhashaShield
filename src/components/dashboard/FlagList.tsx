import { CheckCircle2 } from 'lucide-react'
import type { RedFlag } from '../../lib/analysis'
import type { VerdictStatus } from '../ui/StatusBadge'
import { cn } from '../../lib/utils'

const DOT_CLASS: Record<VerdictStatus, string> = {
  safe: 'bg-safe',
  suspicious: 'bg-warning',
  dangerous: 'bg-danger',
}

export function FlagList({ flags, status }: { flags: RedFlag[]; status: VerdictStatus }) {
  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-border bg-raised px-4 py-3.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" strokeWidth={2} />
        <p className="text-sm text-ink-secondary">No strong scam patterns found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {flags.map((flag) => (
        <div key={flag.title} className="rounded-md border border-border bg-raised p-4">
          <div className="flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASS[status])} />
            <h4 className="text-sm font-semibold text-ink-primary">{flag.title}</h4>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{flag.description}</p>
        </div>
      ))}
    </div>
  )
}
