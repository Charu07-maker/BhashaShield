import type { MessageSegment } from '../../lib/analysis'
import type { VerdictStatus } from '../ui/StatusBadge'
import { cn } from '../../lib/utils'

const MARK_CLASS: Record<VerdictStatus, string> = {
  safe: 'bg-safe-wash text-safe',
  suspicious: 'bg-warning-wash text-warning',
  dangerous: 'bg-danger-wash text-danger',
}

interface HighlightedMessageProps {
  segments: MessageSegment[]
  status: VerdictStatus
  className?: string
}

export function HighlightedMessage({ segments, status, className }: HighlightedMessageProps) {
  return (
    <p
      dir="auto"
      className={cn(
        'rounded-md border border-border bg-raised p-4 text-[15px] leading-relaxed text-ink-primary',
        className,
      )}
    >
      {segments.map((seg, i) =>
        seg.flagged ? (
          <mark key={i} className={cn('rounded px-1 py-0.5 font-medium no-underline', MARK_CLASS[status])}>
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  )
}
