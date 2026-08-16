import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import type { VerdictStatus } from '../ui/StatusBadge'
import { verdictLine } from '../../lib/analysis'
import { cn } from '../../lib/utils'

const CONFIG: Record<
  VerdictStatus,
  { icon: typeof ShieldCheck; text: string; bg: string; border: string; label: string }
> = {
  safe: { icon: ShieldCheck, text: 'text-safe', bg: 'bg-safe-wash', border: 'border-safe/30', label: 'Safe' },
  suspicious: {
    icon: ShieldAlert,
    text: 'text-warning',
    bg: 'bg-warning-wash',
    border: 'border-warning/30',
    label: 'Suspicious',
  },
  dangerous: {
    icon: ShieldX,
    text: 'text-danger',
    bg: 'bg-danger-wash',
    border: 'border-danger/30',
    label: 'Dangerous',
  },
}

export function VerdictBanner({ status }: { status: VerdictStatus }) {
  const { icon: Icon, text, bg, border, label } = CONFIG[status]
  return (
    <div className={cn('flex items-center gap-4 rounded-lg border p-5', bg, border)}>
      <Icon className={cn('h-9 w-9 shrink-0', text)} strokeWidth={2} />
      <div>
        <p className={cn('font-display text-lg font-semibold tracking-tight', text)}>{label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-secondary">{verdictLine(status)}</p>
      </div>
    </div>
  )
}
