import React from 'react'

interface SkeletonCardProps {
  className?: string
  lines?: number
}

export function SkeletonCard({ className = '', lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl bg-surface border border-border animate-pulse space-y-4 shadow-sm ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-border" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-border rounded-md w-1/3" />
          <div className="h-3 bg-border rounded-md w-1/4" />
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-border rounded-md"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}
export default SkeletonCard

