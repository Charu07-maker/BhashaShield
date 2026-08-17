import { Select } from '../ui/Select'
import { DATE_RANGE_OPTIONS, TREND_CATEGORIES } from '../../data/trendsData'

interface TrendsFilterRowProps {
  dateRangeId: string
  onDateRangeChange: (id: string) => void
  categoryId: string
  onCategoryChange: (id: string) => void
}

export function TrendsFilterRow({
  dateRangeId,
  onDateRangeChange,
  categoryId,
  onCategoryChange,
}: TrendsFilterRowProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:w-48">
        <Select
          value={dateRangeId}
          onChange={(e) => onDateRangeChange(e.target.value)}
          aria-label="Date range"
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-56">
        <Select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Scam category"
        >
          <option value="all">All categories</option>
          {TREND_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
