import { useState } from 'react'
import { niceMax } from '../../lib/chartMath'
import { cn } from '../../lib/utils'

export interface BarDatum {
  id: string
  label: string
  color: string
  value: number
}

interface CategoryBarChartProps {
  data: BarDatum[]
  highlightId?: string | null
  ariaLabel: string
}

const VB_W = 640
const VB_H = 260
const PAD_LEFT = 36
const PAD_RIGHT = 12
const PAD_TOP = 28
const PAD_BOTTOM = 34
const PLOT_W = VB_W - PAD_LEFT - PAD_RIGHT
const PLOT_H = VB_H - PAD_TOP - PAD_BOTTOM
const MAX_BAR_WIDTH = 24
const RADIUS = 4

function roundedTopBarPath(x: number, width: number, yTop: number, yBottom: number) {
  const r = Math.min(RADIUS, width / 2, Math.max(0, yBottom - yTop))
  const left = x
  const right = x + width
  return [
    `M ${left},${yBottom}`,
    `L ${left},${yTop + r}`,
    `Q ${left},${yTop} ${left + r},${yTop}`,
    `L ${right - r},${yTop}`,
    `Q ${right},${yTop} ${right},${yTop + r}`,
    `L ${right},${yBottom}`,
    'Z',
  ].join(' ')
}

export function CategoryBarChart({ data, highlightId, ariaLabel }: CategoryBarChartProps) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [showTable, setShowTable] = useState(false)

  const n = data.length
  const domainMax = niceMax(Math.max(1, ...data.map((d) => d.value)))
  const yAt = (v: number) => PAD_TOP + PLOT_H - (v / domainMax) * PLOT_H
  const yBottom = PAD_TOP + PLOT_H

  const slotWidth = n > 0 ? PLOT_W / n : PLOT_W
  const barWidth = Math.min(MAX_BAR_WIDTH, slotWidth * 0.42)

  const tickCount = 4
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((domainMax / tickCount) * i))

  const hovered = data.find((d) => d.id === hoverId)
  const hoveredIndex = hovered ? data.indexOf(hovered) : -1
  const tooltipLeftPct = hoveredIndex >= 0 ? ((PAD_LEFT + slotWidth * (hoveredIndex + 0.5)) / VB_W) * 100 : 0
  const alignRight = tooltipLeftPct > 62

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full" role="img" aria-label={ariaLabel}>
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

          {data.map((d, i) => {
            const xCenter = PAD_LEFT + slotWidth * (i + 0.5)
            const barX = xCenter - barWidth / 2
            const top = yAt(d.value)
            const faded = highlightId != null && highlightId !== d.id
            const isHovered = hoverId === d.id
            return (
              <g
                key={d.id}
                style={{ opacity: faded ? 0.25 : 1, transition: 'opacity 200ms ease' }}
              >
                <path
                  d={roundedTopBarPath(barX, barWidth, top, yBottom)}
                  style={{ fill: d.color, filter: isHovered ? 'brightness(1.18)' : undefined }}
                />
                <text
                  x={xCenter}
                  y={top - 8}
                  textAnchor="middle"
                  className="fill-ink-primary font-mono text-[11px] font-semibold"
                >
                  {d.value}
                </text>
                <text
                  x={xCenter}
                  y={VB_H - PAD_BOTTOM + 18}
                  textAnchor="middle"
                  className="fill-ink-secondary font-sans text-[10px]"
                >
                  {d.label}
                </text>
                {/* full-slot hit target, taller than the bar itself */}
                <rect
                  x={PAD_LEFT + slotWidth * i}
                  y={PAD_TOP}
                  width={slotWidth}
                  height={PLOT_H}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.label}: ${d.value} reports`}
                  onMouseEnter={() => setHoverId(d.id)}
                  onMouseMove={() => setHoverId(d.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(d.id)}
                  onBlur={() => setHoverId(null)}
                  className="cursor-pointer outline-none"
                />
              </g>
            )
          })}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-44 rounded-md border border-border bg-raised p-3 shadow-panel"
            style={{
              left: `${tooltipLeftPct}%`,
              transform: alignRight ? 'translateX(calc(-100% - 8px))' : 'translateX(-50%)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: hovered.color }} />
              {hovered.label}
            </div>
            <p className="mt-1 font-mono text-sm font-semibold text-ink-primary">{hovered.value} reports</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-3 text-xs font-medium text-ink-secondary underline decoration-dotted underline-offset-2 transition-colors hover:text-ink-primary"
      >
        {showTable ? 'Hide table view' : 'View as table'}
      </button>

      {showTable && (
        <div className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 font-medium text-ink-secondary">Category</th>
                <th className="px-3 py-2 font-medium text-ink-secondary">Reports</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id} className={cn('border-b border-border last:border-0')}>
                  <td className="px-3 py-2 text-ink-primary">{d.label}</td>
                  <td className="px-3 py-2 font-mono text-ink-primary">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
