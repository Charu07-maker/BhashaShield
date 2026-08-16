interface StatTileProps {
  value: string
  label: string
}

export function StatTile({ value, label }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-panel p-6">
      <div className="font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
        {value}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{label}</p>
    </div>
  )
}
