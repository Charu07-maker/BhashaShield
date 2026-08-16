import { ShieldHalf, Info, Phone, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-base">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <ShieldHalf className="h-5 w-5 text-accent" strokeWidth={2.25} />
            <span className="font-display text-base font-semibold tracking-tight text-ink-primary">
              ShieldBhasha
            </span>
          </div>
          <p className="text-sm text-ink-secondary">
            Scam detection and explanation in your language — Hindi, Tamil, Bengali, English.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xl items-start gap-2.5 text-sm leading-relaxed text-ink-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-disabled" strokeWidth={2} />
            <p>
              This is a screening and awareness tool, not a certified replacement for official
              verification. If you're in immediate danger or have already lost money, contact the
              authorities directly.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-primary transition-colors hover:text-accent"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              National Cybercrime Helpline · 1930
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-primary transition-colors hover:text-accent"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} />
              cybercrime.gov.in
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-xs text-ink-disabled sm:flex-row sm:items-center sm:justify-between">
          <p>Built by Team ShieldBhasha for Omnikon 2026 — Problem Statement Omni_CyberTech_1</p>
          <p className="font-mono">All analysis shown is simulated for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  )
}
