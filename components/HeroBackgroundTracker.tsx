'use client'

import { useEffect, useRef, useState } from 'react'

export function HeroBackgroundTracker() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      const distance = Math.max(-60, Math.min(60, x / 15))
      setMousePos({ x: distance, y: Math.max(-60, Math.min(60, y / 15)) })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      style={{
        backgroundPosition: `${mousePos.x}px ${mousePos.y}px`,
        transition: 'background-position 0.3s ease-out',
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at ${50 + mousePos.x / 2}% ${50 + mousePos.y / 2}%, rgba(96, 165, 250, 0.15) 0%, transparent 70%)`,
          transition: 'all 0.4s ease-out',
        }}
      />

      {/* Floating shapes */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* Floating circles */}
        <circle cx="100" cy="100" r="40" fill="url(#grad1)" filter="url(#blur)">
          <animate attributeName="cy" values="100;150;100" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="6s" repeatCount="indefinite" />
        </circle>

        <circle cx="1100" cy="500" r="60" fill="#10b981" opacity="0.1" filter="url(#blur)">
          <animate attributeName="cy" values="500;450;500" dur="8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="8s" repeatCount="indefinite" />
        </circle>

        <circle cx="600" cy="50" r="50" fill="#a78bfa" opacity="0.1" filter="url(#blur)">
          <animate attributeName="cx" values="600;650;600" dur="7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.08;0.25;0.08" dur="7s" repeatCount="indefinite" />
        </circle>

        <circle cx="200" cy="500" r="35" fill="#60a5fa" opacity="0.1" filter="url(#blur)">
          <animate attributeName="r" values="35;50;35" dur="5s" repeatCount="indefinite" />
        </circle>

        <circle cx="1000" cy="100" r="45" fill="#10b981" opacity="0.1" filter="url(#blur)">
          <animate attributeName="cy" values="100;80;100" dur="9s" repeatCount="indefinite" />
        </circle>

        <circle cx="400" cy="300" r="25" fill="#a78bfa" opacity="0.1" filter="url(#blur)">
          <animate attributeName="r" values="25;40;25" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96, 165, 250, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  )
}
