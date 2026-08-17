import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquareWarning,
  Upload,
  Loader2,
  ArrowRight,
  Languages,
  AlertOctagon,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Textarea } from '../components/ui/Textarea'
import { ExampleChips } from '../components/dashboard/ExampleChips'
import { AnalyzingOverlay, AnalyzingProgressBar } from '../components/dashboard/AnalyzingOverlay'
import { VerdictBanner } from '../components/dashboard/VerdictBanner'
import { RiskMeter } from '../components/dashboard/RiskMeter'
import { HighlightedMessage } from '../components/dashboard/HighlightedMessage'
import { FlagList } from '../components/dashboard/FlagList'
import { LinkVerdictCard } from '../components/dashboard/LinkVerdictCard'
import { InlineNotice } from '../components/dashboard/InlineNotice'
import { EmergencyActionRow } from '../components/dashboard/EmergencyActionRow'
import { useDashboardContext } from '../components/dashboard/DashboardContext'
import { TEXT_EXAMPLES, OCR_MOCK_TEXT, analyzeTextCheckerMessage } from '../data/textCheckerExamples'
import type { AnalysisResult } from '../lib/analysis'
import type { ReportContext } from '../lib/report'
import { cn } from '../lib/utils'

type Phase = 'idle' | 'analyzing' | 'result'
type Feedback = 'up' | 'down' | null

const ANALYZE_DELAY_MS = 2200
const OCR_DELAY_MS = 1400

export function TextChecker() {
  const { setDetectedLanguage, resetCheck, resetSignal } = useDashboardContext()

  const [phase, setPhase] = useState<Phase>('idle')
  const [messageText, setMessageText] = useState('')
  const [ocrExtracting, setOcrExtracting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset local state whenever the shell's global "New check" fires.
  useEffect(() => {
    setPhase('idle')
    setMessageText('')
    setOcrExtracting(false)
    setResult(null)
    setFeedback(null)
    setFileError(null)
  }, [resetSignal])

  const handleCheck = () => {
    if (!messageText.trim() || phase === 'analyzing') return
    setPhase('analyzing')
    window.setTimeout(() => {
      const analysis = analyzeTextCheckerMessage(messageText)
      setResult(analysis)
      setDetectedLanguage(analysis.language)
      setPhase('result')
    }, ANALYZE_DELAY_MS)
  }

  const handleCheckAnother = () => {
    resetCheck()
  }

  const handleFileSelected = (file: File) => {
    if (phase === 'analyzing' || ocrExtracting) return
    if (!file.type.startsWith('image/')) {
      setFileError('That file type isn\'t supported. Please upload a PNG or JPG screenshot.')
      return
    }
    setFileError(null)
    setOcrExtracting(true)
    window.setTimeout(() => {
      setMessageText(OCR_MOCK_TEXT)
      setOcrExtracting(false)
    }, OCR_DELAY_MS)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelected(file)
  }

  const isBusy = phase === 'analyzing' || ocrExtracting

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised">
          <MessageSquareWarning className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Text / SMS / Email Checker
          </h1>
          <p className="text-sm text-ink-secondary">
            Paste a message or upload a screenshot to check it for scam signals.
          </p>
        </div>
      </div>

      {phase !== 'result' ? (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div>
              <label htmlFor="message-input" className="mb-2 block text-sm font-medium text-ink-secondary">
                Paste the message here — any language
              </label>
              <div className="relative">
                <Textarea
                  id="message-input"
                  rows={7}
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value)
                    setFileError(null)
                  }}
                  placeholder='e.g. "Dear customer, your account will be blocked..."'
                  disabled={isBusy}
                />
                {phase === 'analyzing' && <AnalyzingOverlay />}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-ink-disabled">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center transition-colors duration-150',
                  isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40',
                  isBusy && 'pointer-events-none opacity-60',
                )}
              >
                {ocrExtracting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-accent" strokeWidth={2} />
                    <span className="font-mono text-xs text-ink-secondary">Extracting text…</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-ink-secondary" strokeWidth={1.75} />
                    <span className="text-sm font-medium text-ink-primary">Upload a screenshot instead</span>
                    <span className="text-xs text-ink-secondary">PNG or JPG, or drag and drop</span>
                  </>
                )}
              </button>
              {fileError && (
                <div className="mt-3">
                  <InlineNotice>{fileError}</InlineNotice>
                </div>
              )}
            </div>

            <ExampleChips
              disabled={isBusy}
              chips={TEXT_EXAMPLES.map((ex) => ({
                label: ex.chipLabel,
                onClick: () => setMessageText(ex.rawText),
              }))}
            />

            {phase === 'analyzing' && (
              <div className="animate-fade-in">
                <AnalyzingProgressBar />
              </div>
            )}

            <div className="flex justify-end">
              <Button size="lg" disabled={!messageText.trim() || isBusy} onClick={handleCheck}>
                {phase === 'analyzing' ? 'Analyzing…' : 'Check This Message'}
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
                  Original message
                </p>
                <HighlightedMessage segments={result.segments} status={result.status} />
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                  What triggered this
                </p>
                <FlagList flags={result.flags} status={result.status} />
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                  <Languages className="h-3.5 w-3.5" strokeWidth={2} />
                  Explained in {result.language}
                </p>
                <p className="text-sm leading-relaxed text-ink-secondary">{result.explanation}</p>
              </div>

              {result.link && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                    Link found in this message
                  </p>
                  <LinkVerdictCard link={result.link} />
                </div>
              )}

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
                      {
                        source: 'text',
                        status: result.status,
                        preview: messageText,
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
