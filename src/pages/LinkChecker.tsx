import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, ArrowRight, AlertOctagon, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { ExampleChips } from '../components/dashboard/ExampleChips'
import { AnalyzingChecklist } from '../components/dashboard/AnalyzingChecklist'
import { VerdictBanner } from '../components/dashboard/VerdictBanner'
import { LinkDetailsPanel } from '../components/dashboard/LinkDetailsPanel'
import { EmergencyActionRow } from '../components/dashboard/EmergencyActionRow'
import { useDashboardContext } from '../components/dashboard/DashboardContext'
import { LINK_EXAMPLES, analyzeLinkCheckerUrl } from '../data/linkCheckerExamples'
import type { LinkAnalysisResult } from '../lib/linkAnalysis'
import type { ReportContext } from '../lib/report'

type Phase = 'idle' | 'analyzing' | 'result'
type Feedback = 'up' | 'down' | null

const ANALYZE_STEPS = [
  'Unshortening link…',
  'Checking domain age…',
  'Comparing to known brand names…',
  'Checking safety databases…',
]

const STEP_DELAY_MS = 550

export function LinkChecker() {
  const { resetCheck, resetSignal } = useDashboardContext()

  const [phase, setPhase] = useState<Phase>('idle')
  const [url, setUrl] = useState('')
  const [analyzingStep, setAnalyzingStep] = useState(0)
  const [result, setResult] = useState<LinkAnalysisResult | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = true
    setPhase('idle')
    setUrl('')
    setAnalyzingStep(0)
    setResult(null)
    setFeedback(null)
  }, [resetSignal])

  const handleCheck = () => {
    if (!url.trim() || phase === 'analyzing') return
    cancelRef.current = false
    setPhase('analyzing')
    setAnalyzingStep(0)

    ANALYZE_STEPS.forEach((_, i) => {
      window.setTimeout(() => {
        if (cancelRef.current) return
        if (i === ANALYZE_STEPS.length - 1) {
          const analysis = analyzeLinkCheckerUrl(url)
          setResult(analysis)
          setPhase('result')
        } else {
          setAnalyzingStep(i + 1)
        }
      }, (i + 1) * STEP_DELAY_MS)
    })
  }

  const handleCheckAnother = () => {
    resetCheck()
  }

  const isBusy = phase === 'analyzing'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised">
          <Link2 className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Link / URL Checker
          </h1>
          <p className="text-sm text-ink-secondary">
            Paste a suspicious link — from an email, message, or anywhere else — to check it on its own.
          </p>
        </div>
      </div>

      {phase !== 'result' ? (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div>
              <label htmlFor="link-input" className="mb-2 block text-sm font-medium text-ink-secondary">
                Paste the link here
              </label>
              <Input
                id="link-input"
                type="text"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/..."
                disabled={isBusy}
                className="font-mono"
              />
            </div>

            <ExampleChips
              disabled={isBusy}
              chips={LINK_EXAMPLES.map((ex) => ({
                label: ex.chipLabel,
                onClick: () => setUrl(ex.rawUrl),
              }))}
            />

            {phase === 'analyzing' && (
              <div className="animate-fade-in rounded-md border border-border bg-raised p-4">
                <AnalyzingChecklist steps={ANALYZE_STEPS} activeIndex={analyzingStep} />
              </div>
            )}

            <div className="flex justify-end">
              <Button size="lg" disabled={!url.trim() || isBusy} onClick={handleCheck}>
                {isBusy ? 'Checking…' : 'Check This Link'}
                {!isBusy && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        result && (
          <Card>
            <CardContent className="animate-fade-in space-y-6 pt-6">
              <VerdictBanner status={result.status} />

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                  Link details
                </p>
                <LinkDetailsPanel result={result} />
              </div>

              <p className="text-sm leading-relaxed text-ink-secondary">{result.summary}</p>

              {result.status === 'dangerous' && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                    Take action now
                  </p>
                  <EmergencyActionRow />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/report"
                    state={
                      { source: 'link', status: result.status, preview: url } satisfies ReportContext
                    }
                  >
                    <Button variant="outline" size="md">
                      <AlertOctagon className="h-4 w-4" />
                      Report this
                    </Button>
                  </Link>
                  <Button variant="secondary" size="md" onClick={handleCheckAnother}>
                    <RotateCcw className="h-4 w-4" />
                    Check another
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {feedback ? (
                    <span className="text-xs text-ink-secondary">Thanks for the feedback</span>
                  ) : (
                    <>
                      <span className="text-xs text-ink-secondary">Was this helpful?</span>
                      <button
                        type="button"
                        onClick={() => setFeedback('up')}
                        aria-label="This was helpful"
                        className="rounded-md p-2.5 text-ink-secondary transition-colors hover:bg-panel hover:text-safe"
                      >
                        <ThumbsUp className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedback('down')}
                        aria-label="This was not helpful"
                        className="rounded-md p-2.5 text-ink-secondary transition-colors hover:bg-panel hover:text-danger"
                      >
                        <ThumbsDown className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
