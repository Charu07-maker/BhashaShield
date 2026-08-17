import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AlertOctagon,
  MessageSquareWarning,
  Link2,
  PhoneCall,
  Mic,
  HelpCircle,
  IndianRupee,
  Check,
  Send,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Textarea } from '../components/ui/Textarea'
import { Input } from '../components/ui/Input'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmergencyActionRow } from '../components/dashboard/EmergencyActionRow'
import { InlineNotice } from '../components/dashboard/InlineNotice'
import { WEEKLY_REPORT_COUNT } from '../data/trendsData'
import { SOURCE_LABELS, generateReferenceId, type ReportContext, type ReportSource } from '../lib/report'
import { cn } from '../lib/utils'

type Phase = 'form' | 'submitting' | 'success'

const SOURCE_OPTIONS: { id: ReportSource; icon: LucideIcon }[] = [
  { id: 'text', icon: MessageSquareWarning },
  { id: 'link', icon: Link2 },
  { id: 'call', icon: PhoneCall },
  { id: 'recording', icon: Mic },
  { id: 'other', icon: HelpCircle },
]

const SUBMIT_DELAY_MS = 1600

export function Report() {
  const location = useLocation()
  const incoming = (location.state as ReportContext | null) ?? null

  const [source, setSource] = useState<ReportSource>(incoming?.source ?? 'other')
  const [content, setContent] = useState(incoming?.preview ?? '')
  const [lostMoney, setLostMoney] = useState<'yes' | 'no' | null>(null)
  const [amount, setAmount] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<Phase>('form')
  const [referenceId, setReferenceId] = useState('')

  const canSubmit = content.trim().length > 0 && consent

  const handleSubmit = () => {
    if (!canSubmit || phase === 'submitting') return
    setPhase('submitting')
    window.setTimeout(() => {
      setReferenceId(generateReferenceId())
      setPhase('success')
    }, SUBMIT_DELAY_MS)
  }

  const handleReset = () => {
    setSource('other')
    setContent('')
    setLostMoney(null)
    setAmount('')
    setContact('')
    setConsent(false)
    setReferenceId('')
    setPhase('form')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised">
          <AlertOctagon className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Report a Scam
          </h1>
          <p className="text-sm text-ink-secondary">
            Already been targeted, or spotted something suspicious? Every report sharpens the
            detection engine and warns someone else faster.
          </p>
        </div>
      </div>

      {incoming && phase === 'form' && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-border bg-raised px-4 py-3.5">
          <p className="text-sm text-ink-secondary">
            Reporting from your <span className="font-medium text-ink-primary">{SOURCE_LABELS[incoming.source]}</span> check:
          </p>
          {incoming.status && <StatusBadge status={incoming.status} size="sm" />}
        </div>
      )}

      <div className="mb-8">
        <EmergencyActionRow />
      </div>

      {phase === 'form' && (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-secondary">
                What are you reporting?
              </label>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSource(opt.id)}
                    className={cn(
                      'inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150',
                      source === opt.id
                        ? 'border-accent bg-accent/15 text-ink-primary'
                        : 'border-border bg-raised text-ink-secondary hover:border-accent/40 hover:text-ink-primary',
                    )}
                  >
                    <opt.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {SOURCE_LABELS[opt.id]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="report-content" className="mb-2 block text-sm font-medium text-ink-secondary">
                Paste the message, link, or describe what happened
              </label>
              <Textarea
                id="report-content"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='e.g. "I got a call from someone claiming to be a CBI officer..."'
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-secondary">
                Have you lost money to this?
              </label>
              <div className="inline-flex rounded-md border border-border bg-raised p-1">
                <button
                  type="button"
                  onClick={() => setLostMoney('no')}
                  className={cn(
                    'min-h-[36px] rounded px-4 text-sm font-medium transition-colors duration-150',
                    lostMoney === 'no' ? 'bg-accent text-white' : 'text-ink-secondary hover:text-ink-primary',
                  )}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setLostMoney('yes')}
                  className={cn(
                    'min-h-[36px] rounded px-4 text-sm font-medium transition-colors duration-150',
                    lostMoney === 'yes' ? 'bg-accent text-white' : 'text-ink-secondary hover:text-ink-primary',
                  )}
                >
                  Yes
                </button>
              </div>

              {lostMoney === 'yes' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="report-amount" className="mb-1.5 block text-xs font-medium text-ink-secondary">
                      Approximate amount lost (optional)
                    </label>
                    <div className="relative">
                      <IndianRupee
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
                        strokeWidth={2}
                      />
                      <Input
                        id="report-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="25,000"
                        inputMode="numeric"
                        className="pl-10 font-mono"
                      />
                    </div>
                  </div>
                  <InlineNotice>
                    Since money is involved, please also file with the National Cybercrime Helpline
                    (1930) or cybercrime.gov.in above — this report helps warn others, but only the
                    official helpline can act on freezing a transaction.
                  </InlineNotice>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="report-contact" className="mb-2 block text-sm font-medium text-ink-secondary">
                Contact info <span className="font-normal text-ink-secondary">(optional — for follow-up only)</span>
              </label>
              <Input
                id="report-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone number"
              />
            </div>

            <button
              type="button"
              onClick={() => setConsent((v) => !v)}
              className="flex w-full items-start gap-3 text-left"
            >
              <span
                role="checkbox"
                aria-checked={consent}
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors duration-150',
                  consent ? 'border-accent bg-accent' : 'border-border bg-raised',
                )}
              >
                {consent && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
              <span className="text-sm leading-relaxed text-ink-secondary">
                I understand this report may be used, in anonymized and aggregated form, to improve
                scam detection and warn other users.
              </span>
            </button>

            <div className="flex justify-end">
              <Button size="lg" disabled={!canSubmit} onClick={handleSubmit}>
                <Send className="h-4 w-4" />
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 'submitting' && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-ink-secondary">Submitting your report…</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
              <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-accent" />
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 'success' && (
        <Card>
          <CardContent className="animate-fade-in space-y-6 pt-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
              <CheckCircle2 className="h-7 w-7 text-accent" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-ink-primary">Report submitted</p>
              <p className="mt-2 font-mono text-sm text-ink-secondary">Reference {referenceId}</p>
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-secondary">
              You're report{' '}
              <span className="font-semibold text-ink-primary">
                #{(WEEKLY_REPORT_COUNT + 1).toLocaleString('en-IN')}
              </span>{' '}
              this week — every report sharpens the detection engine and helps warn others faster.
            </p>

            {lostMoney === 'yes' && (
              <div className="mx-auto max-w-md text-left">
                <InlineNotice>
                  Since you've lost money, please make sure you've also filed with the National
                  Cybercrime Helpline (1930) or cybercrime.gov.in above — this report alone can't
                  freeze a transaction.
                </InlineNotice>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6">
              <Button variant="secondary" size="md" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Report another
              </Button>
              <Link to="/trends">
                <Button variant="outline" size="md">
                  <TrendingUp className="h-4 w-4" />
                  See scam trends
                </Button>
              </Link>
              <Link to="/">
                <Button size="md">Back to home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
