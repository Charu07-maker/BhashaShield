import { Gauge, Languages } from 'lucide-react'
import { StatusBadge } from './ui/StatusBadge'
import { PREVIEW_FLAGS, PREVIEW_MESSAGE_SEGMENTS, PREVIEW_REASON } from '../data/previewExample'

export function HeroPreviewPanel() {
  return (
    <div className="animate-fade-in-scale overflow-hidden rounded-lg border border-border bg-panel shadow-2xl">
      {/* Chrome / title bar */}
      <div className="flex items-center justify-between border-b border-border bg-raised/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-safe/70" />
          <span className="ml-2 font-mono text-xs text-ink-secondary">
            ShieldBhasha — Text Checker
          </span>
        </div>
        <span className="rounded-md border border-border bg-panel px-2 py-1 font-mono text-[11px] text-ink-secondary">
          Example analysis
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
          <Languages className="h-3.5 w-3.5" strokeWidth={2} />
          Message received · Hindi
        </div>
        <p
          dir="auto"
          className="rounded-md border border-border bg-raised p-4 text-[15px] leading-relaxed text-ink-primary"
        >
          {PREVIEW_MESSAGE_SEGMENTS.map((seg, i) =>
            seg.flagged ? (
              <mark
                key={i}
                className="rounded bg-danger-wash px-1 py-0.5 font-medium text-danger no-underline"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <StatusBadge status="dangerous" />
          <div className="flex items-center gap-1.5 font-mono text-xs text-ink-secondary">
            <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
            Risk score: 96/100
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{PREVIEW_REASON}</p>

        <ul className="mt-4 space-y-2">
          {PREVIEW_FLAGS.map((flag) => (
            <li key={flag} className="flex items-start gap-2 text-sm leading-relaxed text-ink-secondary">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-danger" />
              {flag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
