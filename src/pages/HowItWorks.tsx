import { ListChecks, Brain, ShieldCheck, Globe, Database, Mic, Info } from 'lucide-react'

const ENGINE_STEPS = [
  {
    icon: ListChecks,
    title: 'Rule-based screening',
    description:
      'A fast, explainable rule engine checks every message, link, and call description against known scam patterns — OTP requests, urgency phrases, impersonation, payment demands. Every flag traces back to the exact rule that triggered it.',
  },
  {
    icon: Brain,
    title: 'AI reasoning layer',
    description:
      "A language-aware model reviews tone, context, and phrasing the rules alone might miss — especially in code-mixed or nuanced regional language, where scams don't always match a fixed pattern.",
  },
  {
    icon: ShieldCheck,
    title: 'Combined verdict',
    description:
      'The two layers combine into one traffic-light verdict with a plain-language explanation, shown in the language the message arrived in — not a bare label.',
  },
]

const TRUST_BADGES = [
  {
    icon: Globe,
    label: 'Google Safe Browsing',
    description: 'Cross-checks links against a known-malicious URL database.',
  },
  {
    icon: Database,
    label: 'VirusTotal-style domain reputation checks',
    description: 'Evaluates domain age, registration, and reputation signals.',
  },
  {
    icon: Mic,
    label: 'Whisper-based multilingual transcription',
    description: 'Converts recorded calls to text across Hindi, Tamil, Bengali, and English.',
  },
]

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mb-14 max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
          How ShieldBhasha works
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-secondary sm:text-lg">
          A hybrid engine — explainable rules plus AI reasoning — built to catch scams and explain
          them in the language they arrived in.
        </p>
      </div>

      <section className="mb-16">
        <div className="space-y-8">
          {ENGINE_STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised font-mono text-sm font-semibold text-accent">
                  {i + 1}
                </div>
                {i < ENGINE_STEPS.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
              </div>
              <div className="pb-2">
                <div className="mb-1.5 flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-accent" strokeWidth={2} />
                  <h2 className="font-display text-lg font-semibold tracking-tight text-ink-primary">
                    {step.title}
                  </h2>
                </div>
                <p className="max-w-xl text-[15px] leading-relaxed text-ink-secondary">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-2 font-display text-lg font-semibold tracking-tight text-ink-primary">
          Built on credible technical foundations
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-ink-secondary">
          ShieldBhasha's checks are modeled on the same class of tools security teams already
          trust.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="rounded-md border border-border bg-raised p-4">
              <badge.icon className="mb-3 h-5 w-5 text-accent" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-ink-primary">{badge.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-lg border-2 border-border bg-panel p-6">
          <div className="flex items-start gap-3.5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
            <div>
              <h3 className="font-display text-base font-semibold text-ink-primary">
                A screening tool, not a certified verdict
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                This is a screening and awareness tool, not a certified replacement for official
                verification or professional advice. Always verify independently — especially
                before making a payment or sharing personal information — and contact the
                authorities directly if you're in immediate danger.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
