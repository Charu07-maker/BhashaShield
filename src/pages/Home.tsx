import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardTitle } from '../components/ui/Card'
import { StatTile } from '../components/ui/StatTile'
import { HeroPreviewPanel } from '../components/HeroPreviewPanel'
import { WhatsAppBotSection } from '../components/WhatsAppBotSection'
import { MODULES } from '../data/modules'
import { STATS } from '../data/stats'

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-grid-faint">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.06] via-transparent to-base" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-1.5 font-mono text-xs text-ink-secondary">
                OMNIKON 2026 · Omni_CyberTech_1
              </div>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-primary sm:text-5xl lg:text-6xl">
                Read the scam.
                <br />
                <span className="text-accent">In your language.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg lg:mx-0">
                Paste a message, a link, or describe a call — ShieldBhasha tells you exactly why
                it's dangerous, in the language it arrived in.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/text-checker">
                  <Button size="lg">
                    Check a message now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    See how it works
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <HeroPreviewPanel />
            </div>
          </div>
        </div>
      </section>

      {/* Trust / stat tiles */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </section>

      <WhatsAppBotSection />

      {/* Closing: four modules */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            Four ways ShieldBhasha protects you
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
            Every surface feeds into the same shared verdict system.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => (
            <Link key={mod.to} to={mod.to} className="group">
              <Card className="h-full transition-colors duration-200 group-hover:border-accent/40">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-raised transition-colors group-hover:border-accent/50">
                    <mod.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
