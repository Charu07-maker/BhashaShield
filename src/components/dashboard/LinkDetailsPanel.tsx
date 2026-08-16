import { Globe, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { LinkAnalysisResult } from '../../lib/linkAnalysis'
import type { VerdictStatus } from '../ui/StatusBadge'
import { cn } from '../../lib/utils'

const STATUS_ICON: Record<VerdictStatus, typeof CheckCircle2> = {
  safe: CheckCircle2,
  suspicious: AlertTriangle,
  dangerous: XCircle,
}

const STATUS_TEXT: Record<VerdictStatus, string> = {
  safe: 'text-safe',
  suspicious: 'text-warning',
  dangerous: 'text-danger',
}

interface Row {
  label: string
  value: string
  status?: VerdictStatus
}

function DetailRow({ label, value, status }: Row) {
  const Icon = status ? STATUS_ICON[status] : Globe
  const iconClass = status ? STATUS_TEXT[status] : 'text-ink-disabled'
  const valueClass = status ? STATUS_TEXT[status] : 'text-ink-primary'

  return (
    <div className="flex flex-col gap-1.5 border-b border-border py-3.5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4 shrink-0', iconClass)} strokeWidth={2} />
        <span className="text-sm text-ink-secondary">{label}</span>
      </div>
      <span className={cn('break-all font-mono text-sm sm:text-right', valueClass)}>{value}</span>
    </div>
  )
}

export function LinkDetailsPanel({ result }: { result: LinkAnalysisResult }) {
  const rows: Row[] = [
    { label: 'Real destination', value: result.realDestination },
    { label: 'Domain age', value: result.domainAge.text, status: result.domainAge.status },
    { label: 'Look-alike check', value: result.lookAlike.text, status: result.lookAlike.status },
    {
      label: 'Safety database check',
      value: result.safetyDatabase.text,
      status: result.safetyDatabase.status,
    },
  ]

  return (
    <div className="rounded-md border border-border bg-raised px-4">
      {rows.map((row) => (
        <DetailRow key={row.label} {...row} />
      ))}
    </div>
  )
}
