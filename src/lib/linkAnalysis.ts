import type { VerdictStatus } from '../components/ui/StatusBadge'

export interface LinkDetail {
  text: string
  status: VerdictStatus
}

export interface LinkAnalysisResult {
  status: VerdictStatus
  realDestination: string
  domainAge: LinkDetail
  lookAlike: LinkDetail
  safetyDatabase: LinkDetail
  summary: string
}
