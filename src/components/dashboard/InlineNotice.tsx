import { AlertCircle } from 'lucide-react'

/**
 * A calmly-worded inline notice for input/form mistakes (wrong file type, empty
 * field, etc). Uses the neutral warning tone, never the critical-red reserved
 * for actual scam verdicts.
 */
export function InlineNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning-wash px-3.5 py-3"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={2} />
      <p className="text-sm leading-relaxed text-ink-primary">{children}</p>
    </div>
  )
}
