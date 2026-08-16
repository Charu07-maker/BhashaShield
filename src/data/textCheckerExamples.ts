import type { AnalysisResult } from '../lib/analysis'
import { findExactExample, heuristicAnalyze } from '../lib/mockAnalyzer'

export interface ExampleMessage {
  id: string
  chipLabel: string
  rawText: string
  result: AnalysisResult
}

export const TEXT_EXAMPLES: ExampleMessage[] = [
  {
    id: 'fake-bank-alert',
    chipLabel: 'fake bank alert',
    rawText:
      'प्रिय ग्राहक, आपका SBI बैंक खाता आज रात बंद हो जाएगा। तुरंत अपनी KYC अपडेट करें: sbi-kyc-update.info/verify अपना OTP यहाँ दर्ज करें।',
    result: {
      status: 'dangerous',
      riskScore: 96,
      language: 'Hindi',
      segments: [
        { text: 'प्रिय ग्राहक, आपका SBI बैंक खाता आज रात ' },
        { text: 'बंद हो जाएगा', flagged: true },
        { text: '। ' },
        { text: 'तुरंत', flagged: true },
        { text: ' अपनी ' },
        { text: 'KYC अपडेट करें', flagged: true },
        { text: ': ' },
        { text: 'sbi-kyc-update.info/verify', flagged: true },
        { text: ' अपना ' },
        { text: 'OTP', flagged: true },
        { text: ' यहाँ दर्ज करें।' },
      ],
      flags: [
        {
          title: 'Impersonates SBI',
          description: "Uses a bank's name and branding without a verified sender ID.",
        },
        {
          title: 'Threatens account closure',
          description: 'Claims your account will be closed tonight to force a hasty reaction.',
        },
        {
          title: 'Requests OTP',
          description: 'No legitimate bank ever asks for your OTP over SMS or chat.',
        },
        {
          title: 'Unofficial domain',
          description: 'sbi-kyc-update.info is not an official State Bank of India domain.',
        },
      ],
      explanation:
        'यह संदेश भारतीय स्टेट बैंक (SBI) होने का दिखावा करता है और तुरंत KYC अपडेट न करने पर खाता बंद होने की धमकी देता है। असली बैंक कभी भी SMS या लिंक के ज़रिए OTP नहीं मांगते — इस लिंक पर क्लिक न करें और न ही OTP साझा करें।',
      link: {
        url: 'sbi-kyc-update.info/verify',
        status: 'dangerous',
        flags: [
          'Not an official SBI domain',
          'Domain registered 4 days ago',
          'No valid SSL certificate',
        ],
      },
    },
  },
  {
    id: 'fake-delivery-scam',
    chipLabel: 'fake delivery scam',
    rawText:
      'Your package could not be delivered due to an incomplete address. Please confirm your details within 12 hours to avoid return to sender: delivery-trackr.co/confirm-xy2',
    result: {
      status: 'suspicious',
      riskScore: 58,
      language: 'English',
      segments: [
        {
          text: 'Your package could not be delivered due to an incomplete address. Please confirm your details ',
        },
        { text: 'within 12 hours', flagged: true },
        { text: ' to avoid return to sender: ' },
        { text: 'delivery-trackr.co/confirm-xy2', flagged: true },
      ],
      flags: [
        {
          title: 'Artificial time pressure',
          description: 'Creates a short deadline ("12 hours") to rush you into clicking.',
        },
        {
          title: 'No specific order or courier name',
          description: "Doesn't reference a real tracking number or courier brand.",
        },
        {
          title: 'Unfamiliar domain',
          description: "delivery-trackr.co isn't a domain used by any known courier service.",
        },
      ],
      explanation:
        'This message imitates a courier delivery notice and creates a short deadline to make you click quickly, but it never names an actual courier or order number — a common pattern used to harvest personal details.',
      link: {
        url: 'delivery-trackr.co/confirm-xy2',
        status: 'suspicious',
        flags: [
          'Domain registered under 30 days ago',
          'Not linked to any known courier service',
          'No HTTPS encryption',
        ],
      },
    },
  },
  {
    id: 'normal-message',
    chipLabel: 'a normal message',
    rawText: 'Hey! Are we still on for dinner tonight at 8? Let me know if you want me to book the table.',
    result: {
      status: 'safe',
      riskScore: 3,
      language: 'English',
      segments: [
        { text: 'Hey! Are we still on for dinner tonight at 8? Let me know if you want me to book the table.' },
      ],
      flags: [
        {
          title: 'No links or payment requests',
          description: 'The message contains no URLs, account numbers, or payment asks.',
        },
        {
          title: 'No urgency or threats',
          description: "There's no pressure to act quickly or any threatening language.",
        },
        {
          title: 'Consistent with normal conversation',
          description: 'Reads like an ordinary personal message between people who know each other.',
        },
      ],
      explanation:
        'This message shows none of the patterns associated with scams — no links, no urgency, and no requests for money or personal information. It reads like a normal personal conversation.',
    },
  },
]

export const OCR_MOCK_TEXT =
  'Dear Customer, Your Account will be suspended today. Verify immediately via bit.ly/acc-verify3 and enter OTP to confirm: 8823'

export const OCR_MOCK_RESULT: AnalysisResult = {
  status: 'dangerous',
  riskScore: 92,
  language: 'English',
  segments: [
    { text: 'Dear Customer, Your Account ' },
    { text: 'will be suspended today', flagged: true },
    { text: '. ' },
    { text: 'Verify immediately', flagged: true },
    { text: ' via ' },
    { text: 'bit.ly/acc-verify3', flagged: true },
    { text: ' and enter ' },
    { text: 'OTP', flagged: true },
    { text: ' to confirm: 8823' },
  ],
  flags: [
    {
      title: 'Threatens suspension',
      description: 'Claims your account will be suspended today to pressure quick action.',
    },
    {
      title: 'Artificial urgency',
      description: 'Uses "immediately" to rush you before you can think it through.',
    },
    {
      title: 'Shortened link',
      description: 'bit.ly links hide the real destination — a common scam tactic.',
    },
    {
      title: 'Requests OTP',
      description: 'No legitimate service ever asks for your OTP over SMS or chat.',
    },
  ],
  explanation:
    'This extracted screenshot text impersonates an account-suspension notice and asks you to click a shortened link and share your OTP — both are hallmark signs of a phishing attempt. Do not tap the link or share the code.',
  link: {
    url: 'bit.ly/acc-verify3',
    status: 'dangerous',
    flags: ['Shortened link hides its real destination', 'Not associated with any bank or official service'],
  },
}

export function analyzeTextCheckerMessage(text: string): AnalysisResult {
  const knownExample = findExactExample(text, TEXT_EXAMPLES)
  if (knownExample) return knownExample.result
  if (text.trim().replace(/\s+/g, ' ').toLowerCase() === OCR_MOCK_TEXT.trim().toLowerCase()) {
    return OCR_MOCK_RESULT
  }
  return heuristicAnalyze(text)
}
