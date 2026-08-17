import { useRef, useState } from 'react'
import { buildAreaPath, buildLinePath, niceMax } from '../../lib/chartMath'
import { formatShortDate } from '../../data/trendsData'
import { cn } from '../../lib/utils'

export interface ChartSeries {
  id: string
  label: string
  color: string
  data: { date: string; value: number }[]
}

interface TimeSeriesChartProps {
  series: ChartSeries[]
  highlightId?: string | null
  ariaLabel: string
}

const VB_W = 640
const VB_H = 300
const PAD_LEFT = 36
const PAD_RIGHT = 12
const PAD_TOP = 16
const PAD_BOTTOM = 30
const PLOT_W = VB_W - PAD_LEFT - PAD_RIGHT
const PLOT_H = VB_H - PAD_TOP - PAD_BOTTOM

export function TimeSeriesChart({ series, highlightId, ariaLabel }: TimeSeriesChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const dates = series[0]?.data.map((d) => d.date) ?? []
  const n = dates.length

  const maxVal = Math.max(1, ...series.flatMap((s) => s.data.map((d) => d.value)))
  const domainMax = niceMax(maxVal)

  const xAt = (i: number) => PAD_LEFT + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W)
  const yAt = (v: number) => PAD_TOP + PLOT_H - (v / domainMax) * PLOT_H

  const tickCount = 4
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((domainMax / tickCount) * i))
  const labelStep = Math.max(1, Math.ceil(n / 6))

  const updateHoverFromClientX = (clientX: number) => {
    if (!svgRef.current || n === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const scale = VB_W / rect.width
    const localX = (clientX - rect.left) * scale
    const idx = Math.round(((localX - PAD_LEFT) / PLOT_W) * (n - 1))
    setHoverIndex(Math.min(n - 1, Math.max(0, idx)))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (n === 0) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setHoverIndex((i) => Math.min(n - 1, (i ?? n - 1) + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setHoverIndex((i) => Math.max(0, (i ?? n - 1) - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setHoverIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setHoverIndex(n - 1)
    }
  }

  const tooltipLeftPct = hoverIndex !== null ? (xAt(hoverIndex) / VB_W) * 100 : 0
  const alignRight = tooltipLeftPct > 62

  return (
    <div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full"
          role="img"
          aria-label={ariaLabel}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={VB_W - PAD_RIGHT}
                y1={yAt(t)}
                y2={yAt(t)}
                className="stroke-border"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD_LEFT - 8}
                y={yAt(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-ink-secondary font-sans text-[10px]"
              >
                {t}
              </text>
            </g>
          ))}

          {dates.map((d, i) =>
            i % labelStep === 0 ? (
              <text
                key={d}
                x={xAt(i)}
                y={VB_H - PAD_BOTTOM + 18}
                textAnchor="middle"
                className="fill-ink-secondary font-sans text-[10px]"
              >
                {formatShortDate(d)}
              </text>
            ) : null,
          )}

          {series.map((s) => {
            const faded = highlightId != null && highlightId !== s.id
            const areaPath = buildAreaPath(s.data, xAt, yAt, PAD_TOP + PLOT_H)
            const linePath = buildLinePath(s.data, xAt, yAt)
            const lastPoint = s.data[n - 1]
            return (
              <g key={s.id} style={{ opacity: faded ? 0.18 : 1, transition: 'opacity 200ms ease' }}>
                <path d={areaPath} style={{ fill: s.color }} fillOpacity={0.1} stroke="none" />
                <path
                  d={linePath}
                  fill="none"
                  style={{ stroke: s.color }}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {lastPoint && (
                  <circle
                    cx={xAt(n - 1)}
                    cy={yAt(lastPoint.value)}
                    r={4}
                    style={{ fill: s.color }}
                    className="stroke-panel"
                    strokeWidth={2}
                  />
                )}
              </g>
            )
          })}

          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PAD_TOP}
              y2={PAD_TOP + PLOT_H}
              className="stroke-ink-secondary"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}

          <rect
            x={PAD_LEFT}
            y={PAD_TOP}
            width={PLOT_W}
            height={PLOT_H}
            fill="transparent"
            tabIndex={0}
            role="slider"
            aria-label="Scrub through dates to see values"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, n - 1)}
            aria-valuenow={hoverIndex ?? n - 1}
            aria-valuetext={hoverIndex !== null ? formatShortDate(dates[hoverIndex]) : undefined}
            onMouseMove={(e) => updateHoverFromClientX(e.clientX)}
            onMouseLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex((i) => i ?? n - 1)}
            onBlur={() => setHoverIndex(null)}
            onKeyDown={handleKeyDown}
            className="cursor-crosshair outline-none"
          />
        </svg>

        {hoverIndex !== null && dates[hoverIndex] && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-48 rounded-md border border-border bg-raised p-3 shadow-panel"
            style={{
              left: `${tooltipLeftPct}%`,
              transform: alignRight ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)',
            }}
          >
            <p className="mb-2 text-xs font-medium text-ink-primary">{formatShortDate(dates[hoverIndex])}</p>
            <div className="space-y-1.5">
              {series.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-ink-secondary">
                    <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-mono font-semibold text-ink-primary">
                    {s.data[hoverIndex]?.value ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {series.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <div
              key={s.id}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-opacity duration-200',
                highlightId != null && highlightId !== s.id ? 'opacity-40' : 'opacity-100',
              )}
            >
              <span className="h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-ink-secondary">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-3 text-xs font-medium text-ink-secondary underline decoration-dotted underline-offset-2 transition-colors hover:text-ink-primary"
      >
        {showTable ? 'Hide table view' : 'View as table'}
      </button>

      {showTable && (
        <div className="mt-3 max-h-64 overflow-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-raised">
              <tr className="border-b border-border">
                <th className="px-3 py-2 font-medium text-ink-secondary">Date</th>
                {series.map((s) => (
                  <th key={s.id} className="px-3 py-2 font-medium text-ink-secondary">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((d, i) => (
                <tr key={d} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-mono text-ink-primary">{d}</td>
                  {series.map((s) => (
                    <td key={s.id} className="px-3 py-2 font-mono text-ink-primary">
                      {s.data[i]?.value ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
