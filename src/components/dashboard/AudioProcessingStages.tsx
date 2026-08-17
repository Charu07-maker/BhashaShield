import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ProcessingStage {
  label: string
}

interface AudioProcessingStagesProps {
  stages: ProcessingStage[]
  activeIndex: number
}

export function AudioProcessingStages({ stages, activeIndex }: AudioProcessingStagesProps) {
  return (
    <div className="space-y-4">
      {stages.map((stage, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        return (
          <div key={stage.label}>
            <div className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" strokeWidth={2} />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" strokeWidth={2} />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={2} />
              )}
              <span
                className={cn(
                  'font-mono text-sm',
                  done || active ? 'text-ink-primary' : 'text-ink-secondary',
                )}
              >
                {stage.label}
              </span>
            </div>
            {active && (
              <div className="ml-[26px] mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-accent" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
