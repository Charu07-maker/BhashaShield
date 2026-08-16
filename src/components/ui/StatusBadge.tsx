import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { cn } from '../../lib/utils'

export type VerdictStatus = 'safe' | 'suspicious' | 'dangerous'

const config: Record<
  VerdictStatus,
  { label: string; icon: typeof ShieldCheck; text: string; bg: string; border: string }
> = {
  safe: {
    label: 'Safe',
    icon: ShieldCheck,
    text: 'text-safe',
    bg: 'bg-safe-wash',
    border: 'border-safe/30',
  },
  suspicious: {
    label: 'Suspicious',
    icon: ShieldAlert,
    text: 'text-warning',
    bg: 'bg-warning-wash',
    border: 'border-warning/30',
  },
  dangerous: {
    label: 'Dangerous',
    icon: ShieldX,
    text: 'text-danger',
    bg: 'bg-danger-wash',
    border: 'border-danger/30',
  },
}

interface StatusBadgeProps {
  status: VerdictStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-9 px-3.5 text-sm gap-2 [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-11 px-4 text-base gap-2 [&_svg]:h-5 [&_svg]:w-5',
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const { label, icon: Icon, text, bg, border } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-semibold tracking-tight',
        text,
        bg,
        border,
        sizeClasses[size],
        className,
      )}
    >
      <Icon strokeWidth={2.25} />
      {label}
    </span>
  )
}
