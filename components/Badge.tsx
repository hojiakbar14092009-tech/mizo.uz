import React, { ReactNode } from 'react'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  size?: 'sm' | 'md'
}

export function Badge({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-accent/15 text-accent border-accent/25',
    warning: 'bg-warning/15 text-warning border-warning/25',
    danger: 'bg-danger/15 text-danger border-danger/25',
    neutral: 'bg-border/60 text-muted border-border',
    info: 'bg-surface text-fg border-border',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
export default Badge
