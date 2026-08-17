import type { VerdictStatus } from '../components/ui/StatusBadge'

export type ReportSource = 'text' | 'link' | 'call' | 'recording' | 'other'

export interface ReportContext {
  source: ReportSource
  status?: VerdictStatus
  preview?: string
  language?: string
}

export const SOURCE_LABELS: Record<ReportSource, string> = {
  text: 'Text / SMS / Email',
  link: 'Link / URL',
  call: 'Call / Digital Arrest',
  recording: 'Recorded Call',
  other: 'Something else',
}

export function generateReferenceId(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `SB-${y}${m}${d}-${suffix}`
}
