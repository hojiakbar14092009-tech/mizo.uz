interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

const MARK = { sm: 'h-7 w-7 rounded-[9px]', md: 'h-9 w-9 rounded-[11px]', lg: 'h-11 w-11 rounded-[13px]' }
const TEXT = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' }

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  return (
    <span className={`mz-logo inline-flex items-center gap-2.5 select-none ${className}`}>
      <span className={`mz-logo-mark relative grid shrink-0 place-items-center border border-border bg-surface ${MARK[size]}`}>
        <svg viewBox="0 0 32 32" className="h-[72%] w-[72%]" fill="none" aria-hidden="true">
          <path
            className="mz-logo-m"
            d="M7 24V11.5L16 20l9-8.5V24"
            pathLength={1}
            stroke="var(--mz-accent)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="mz-logo-coin" cx="16" cy="7.5" r="2.6" fill="var(--mz-gold)" />
        </svg>
      </span>
      {showText && <span className={`font-black tracking-tight text-fg ${TEXT[size]}`}>Mizo</span>}
    </span>
  )
}
export default Logo
