'use client'

import { useRef, useState } from 'react'
import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export function CopyField({ label, value, copyLabel, copiedLabel }: { label: string; value: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const textRef = useRef<HTMLElement>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      const node = textRef.current
      if (!node) return
      const range = document.createRange()
      range.selectNodeContents(node)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3.5 py-2.5">
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{label}</div>
        <code ref={textRef} className="block break-all font-mono text-sm text-fg">
          {value}
        </code>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`${copyLabel}: ${label}`}
        title={copied ? copiedLabel : copyLabel}
        className="inline-flex shrink-0 items-center rounded-lg p-2 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
      </button>
    </div>
  )
}
