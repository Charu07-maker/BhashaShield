export function niceMax(value: number): number {
  if (value <= 0) return 10
  if (value <= 10) return Math.ceil(value / 2) * 2
  if (value <= 50) return Math.ceil(value / 5) * 5
  if (value <= 200) return Math.ceil(value / 10) * 10
  return Math.ceil(value / 50) * 50
}

interface ValuePoint {
  value: number
}

export function buildLinePath(
  data: ValuePoint[],
  xAt: (i: number) => number,
  yAt: (v: number) => number,
): string {
  return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)},${yAt(d.value)}`).join(' ')
}

export function buildAreaPath(
  data: ValuePoint[],
  xAt: (i: number) => number,
  yAt: (v: number) => number,
  baselineY: number,
): string {
  if (data.length === 0) return ''
  const top = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)},${yAt(d.value)}`).join(' ')
  const last = data.length - 1
  return `${top} L ${xAt(last)},${baselineY} L ${xAt(0)},${baselineY} Z`
}
