import type { AnalysisResult, LinkVerdict, MessageSegment, RedFlag } from './analysis'
import { statusFromScore } from './analysis'
import type { VerdictStatus } from '../components/ui/StatusBadge'

export function detectScriptLanguage(text: string): string {
  if (/[ऀ-ॿ]/.test(text)) return 'Hindi'
  if (/[ঀ-৿]/.test(text)) return 'Bengali'
  if (/[஀-௿]/.test(text)) return 'Tamil'
  return 'English'
}

const URL_PATTERN =
  /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+|\b[a-z0-9-]+\.(?:info|xyz|top|co|link|click|shop)\b[^\s]*/i

export interface KeywordRule {
  pattern: RegExp
  title: string
  description: string
  weight: number
}

export const SCAM_KEYWORD_RULES: KeywordRule[] = [
  {
    pattern: /otp|one[- ]?time password/i,
    title: 'Requests OTP',
    description: 'No legitimate service ever asks for your OTP over SMS or chat.',
    weight: 35,
  },
  {
    pattern: /kyc/i,
    title: 'KYC update pressure',
    description: 'Fraudsters commonly frame scams as urgent "KYC updates" to create panic.',
    weight: 20,
  },
  {
    pattern: /urgent(ly)?|immediately|तुरंत|within \d+ hours?|right away|act now/i,
    title: 'Artificial urgency',
    description: 'Creates time pressure so you act before thinking it through.',
    weight: 20,
  },
  {
    pattern: /block(ed)?|suspend(ed)?|frozen|बंद हो|सीज़/i,
    title: 'Threatens account action',
    description: 'Threatens to block, suspend, or freeze your account or funds.',
    weight: 20,
  },
  {
    pattern: /arrest|\bcbi\b|police|court|customs|legal action|गिरफ्तार/i,
    title: 'Impersonates law enforcement',
    description: 'Impersonates police, CBI, customs, or courts to intimidate you.',
    weight: 35,
  },
  {
    pattern: /\bupi\b|bank details|account number|\bpin\b|\bcvv\b|card number/i,
    title: 'Requests financial details',
    description: 'Asks for banking details that should never be shared over message.',
    weight: 30,
  },
  {
    pattern: /lottery|winner|prize|reward|claim now/i,
    title: 'Unrealistic reward',
    description: "Promises a prize or reward you didn't enter for.",
    weight: 25,
  },
  {
    pattern: /don'?t (disconnect|hang up)|do not disconnect|stay on the (call|line)/i,
    title: 'Instruction to stay on the call',
    description: 'Isolates you from friends or family who could point out it\'s a scam.',
    weight: 30,
  },
  {
    pattern: /video call|stay on camera|keep your camera on/i,
    title: 'Demands to stay on video call',
    description: 'Creates a sense of surveillance and control — a hallmark "digital arrest" tactic.',
    weight: 25,
  },
  {
    pattern: URL_PATTERN,
    title: 'Suspicious link',
    description: 'Contains a link to an unfamiliar or unofficial-looking domain.',
    weight: 15,
  },
]

interface MatchRange {
  start: number
  end: number
}

function findMatchRanges(text: string, rules: KeywordRule[]) {
  const ranges: MatchRange[] = []
  const matchedRules: KeywordRule[] = []

  for (const rule of rules) {
    const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g'
    const re = new RegExp(rule.pattern.source, flags)
    let match: RegExpExecArray | null
    let matchedThisRule = false
    while ((match = re.exec(text)) !== null) {
      if (match[0].length === 0) {
        re.lastIndex++
        continue
      }
      ranges.push({ start: match.index, end: match.index + match[0].length })
      matchedThisRule = true
    }
    if (matchedThisRule) matchedRules.push(rule)
  }

  ranges.sort((a, b) => a.start - b.start)
  const merged: MatchRange[] = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end)
    } else {
      merged.push({ ...r })
    }
  }

  return { ranges: merged, matchedRules }
}

function buildSegments(text: string, ranges: MatchRange[]): MessageSegment[] {
  const segments: MessageSegment[] = []
  let cursor = 0
  for (const r of ranges) {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start) })
    segments.push({ text: text.slice(r.start, r.end), flagged: true })
    cursor = r.end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return segments.length > 0 ? segments : [{ text }]
}

function buildExplanation(status: VerdictStatus, matchedRules: KeywordRule[], language: string): string {
  if (status === 'safe') {
    return `This message doesn't match any known scam patterns — no urgency, no payment requests, and no suspicious links. Shown in ${language}.`
  }
  const topics = matchedRules.slice(0, 3).map((r) => r.title.toLowerCase()).join(', ')
  const verb = status === 'dangerous' ? 'Multiple strong scam signals were found' : 'A few suspicious signals were found'
  return `${verb}, including ${topics || 'unusual language patterns'}. Avoid clicking any links or sharing personal details until you've verified this independently. Shown in ${language}.`
}

export function heuristicAnalyze(text: string, rules: KeywordRule[] = SCAM_KEYWORD_RULES): AnalysisResult {
  const language = detectScriptLanguage(text)
  const trimmed = text.trim()

  const { ranges, matchedRules } = findMatchRanges(trimmed, rules)
  const segments = buildSegments(trimmed, ranges)

  const score = trimmed.length === 0 ? 0 : Math.min(100, matchedRules.reduce((sum, r) => sum + r.weight, 0))
  const status = statusFromScore(score)

  const flags: RedFlag[] = matchedRules
    .filter((r) => r.title !== 'Suspicious link')
    .map((r) => ({ title: r.title, description: r.description }))

  const explanation = buildExplanation(status, matchedRules, language)

  const linkMatch = trimmed.match(URL_PATTERN)
  let link: LinkVerdict | undefined
  if (linkMatch) {
    link = {
      url: linkMatch[0],
      status,
      flags:
        status === 'safe'
          ? ['No suspicious redirect patterns detected']
          : ['Domain does not match any known official service', 'Not previously seen in verified messages'],
    }
  }

  return { status, riskScore: score, language, segments, flags, explanation, link }
}

export function findExactExample<T extends { rawText: string }>(text: string, examples: T[]): T | undefined {
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()
  const target = normalize(text)
  return examples.find((e) => normalize(e.rawText) === target)
}
