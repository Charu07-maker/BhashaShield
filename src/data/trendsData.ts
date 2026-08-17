export interface TrendCategory {
  id: string
  label: string
  /** Validated categorical hue (fixed order — never reassigned by rank). */
  color: string
}

/** Shared with the Report page's success state, so "you're report #N" stays consistent. */
export const WEEKLY_REPORT_COUNT = 1204

// Fixed-order categorical palette, validated against our dark panel surface
// (#14171c) with scripts/validate_palette.js — all adjacent-pair CVD and
// normal-vision checks pass. Deliberately avoids green/amber/red (reserved
// for verdict status) and orange (brand accent).
export const TREND_CATEGORIES: TrendCategory[] = [
  { id: 'bank-kyc', label: 'Bank & KYC scams', color: '#3987e5' },
  { id: 'delivery', label: 'Delivery scams', color: '#d55181' },
  { id: 'digital-arrest', label: 'Digital arrest calls', color: '#9085e9' },
]

export interface TrendPoint {
  date: string // ISO yyyy-mm-dd
  values: Record<string, number>
}

const DAY_MS = 86_400_000

function seededWave(dayIndex: number, base: number, amplitude: number, period: number, trend: number) {
  const wave = Math.sin((dayIndex / period) * Math.PI * 2)
  const value = base + amplitude * wave + trend * dayIndex
  return Math.max(0, Math.round(value))
}

const SERIES_PARAMS: Record<string, { base: number; amplitude: number; period: number; trend: number }> = {
  'bank-kyc': { base: 20, amplitude: 6, period: 7, trend: 0.03 },
  delivery: { base: 27, amplitude: 8, period: 5, trend: 0.01 },
  'digital-arrest': { base: 9, amplitude: 4, period: 9, trend: 0.06 },
}

/** Deterministic 90-day mock dataset, oldest to newest, ending today. */
export function generateTrendSeries(days = 90): TrendPoint[] {
  const points: TrendPoint[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY_MS)
    const dayIndex = days - 1 - i
    const values: Record<string, number> = {}
    for (const cat of TREND_CATEGORIES) {
      const p = SERIES_PARAMS[cat.id]
      values[cat.id] = seededWave(dayIndex, p.base, p.amplitude, p.period, p.trend)
    }
    points.push({ date: date.toISOString().slice(0, 10), values })
  }
  return points
}

export const DATE_RANGE_OPTIONS = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
]

export function sliceLastNDays(points: TrendPoint[], days: number): TrendPoint[] {
  return points.slice(-days)
}

export function sumByCategory(points: TrendPoint[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const cat of TREND_CATEGORIES) totals[cat.id] = 0
  for (const point of points) {
    for (const cat of TREND_CATEGORIES) {
      totals[cat.id] += point.values[cat.id] ?? 0
    }
  }
  return totals
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
