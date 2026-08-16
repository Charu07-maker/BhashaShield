import { AudioLines } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

export function RecordedCall() {
  return (
    <PlaceholderPage
      icon={AudioLines}
      title="Recorded Call Upload"
      description="Upload an audio recording of a suspicious call. ShieldBhasha transcribes it and runs the same risk analysis used across every other detection surface."
    />
  )
}
