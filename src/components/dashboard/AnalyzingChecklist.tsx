import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AnalyzingChecklistProps {
  steps: string[]
  /** Index of the step currently in progress. Steps before this are done. */
  activeIndex: number
}

export function AnalyzingChecklist({ steps, activeIndex }: AnalyzingChecklistProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const done = i < activeIndex
        const inProgress = i === activeIndex
        return (
          <div key={step} className="flex items-center gap-3">
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" strokeWidth={2} />
            ) : inProgress ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" strokeWidth={2} />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={2} />
            )}
            <span
              className={cn(
                'font-mono text-sm',
                done || inProgress ? 'text-ink-primary' : 'text-ink-secondary',
              )}
            >
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
