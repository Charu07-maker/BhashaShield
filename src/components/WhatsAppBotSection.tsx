import { useState } from 'react'
import { MessageCircle, Send, ShieldHalf, ShieldX, QrCode } from 'lucide-react'
import { Button } from './ui/Button'

export function WhatsAppBotSection() {
  const [showNote, setShowNote] = useState(false)

  return (
    <section className="border-y border-border bg-panel/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-1.5 font-mono text-xs text-ink-secondary">
              <MessageCircle className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
              WhatsApp companion
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
              Forward it. Don't overthink it.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-secondary">
              Already have a suspicious message open in WhatsApp? Forward it straight to the
              ShieldBhasha bot and get the same verdict — highlighted phrases, risk score, and a
              plain-language reason — back as a reply, without switching apps.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={() => setShowNote(true)}>
                <MessageCircle className="h-4 w-4" />
                Try it on WhatsApp
              </Button>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-raised px-3 py-2">
                <QrCode className="h-8 w-8 text-ink-secondary" strokeWidth={1.5} />
                <span className="font-mono text-xs text-ink-secondary">Scan to chat</span>
              </div>
            </div>
            {showNote && (
              <p className="mt-3 text-xs text-ink-secondary">
                WhatsApp integration launches after the hackathon demo — this preview shows how it
                will work.
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-[280px] rounded-[2.25rem] border-4 border-border bg-base p-2.5 shadow-2xl">
              <div className="overflow-hidden rounded-[1.75rem] bg-panel">
                <div className="flex items-center gap-2.5 border-b border-border bg-raised px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
                    <ShieldHalf className="h-4 w-4 text-accent" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">ShieldBhasha Bot</p>
                    <p className="text-[10px] text-safe">online</p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-accent/15 p-3">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-accent">
                      Forwarded
                    </p>
                    <p className="text-xs leading-relaxed text-ink-primary">
                      "Your SBI account will be blocked. Update KYC now: sbi-kyc-update.info"
                    </p>
                  </div>

                  <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-raised p-3">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-danger-wash px-2 py-0.5">
                      <ShieldX className="h-3 w-3 text-danger" strokeWidth={2.25} />
                      <span className="text-[10px] font-semibold text-danger">Dangerous</span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-secondary">
                      This message impersonates SBI and links to an unofficial domain. Don't click
                      it or share your OTP.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                  <div className="h-8 flex-1 rounded-full bg-raised" />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Send className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
