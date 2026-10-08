'use client'

import React, { InputHTMLAttributes, ReactNode } from 'react'

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string | null
  icon?: ReactNode
  helperText?: string
}

export function InputField({
  label,
  name,
  type = 'text',
  error,
  icon,
  helperText,
  value,
  onChange,
  className = '',
  id,
  ...props
}: InputFieldProps) {
  const inputId = id || name

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between"
      >
        <span>{label}</span>
      </label>

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border bg-surface text-fg placeholder:text-muted/60 py-2.5 text-sm outline-none transition-all duration-150 ${
            icon ? 'pl-11 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-danger ring-1 ring-danger/30 focus:border-danger focus:ring-2 focus:ring-danger/40'
              : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/40'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-danger transition-all duration-150 flex items-center gap-1 mt-0.5">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}
export default InputField
