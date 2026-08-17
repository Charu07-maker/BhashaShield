import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, UploadCloud, AlertOctagon, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { ExampleChips } from '../components/dashboard/ExampleChips'
import { AudioProcessingStages, type ProcessingStage } from '../components/dashboard/AudioProcessingStages'
import { VerdictBanner } from '../components/dashboard/VerdictBanner'
import { RiskMeter } from '../components/dashboard/RiskMeter'
import { HighlightedMessage } from '../components/dashboard/HighlightedMessage'
import { FlagList } from '../components/dashboard/FlagList'
import { RealityCheckPanel } from '../components/dashboard/RealityCheckPanel'
import { EmergencyActionRow } from '../components/dashboard/EmergencyActionRow'
import { InlineNotice } from '../components/dashboard/InlineNotice'
import { useDashboardContext } from '../components/dashboard/DashboardContext'
import { CALL_EXAMPLES, type CallAnalysisResult } from '../data/callShieldExamples'
import type { ReportContext } from '../lib/report'
import { cn } from '../lib/utils'

const ACCEPTED_AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav']

function isAcceptedAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true
  const lowerName = file.name.toLowerCase()
  return ACCEPTED_AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
}

type Phase = 'idle' | 'transcribing' | 'analyzing' | 'result'
type Feedback = 'up' | 'down' | null

const TRANSCRIBING_DELAY_MS = 1700
const ANALYZING_DELAY_MS = 1700

const STAGES: ProcessingStage[] = [{ label: 'Transcribing audio…' }, { label: 'Analyzing transcript…' }]

const SAMPLE_CHIPS = [
  { id: 'digital-arrest-example', label: 'digital arrest recording' },
  { id: 'fake-delivery-scam-call', label: 'fake delivery call recording' },
  { id: 'normal-call', label: 'a normal call recording' },
]

export function RecordedCall() {
  const { setDetectedLanguage, resetCheck, resetSignal } = useDashboardContext()

  const [phase, setPhase] = useState<Phase>('idle')
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<CallAnalysisResult | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = true
    setPhase('idle')
    setFileName('')
    setIsDragging(false)
    setResult(null)
    setFeedback(null)
    setFileError(null)
  }, [resetSignal])

  const startProcessing = (name: string, exampleId?: string) => {
    if (phase !== 'idle') return
    cancelRef.current = false
    setFileName(name)
    setPhase('transcribing')

    window.setTimeout(() => {
      if (cancelRef.current) return
      setPhase('analyzing')

      window.setTimeout(() => {
        if (cancelRef.current) return
        const example =
          (exampleId && CALL_EXAMPLES.find((e) => e.id === exampleId)) ||
          CALL_EXAMPLES[Math.floor(Math.random() * CALL_EXAMPLES.length)]
        setResult(example.result)
        setDetectedLanguage(example.result.language)
        setPhase('result')
      }, ANALYZING_DELAY_MS)
    }, TRANSCRIBING_DELAY_MS)
  }

  const handleFileSelected = (file: File) => {
    if (phase !== 'idle') return
    if (!isAcceptedAudioFile(file)) {
      setFileError("That file type isn't supported. Please upload an MP3, M4A, or WAV file.")
      return
    }
    setFileError(null)
    startProcessing(file.name)
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

  const handleCheckAnother = () => {
    resetCheck()
  }

  const isProcessing = phase === 'transcribing' || phase === 'analyzing'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised">
          <Mic className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Recorded Call Upload
          </h1>
          <p className="text-sm text-ink-secondary">
            Upload a recording of a suspicious call — ShieldBhasha transcribes it and runs the same
            detection engine used in the Call Shield.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <RealityCheckPanel />
      </div>

      <div className="mb-8">
        <EmergencyActionRow />
      </div>

      {phase === 'idle' && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-6 py-12 text-center transition-colors duration-150',
                  isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40',
                )}
              >
                <UploadCloud className="h-8 w-8 text-ink-secondary" strokeWidth={1.5} />
                <span className="text-sm font-medium text-ink-primary">
                  Drag and drop an audio file, or click to browse
                </span>
              </button>
              <p className="mt-2 text-xs text-ink-secondary">MP3, M4A, or WAV — up to 25MB</p>
              {fileError && (
                <div className="mt-3">
                  <InlineNotice>{fileError}</InlineNotice>
                </div>
              )}
            </div>

            <ExampleChips
              chips={SAMPLE_CHIPS.map((chip) => ({
                label: chip.label,
                onClick: () => startProcessing(`${chip.id}.mp3`, chip.id),
              }))}
            />
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <p className="text-sm text-ink-secondary">
              Processing <span className="font-mono text-ink-primary">{fileName}</span>…
            </p>
            <AudioProcessingStages stages={STAGES} activeIndex={phase === 'transcribing' ? 0 : 1} />
          </CardContent>
        </Card>
      )}

      {phase === 'result' && result && (
        <Card>
          <CardContent className="animate-fade-in space-y-6 pt-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
                Generated transcript
              </p>
              <div className="max-h-56 overflow-y-auto rounded-md">
                <HighlightedMessage segments={result.segments} status={result.status} />
              </div>
            </div>

            <VerdictBanner status={result.status} />
            <RiskMeter score={result.riskScore} status={result.status} />

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
                      source: 'recording',
                      status: result.status,
                      preview: result.segments.map((seg) => seg.text).join(''),
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
      )}
    </div>
  )
}
