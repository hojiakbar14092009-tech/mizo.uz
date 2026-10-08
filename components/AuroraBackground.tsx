'use client'

import React from 'react'

export function AuroraBackground() {
  return (
    <>
      <div className="grid-overlay" aria-hidden="true" />
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>
    </>
  )
}
export default AuroraBackground

