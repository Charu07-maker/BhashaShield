export interface MessageSegment {
  text: string
  flagged?: boolean
}

export const PREVIEW_MESSAGE_SEGMENTS: MessageSegment[] = [
  { text: '"' },
  { text: 'CBI अधिकारी बोल रहा हूं', flagged: true },
  { text: ', आपके नाम पर मामला दर्ज है। ' },
  { text: 'तुरंत', flagged: true },
  { text: ' अपने ' },
  { text: 'UPI से भुगतान करें', flagged: true },
  { text: ' वरना गिरफ्तारी होगी।"' },
]

export const PREVIEW_REASON =
  'This message impersonates a law enforcement officer and demands immediate UPI payment under threat of arrest — the exact pattern used in "digital arrest" scams.'

export const PREVIEW_FLAGS = [
  'Impersonates CBI / law enforcement',
  'Creates artificial urgency ("immediately")',
  'Demands UPI payment to avoid arrest',
  'Real police never ask for payment over call',
]
