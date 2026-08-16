import type { LinkAnalysisResult } from '../lib/linkAnalysis'
import { heuristicAnalyzeLink } from '../lib/mockLinkAnalyzer'

export interface LinkExample {
  id: string
  chipLabel: string
  rawUrl: string
  result: LinkAnalysisResult
}

export const LINK_EXAMPLES: LinkExample[] = [
  {
    id: 'fake-sbi-login',
    chipLabel: 'fake SBI login page',
    rawUrl: 'sbi-kyc-update.info/verify',
    result: {
      status: 'dangerous',
      realDestination: 'http://sbi-kyc-update.info/verify/session=8841',
      domainAge: { text: 'Registered 4 days ago', status: 'dangerous' },
      lookAlike: {
        text: '98% similar to onlinesbi.com, but not the real domain',
        status: 'dangerous',
      },
      safetyDatabase: { text: 'Flagged by Google Safe Browsing', status: 'dangerous' },
      summary:
        "This link imitates SBI's official site through a lookalike domain registered days ago and is already flagged by safety databases — do not enter any information.",
    },
  },
  {
    id: 'shortened-link',
    chipLabel: 'shortened link',
    rawUrl: 'bit.ly/acc-verify3',
    result: {
      status: 'suspicious',
      realDestination: 'http://free-rewards-claim.co/prize?id=2291',
      domainAge: { text: 'Registered 22 days ago', status: 'suspicious' },
      lookAlike: { text: 'No obvious brand impersonation detected', status: 'safe' },
      safetyDatabase: { text: 'Not currently flagged, but unverified', status: 'suspicious' },
      summary:
        'This shortened link hides an unrelated destination and points to a newly registered domain — proceed with caution and avoid entering any details.',
    },
  },
  {
    id: 'legitimate-link',
    chipLabel: 'a legitimate link',
    rawUrl: 'https://en.wikipedia.org/wiki/Reserve_Bank_of_India',
    result: {
      status: 'safe',
      realDestination: 'https://en.wikipedia.org/wiki/Reserve_Bank_of_India',
      domainAge: { text: 'Registered over 20 years ago', status: 'safe' },
      lookAlike: { text: 'No look-alike patterns detected', status: 'safe' },
      safetyDatabase: { text: 'Not flagged by any safety database', status: 'safe' },
      summary:
        'This is a well-established, widely recognized domain with no suspicious signals — safe to open.',
    },
  },
]

function normalizeUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

export function analyzeLinkCheckerUrl(url: string): LinkAnalysisResult {
  const target = normalizeUrl(url)
  const known = LINK_EXAMPLES.find((ex) => normalizeUrl(ex.rawUrl) === target)
  if (known) return known.result
  return heuristicAnalyzeLink(url)
}
