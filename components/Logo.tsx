import React from 'react'
import { ScaleIcon } from '@heroicons/react/24/outline'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const pixelSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7'
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="text-accent flex-shrink-0 transition-transform duration-300 hover:rotate-6">
        <ScaleIcon className={pixelSize} />
      </div>

      {showText && (
        <span className={`font-black tracking-tight text-fg ${textSize}`}>
          Mizo
        </span>
      )}
    </div>
  )
}
export default Logo
