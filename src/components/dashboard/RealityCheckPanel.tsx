import { ShieldCheck, Check } from 'lucide-react'

const REALITY_FACTS = [
  'Real police, CBI, ED, or customs officials never arrest or investigate over a phone or video call.',
  'No government agency demands money via UPI, cryptocurrency, or gift cards.',
  'Real legal action always arrives as a physical, signed summons — never a call demanding instant payment.',
  'You are always allowed to hang up, step away, and verify independently.',
]

export function RealityCheckPanel() {
  return (
    <div className="rounded-lg border-2 border-accent/40 bg-panel p-5 shadow-glow-accent sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <ShieldCheck className="h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
        <h2 className="font-display text-base font-semibold tracking-tight text-ink-primary">Reality Check</h2>
      </div>
      <ul className="space-y-3">
        {REALITY_FACTS.map((fact) => (
          <li key={fact} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
            {fact}
          </li>
        ))}
      </ul>
    </div>
  )
}
