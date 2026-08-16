import type { VerdictStatus } from '../components/ui/StatusBadge'

export interface MessageSegment {
  text: string
  flagged?: boolean
}

export interface RedFlag {
  title: string
  description: string
}

export interface LinkVerdict {
  url: string
  status: VerdictStatus
  flags: string[]
}

export interface AnalysisResult {
  status: VerdictStatus
  riskScore: number
  language: string
  segments: MessageSegment[]
  flags: RedFlag[]
  explanation: string
  link?: LinkVerdict
}

export function statusFromScore(score: number): VerdictStatus {
  if (score >= 70) return 'dangerous'
  if (score >= 35) return 'suspicious'
  return 'safe'
}

export function verdictLine(status: VerdictStatus): string {
  switch (status) {
    case 'dangerous':
      return 'This is highly likely a scam — do not click any links or share information.'
    case 'suspicious':
      return 'This shows some suspicious signs — proceed carefully and verify independently.'
    case 'safe':
      return 'No signs of a scam were found.'
  }
}
