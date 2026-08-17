import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhoneCall, ArrowRight, AlertOctagon, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Textarea } from '../components/ui/Textarea'
import { ExampleChips } from '../components/dashboard/ExampleChips'
import { AnalyzingOverlay, AnalyzingProgressBar } from '../components/dashboard/AnalyzingOverlay'
import { VerdictBanner } from '../components/dashboard/VerdictBanner'
import { RiskMeter } from '../components/dashboard/RiskMeter'
import { HighlightedMessage } from '../components/dashboard/HighlightedMessage'
import { FlagList } from '../components/dashboard/FlagList'
import { RealityCheckPanel } from '../components/dashboard/RealityCheckPanel'
import { EmergencyActionRow } from '../components/dashboard/EmergencyActionRow'
import { useDashboardContext } from '../components/dashboard/DashboardContext'
import { CALL_EXAMPLES, analyzeCallShieldDescription, type CallAnalysisResult } from '../data/callShieldExamples'
import type { ReportContext } from '../lib/report'

type Phase = 'idle' | 'analyzing' | 'result'
type Feedback = 'up' | 'down' | null

const ANALYZE_DELAY_MS = 2200

export function CallShield() {
  const { setDetectedLanguage, resetCheck, resetSignal } = useDashboardContext()

  const [phase, setPhase] = useState<Phase>('idle')
  const [callText, setCallText] = useState('')
  const [result, setResult] = useState<CallAnalysisResult | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    setPhase('idle')
    setCallText('')
    setResult(null)
    setFeedback(null)
  }, [resetSignal])

  const handleAnalyze = () => {
    if (!callText.trim() || phase === 'analyzing') return
    setPhase('analyzing')
    window.setTimeout(() => {
      const analysis = analyzeCallShieldDescription(callText)
      setResult(analysis)
      setDetectedLanguage(analysis.language)
      setPhase('result')
    }, ANALYZE_DELAY_MS)
  }

  const handleCheckAnother = () => {
    resetCheck()
  }

  const isBusy = phase === 'analyzing'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised">
          <PhoneCall className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Call &amp; Digital Arrest Shield
          </h1>
          <p className="text-sm text-ink-secondary">
            Describe a suspicious call to check it for scam and "digital arrest" patterns.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <RealityCheckPanel />
      </div>

      <div className="mb-8">
        <EmergencyActionRow />
      </div>

      {phase !== 'result' ? (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div>
              <label htmlFor="call-input" className="mb-2 block text-sm font-medium text-ink-secondary">
                What happened on the call? Paste a transcript or describe it in your own words, in any
                language.
              </label>
              <div className="relative">
                <Textarea
                  id="call-input"
                  rows={7}
                  value={callText}
                  onChange={(e) => setCallText(e.target.value)}
                  placeholder='e.g. "The caller said he was a CBI officer and told me not to hang up..."'
                  disabled={isBusy}
                />
                {phase === 'analyzing' && <AnalyzingOverlay />}
              </div>
            </div>

            <ExampleChips
              disabled={isBusy}
              chips={CALL_EXAMPLES.map((ex) => ({
                label: ex.chipLabel,
                onClick: () => setCallText(ex.rawText),
              }))}
            />

            {phase === 'analyzing' && (
              <div className="animate-fade-in">
                <AnalyzingProgressBar />
              </div>
            )}

            <div className="flex justify-end">
              <Button size="lg" disabled={!callText.trim() || isBusy} onClick={handleAnalyze}>
                {phase === 'analyzing' ? 'Analyzing…' : 'Analyze This Call'}
                {phase !== 'analyzing' && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        result && (
          <Card>
            <CardContent className="animate-fade-in space-y-6 pt-6">
              <VerdictBanner status={result.status} />
              <RiskMeter score={result.riskScore} status={result.status} />

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                  What you described
                </p>
                <HighlightedMessage segments={result.segments} status={result.status} />
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                  Flagged patterns
                </p>
                <FlagList flags={result.flags} status={result.status} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/report"
                    state={
                      {
                        source: 'call',
                        status: result.status,
                        preview: callText,
                        language: result.language,
                      } satisfies ReportContext
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
                        className="rounded-md p-2.5 text-ink-secondary transition-colors hover:bg-raised hover:text-safe"
                      >
                        <ThumbsUp className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedback('down')}
                        aria-label="This was not helpful"
                        className="rounded-md p-2.5 text-ink-secondary transition-colors hover:bg-raised hover:text-danger"
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
