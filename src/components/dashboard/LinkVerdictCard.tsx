import { useState } from 'react'
import { Link2, ChevronDown } from 'lucide-react'
import type { LinkVerdict } from '../../lib/analysis'
import { StatusBadge } from '../ui/StatusBadge'
import { cn } from '../../lib/utils'

export function LinkVerdictCard({ link }: { link: LinkVerdict }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-md border border-border bg-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link2 className="h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={2} />
          <span className="truncate font-mono text-sm text-ink-primary">{link.url}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={link.status} size="sm" />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary"
          >
            {expanded ? 'Hide details' : 'View link details'}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform duration-200', expanded && 'rotate-180')}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="animate-fade-in border-t border-border px-4 py-3">
          <ul className="space-y-1.5">
            {link.flags.map((flag) => (
              <li key={flag} className="flex items-start gap-2 text-sm leading-relaxed text-ink-secondary">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-disabled" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
