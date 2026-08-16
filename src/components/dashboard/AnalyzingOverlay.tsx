export function AnalyzingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md bg-base/50 backdrop-blur-[1px]">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-accent/25 to-transparent animate-scan" />
    </div>
  )
}

export function AnalyzingProgressBar() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
        <div className="h-full w-1/3 rounded-full bg-accent animate-progress-indeterminate" />
      </div>
      <p className="shrink-0 font-mono text-xs text-ink-secondary">
        Running rule engine + AI analysis…
      </p>
    </div>
  )
}
