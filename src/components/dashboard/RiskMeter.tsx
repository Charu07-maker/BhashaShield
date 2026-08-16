import type { VerdictStatus } from '../ui/StatusBadge'
import { cn } from '../../lib/utils'

const BAR_COLOR: Record<VerdictStatus, string> = {
  safe: 'bg-safe',
  suspicious: 'bg-warning',
  dangerous: 'bg-danger',
}

export function RiskMeter({ score, status }: { score: number; status: VerdictStatus }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-secondary">
        <span>Risk score</span>
        <span className="font-mono text-sm text-ink-primary">{score}/100</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-raised">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-emphasized', BAR_COLOR[status])}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
