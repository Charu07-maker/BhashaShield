import { Clock, Phone, ExternalLink } from 'lucide-react'

export function EmergencyActionRow() {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger-wash p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-danger" strokeWidth={2} />
        <p className="text-sm leading-relaxed text-ink-primary sm:text-[15px]">
          <span className="font-display font-semibold text-danger">The golden hour matters.</span> Reporting
          within the first hour dramatically increases the chance of freezing the money before it's moved.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href="tel:1930"
          className="flex items-center justify-center gap-2 rounded-md bg-danger px-4 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(239,68,68,0.5)] transition-all duration-150 hover:brightness-90 active:scale-[0.98] sm:flex-1"
        >
          <Phone className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          Call 1930 Helpline
        </a>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md border border-danger/50 px-4 py-3 text-sm font-semibold text-danger transition-colors duration-150 hover:bg-danger/10 sm:flex-1"
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          Report at cybercrime.gov.in
        </a>
      </div>
    </div>
  )
}
