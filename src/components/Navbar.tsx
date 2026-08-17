import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ShieldHalf,
  AlertOctagon,
  MessageSquareWarning,
  Link2,
  PhoneCall,
  UploadCloud,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/utils'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Text/SMS', to: '/text-checker', icon: MessageSquareWarning },
  { label: 'Link', to: '/link-checker', icon: Link2 },
  { label: 'Call/Digital Arrest', to: '/call-shield', icon: PhoneCall },
  { label: 'Upload Call', to: '/recorded-call', icon: UploadCloud },
  { label: 'Trends', to: '/trends', icon: TrendingUp },
]

const LONG_PRESS_MS = 500

function FloatingPillNav({ scrolled }: { scrolled: boolean }) {
  const location = useLocation()
  const containerRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const touchTimers = useRef<Record<string, number>>({})
  const longPressFired = useRef<Record<string, boolean>>({})

  const [hoveredTo, setHoveredTo] = useState<string | null>(null)
  const [tooltipTo, setTooltipTo] = useState<string | null>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 })

  const activeTo =
    NAV_ITEMS.find((item) => location.pathname === item.to)?.to ??
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to + '/'))?.to ??
    null

  const targetTo = hoveredTo ?? activeTo

  const recompute = useCallback(() => {
    const el = targetTo ? itemRefs.current[targetTo] : null
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      setIndicator({ left: rect.left - containerRect.left, width: rect.width, opacity: 1 })
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }))
    }
  }, [targetTo])

  useLayoutEffect(() => {
    recompute()
  }, [recompute])

  useEffect(() => {
    const handleResize = () => recompute()
    window.addEventListener('resize', handleResize)
    let observer: ResizeObserver | undefined
    if (containerRef.current && 'ResizeObserver' in window) {
      observer = new ResizeObserver(() => recompute())
      observer.observe(containerRef.current)
    }
    return () => {
      window.removeEventListener('resize', handleResize)
      observer?.disconnect()
    }
  }, [recompute])

  const handleTouchStart = (to: string) => {
    longPressFired.current[to] = false
    touchTimers.current[to] = window.setTimeout(() => {
      longPressFired.current[to] = true
      setTooltipTo(to)
    }, LONG_PRESS_MS)
  }

  const clearTouch = (to: string) => {
    window.clearTimeout(touchTimers.current[to])
  }

  const handleTouchEnd = (to: string) => {
    clearTouch(to)
    if (longPressFired.current[to]) {
      window.setTimeout(() => setTooltipTo(null), 1100)
    }
  }

  const handleClick = (to: string, e: React.MouseEvent) => {
    if (longPressFired.current[to]) {
      e.preventDefault()
      longPressFired.current[to] = false
    }
  }

  return (
    <nav
      ref={containerRef}
      onMouseLeave={() => setHoveredTo(null)}
      aria-label="Detection modules"
      className={cn(
        'relative flex items-center gap-0.5 rounded-full border border-border bg-panel/85 shadow-lg backdrop-blur-md',
        'transition-[height,background-color,padding] duration-300 ease-emphasized',
        scrolled ? 'h-12 bg-panel/95 px-1.5 shadow-xl' : 'h-14 px-2',
      )}
    >
      <span
        className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-accent transition-all duration-300 ease-emphasized"
        style={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
      />
      {NAV_ITEMS.map((item) => {
        const isTarget = item.to === targetTo
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            ref={(el) => {
              itemRefs.current[item.to] = el
            }}
            onMouseEnter={() => setHoveredTo(item.to)}
            onFocus={() => setHoveredTo(item.to)}
            onBlur={() => setHoveredTo(null)}
            onTouchStart={() => handleTouchStart(item.to)}
            onTouchEnd={() => handleTouchEnd(item.to)}
            onTouchMove={() => clearTouch(item.to)}
            onClick={(e) => handleClick(item.to, e)}
            className={cn(
              'group/item relative z-10 flex min-w-[44px] shrink-0 items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-full px-2.5 text-sm font-medium transition-colors duration-200 md:min-w-0 md:justify-start md:px-3.5',
              isTarget ? 'text-white' : 'text-ink-secondary hover:text-ink-primary',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            <span className="sr-only md:not-sr-only md:inline">{item.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-raised px-2.5 py-1 text-xs font-medium text-ink-primary shadow-panel transition-opacity duration-150 md:hidden',
                tooltipTo === item.to
                  ? 'opacity-100'
                  : 'opacity-0 group-hover/item:opacity-100 group-focus-visible/item:opacity-100',
              )}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 animate-fade-in px-3 pt-4 sm:px-6 sm:pt-6">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="z-20 flex shrink-0 items-center gap-2 drop-shadow-sm sm:gap-2.5"
        >
          <ShieldHalf className="h-6 w-6 shrink-0 text-accent" strokeWidth={2.25} />
          <span className="hidden font-display text-lg font-semibold tracking-tight text-ink-primary sm:inline">
            ShieldBhasha
          </span>
        </Link>

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <FloatingPillNav scrolled={scrolled} />
        </div>

        <Link
          to="/report"
          aria-label="Report a scam now"
          className={cn(
            'z-20 flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-danger font-semibold text-white',
            'shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_4px_16px_rgba(239,68,68,0.25)]',
            'transition-all duration-200 ease-emphasized hover:brightness-90 active:scale-[0.98]',
            scrolled ? 'px-3.5 py-2.5 text-sm' : 'px-4 py-3 text-sm',
          )}
        >
          <AlertOctagon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          <span className="hidden sm:inline">Report Now</span>
        </Link>
      </div>
    </header>
  )
}
