import type { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  icon: LucideIcon
  title: string
  description: string
}

export function PlaceholderPage({ icon: Icon, title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-raised">
        <Icon className="h-7 w-7 text-accent" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-primary">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
        {description}
      </p>
      <div className="mt-6 rounded-md border border-border bg-panel px-4 py-2 font-mono text-xs text-ink-disabled">
        This module is built out in a later build step.
      </div>
    </div>
  )
}
