import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, AlertOctagon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatTile } from '../components/ui/StatTile'
import { TrendsFilterRow } from '../components/dashboard/TrendsFilterRow'
import { TimeSeriesChart, type ChartSeries } from '../components/charts/TimeSeriesChart'
import { CategoryBarChart, type BarDatum } from '../components/charts/CategoryBarChart'
import {
  DATE_RANGE_OPTIONS,
  TREND_CATEGORIES,
  WEEKLY_REPORT_COUNT,
  generateTrendSeries,
  sliceLastNDays,
  sumByCategory,
} from '../data/trendsData'

const TREND_STATS = [
  { value: WEEKLY_REPORT_COUNT.toLocaleString('en-IN'), label: 'Scams reported this week' },
  { value: 'Hindi', label: 'Most-targeted language this week' },
  { value: '62%', label: 'Are fake delivery or bank scams' },
  { value: '₹41.2L', label: 'In attempted fraud flagged this week' },
]

export function Trends() {
  const [dateRangeId, setDateRangeId] = useState('30')
  const [categoryId, setCategoryId] = useState('all')

  const allPoints = useMemo(() => generateTrendSeries(90), [])
  const days = DATE_RANGE_OPTIONS.find((o) => o.id === dateRangeId)?.days ?? 30
  const sliced = useMemo(() => sliceLastNDays(allPoints, days), [allPoints, days])

  const chartSeries: ChartSeries[] = useMemo(
    () =>
      TREND_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        color: cat.color,
        data: sliced.map((p) => ({ date: p.date, value: p.values[cat.id] ?? 0 })),
      })),
    [sliced],
  )

  const barData: BarDatum[] = useMemo(() => {
    const totals = sumByCategory(sliced)
    return TREND_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      color: cat.color,
      value: totals[cat.id] ?? 0,
    }))
  }, [sliced])

  const highlightId = categoryId === 'all' ? null : categoryId
  const selectedRangeLabel = DATE_RANGE_OPTIONS.find((o) => o.id === dateRangeId)?.label ?? ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-raised">
          <TrendingUp className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
            Scam Trends
          </h1>
          <p className="text-sm text-ink-secondary">
            A live view of which scam patterns are spreading right now.
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TREND_STATS.map((stat) => (
          <StatTile key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>

      <div className="mb-6">
        <TrendsFilterRow
          dateRangeId={dateRangeId}
          onDateRangeChange={setDateRangeId}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reports over time</CardTitle>
            <CardDescription>
              {selectedRangeLabel}, by scam type
              {highlightId
                ? ` — highlighting ${TREND_CATEGORIES.find((c) => c.id === highlightId)?.label}`
                : ''}
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              series={chartSeries}
              highlightId={highlightId}
              ariaLabel="Reports over time by scam type"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports by scam type</CardTitle>
            <CardDescription>Total reports in the selected date range.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart
              data={barData}
              highlightId={highlightId}
              ariaLabel="Total reports by scam type"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-panel p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-base font-semibold text-ink-primary">
            Spot a scam that isn't listed here?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            Every report helps train the detection engine and warns others faster.
          </p>
        </div>
        <Link to="/report" className="shrink-0">
          <Button size="lg">
            <AlertOctagon className="h-4 w-4" />
            Report a scam
          </Button>
        </Link>
      </div>
    </div>
  )
}
