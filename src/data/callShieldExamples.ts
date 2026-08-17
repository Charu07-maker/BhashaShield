import type { MessageSegment, RedFlag } from '../lib/analysis'
import type { VerdictStatus } from '../components/ui/StatusBadge'
import { findExactExample, heuristicAnalyze } from '../lib/mockAnalyzer'

export interface CallAnalysisResult {
  status: VerdictStatus
  riskScore: number
  language: string
  segments: MessageSegment[]
  flags: RedFlag[]
}

export interface CallExample {
  id: string
  chipLabel: string
  rawText: string
  result: CallAnalysisResult
}

export const CALL_EXAMPLES: CallExample[] = [
  {
    id: 'digital-arrest-example',
    chipLabel: 'digital arrest example',
    rawText:
      'कॉल करने वाले ने कहा कि वह CBI अधिकारी है और मेरे आधार नंबर से जुड़े एक मनी लॉन्ड्रिंग केस की जांच कर रहा है। उसने कहा कि कॉल मत काटो और किसी को मत बताओ, वीडियो कॉल पर बने रहो। उसने कहा कि अभी 50000 रुपये UPI से भेजो नहीं तो आज ही गिरफ्तारी होगी।',
    result: {
      status: 'dangerous',
      riskScore: 97,
      language: 'Hindi',
      segments: [
        { text: 'कॉल करने वाले ने कहा कि वह ' },
        { text: 'CBI अधिकारी है और मेरे आधार नंबर से जुड़े एक मनी लॉन्ड्रिंग केस की जांच कर रहा है', flagged: true },
        { text: '। उसने कहा कि ' },
        { text: 'कॉल मत काटो और किसी को मत बताओ', flagged: true },
        { text: ', ' },
        { text: 'वीडियो कॉल पर बने रहो', flagged: true },
        { text: '। उसने कहा कि अभी ' },
        { text: '50000 रुपये UPI से भेजो', flagged: true },
        { text: ' नहीं तो आज ही ' },
        { text: 'गिरफ्तारी होगी', flagged: true },
        { text: '।' },
      ],
      flags: [
        {
          title: 'Impersonates CBI',
          description: 'Claims to be a law enforcement officer investigating a serious case.',
        },
        {
          title: 'Instruction to stay on the call and not disconnect',
          description: "Isolates you from friends or family who could point out it's a scam.",
        },
        {
          title: 'Demands to stay on video call',
          description: 'Creates a sense of surveillance and control — a hallmark "digital arrest" tactic.',
        },
        {
          title: 'Requests payment via UPI, gift card, or crypto',
          description: 'No real agency ever collects fines or bail through UPI, crypto, or gift cards.',
        },
        {
          title: 'Threatens immediate arrest',
          description: 'Uses fear of arrest to force a hasty, panicked payment.',
        },
      ],
    },
  },
  {
    id: 'fake-delivery-scam-call',
    chipLabel: 'fake delivery scam',
    rawText:
      'I got a call saying my parcel is stuck in customs and I need to pay a 500 rupee clearance fee immediately or it will be sent back. The caller sent a payment link and said to hurry before the courier leaves.',
    result: {
      status: 'suspicious',
      riskScore: 55,
      language: 'English',
      segments: [
        { text: 'I got a call saying my parcel is stuck in customs and I need to pay a ' },
        { text: '500 rupee clearance fee immediately', flagged: true },
        { text: ' or it will be sent back. The caller sent a ' },
        { text: 'payment link', flagged: true },
        { text: ' and said to ' },
        { text: 'hurry before the courier leaves', flagged: true },
        { text: '.' },
      ],
      flags: [
        {
          title: 'Small urgent payment request',
          description: 'Uses a small "clearance fee" to feel low-risk while still taking your money and card details.',
        },
        {
          title: 'Unverified payment link',
          description: 'Real courier and customs fees are never collected through a link sent over call or SMS.',
        },
        {
          title: 'Artificial urgency',
          description: 'Pressures you to act before you have time to verify the caller.',
        },
      ],
    },
  },
  {
    id: 'normal-call',
    chipLabel: 'a normal call',
    rawText:
      'My friend called to ask if I wanted to grab lunch tomorrow and catch up. We talked for a bit about weekend plans.',
    result: {
      status: 'safe',
      riskScore: 2,
      language: 'English',
      segments: [
        { text: 'My friend called to ask if I wanted to grab lunch tomorrow and catch up. We talked for a bit about weekend plans.' },
      ],
      flags: [],
    },
  },
]

export function analyzeCallShieldDescription(text: string): CallAnalysisResult {
  const known = findExactExample(text, CALL_EXAMPLES)
  if (known) return known.result

  const generic = heuristicAnalyze(text)
  return {
    status: generic.status,
    riskScore: generic.riskScore,
    language: generic.language,
    segments: generic.segments,
    flags: generic.flags,
  }
}
