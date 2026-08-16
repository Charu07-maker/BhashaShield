import { MessageSquareWarning, Link2, PhoneCall, AudioLines, type LucideIcon } from 'lucide-react'

export interface ModuleDef {
  icon: LucideIcon
  title: string
  description: string
  to: string
}

export const MODULES: ModuleDef[] = [
  {
    icon: MessageSquareWarning,
    title: 'Text / SMS / Email',
    description: 'Paste a message or upload a screenshot — get flagged phrases and a plain-language reason.',
    to: '/text-checker',
  },
  {
    icon: Link2,
    title: 'Link / URL Checker',
    description: 'Check a link pasted directly or pulled automatically out of a checked message.',
    to: '/link-checker',
  },
  {
    icon: PhoneCall,
    title: 'Call & Digital Arrest Shield',
    description: 'Describe or paste a call transcript — built to catch the CBI/police impersonation pattern.',
    to: '/call-shield',
  },
  {
    icon: AudioLines,
    title: 'Recorded Call Upload',
    description: 'Upload a call recording for transcription and the same risk analysis, automatically.',
    to: '/recorded-call',
  },
]
