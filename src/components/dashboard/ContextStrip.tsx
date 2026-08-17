import { Languages, RotateCcw } from 'lucide-react'
import { useDashboardContext } from './DashboardContext'

export function ContextStrip() {
  const { detectedLanguage, resetCheck } = useDashboardContext()

  return (
    <div className="border-b border-border bg-panel/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={2} />
          {detectedLanguage ? (
            <p className="flex items-center gap-2 text-sm">
              <span className="text-ink-secondary">Last detected language:</span>
              <span className="rounded-md border border-border bg-raised px-2 py-0.5 font-mono text-xs font-medium text-ink-primary">
                {detectedLanguage}
              </span>
            </p>
          ) : (
            <p className="text-sm text-ink-secondary">No language detected yet</p>
          )}
        </div>
        <button
          type="button"
          onClick={resetCheck}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-ink-secondary transition-colors duration-150 hover:border-accent/50 hover:text-ink-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          New check
        </button>
      </div>
    </div>
  )
}
