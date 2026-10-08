'use client'

import { useEffect, useRef } from 'react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  ChartBarIcon,
  ChartPieIcon,
  CircleStackIcon,
  CreditCardIcon,
  PresentationChartLineIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ShieldCheckIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

interface Floater {
  Icon: Icon
  top: string
  left: string
  size: number
  depth: number
  dur: number
  delay: number
  gold?: boolean
  scale?: boolean
  desktopOnly?: boolean
}

const FLOATERS: Floater[] = [
  { Icon: ScaleIcon, top: '14%', left: '6%', size: 76, depth: 26, dur: 7, delay: 0, scale: true },
  { Icon: ChartBarIcon, top: '9%', left: '78%', size: 52, depth: 18, dur: 19, delay: -4 },
  { Icon: CircleStackIcon, top: '36%', left: '91%', size: 40, depth: 30, dur: 16, delay: -9, gold: true },
  { Icon: CalculatorIcon, top: '62%', left: '4%', size: 46, depth: 22, dur: 21, delay: -2 },
  { Icon: ArrowTrendingUpIcon, top: '78%', left: '84%', size: 58, depth: 14, dur: 17, delay: -6 },
  { Icon: BanknotesIcon, top: '86%', left: '18%', size: 50, depth: 28, dur: 23, delay: -11, gold: true },
  { Icon: ChartPieIcon, top: '44%', left: '58%', size: 36, depth: 34, dur: 15, delay: -3, desktopOnly: true },
  { Icon: BuildingLibraryIcon, top: '22%', left: '46%', size: 34, depth: 12, dur: 24, delay: -8, desktopOnly: true },
  { Icon: ShieldCheckIcon, top: '68%', left: '64%', size: 38, depth: 20, dur: 20, delay: -13, desktopOnly: true },
  { Icon: WalletIcon, top: '52%', left: '24%', size: 34, depth: 16, dur: 22, delay: -5, desktopOnly: true },
  { Icon: ReceiptPercentIcon, top: '6%', left: '30%', size: 32, depth: 24, dur: 18, delay: -10, gold: true, desktopOnly: true },
  { Icon: CreditCardIcon, top: '90%', left: '52%', size: 40, depth: 18, dur: 19, delay: -7, desktopOnly: true },
  { Icon: PresentationChartLineIcon, top: '30%', left: '70%', size: 44, depth: 10, dur: 25, delay: -12, desktopOnly: true },
  { Icon: ScaleIcon, top: '72%', left: '40%', size: 30, depth: 32, dur: 6, delay: -3, gold: true, scale: true, desktopOnly: true },
]

export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight * 0.3

    const apply = () => {
      frame = 0
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
      el.style.setProperty('--px', ((x / window.innerWidth) * 2 - 1).toFixed(3))
      el.style.setProperty('--py', ((y / window.innerHeight) * 2 - 1).toFixed(3))
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(apply)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} className="mz-backdrop" aria-hidden="true">
      <div className="mz-wash" />
      <div className="mz-grid" />
      <div className="mz-spot" />

      <svg className="mz-curve absolute inset-x-0 bottom-0 h-[45vh] w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" fill="none">
        <path
          d="M0 360 C 160 350, 240 300, 360 310 S 560 250, 680 240 S 880 190, 1000 170 S 1220 90, 1440 40"
          pathLength={1}
          stroke="var(--mz-accent)"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 380 C 200 375, 320 345, 480 340 S 760 300, 900 285 S 1180 230, 1440 190"
          pathLength={1}
          stroke="var(--mz-gold)"
          strokeOpacity="0.16"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {FLOATERS.map(({ Icon, top, left, size, depth, dur, delay, gold, scale, desktopOnly }, i) => (
        <div
          key={i}
          className={`mz-ic ${scale ? 'is-scale' : ''} ${desktopOnly ? 'hidden md:block' : ''}`}
          style={
            {
              top,
              left,
              width: size,
              height: size,
              color: gold ? 'var(--mz-gold)' : 'var(--mz-accent)',
              '--depth': depth,
              '--dur': `${dur}s`,
              '--delay': `${delay}s`,
            } as CSSProperties
          }
        >
          <Icon />
        </div>
      ))}
    </div>
  )
}
