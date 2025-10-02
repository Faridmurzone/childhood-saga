'use client'

import { useRef, useEffect, useState } from 'react'
import { Chapter } from '@/lib/types'
import { ChapterCard } from './ChapterCard'

interface ConstellationGridProps {
  chapters: Chapter[]
}

export function ConstellationGrid({ chapters }: ConstellationGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [connections, setConnections] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([])

  useEffect(() => {
    if (!containerRef.current || chapters.length < 2) return

    const calculateConnections = () => {
      const container = containerRef.current
      if (!container) return

      const cards = container.querySelectorAll('[data-chapter-id]')
      const newConnections: Array<{ x1: number; y1: number; x2: number; y2: number }> = []

      const containerRect = container.getBoundingClientRect()

      for (let i = 0; i < cards.length - 1; i++) {
        const card1 = cards[i] as HTMLElement
        const card2 = cards[i + 1] as HTMLElement

        const rect1 = card1.getBoundingClientRect()
        const rect2 = card2.getBoundingClientRect()

        // Calculate center points relative to container
        const x1 = rect1.left - containerRect.left + rect1.width / 2
        const y1 = rect1.top - containerRect.top + rect1.height / 2
        const x2 = rect2.left - containerRect.left + rect2.width / 2
        const y2 = rect2.top - containerRect.top + rect2.height / 2

        newConnections.push({ x1, y1, x2, y2 })
      }

      setConnections(newConnections)
    }

    // Calculate on mount and when window resizes
    calculateConnections()
    window.addEventListener('resize', calculateConnections)

    return () => {
      window.removeEventListener('resize', calculateConnections)
    }
  }, [chapters])

  if (chapters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-muted-foreground">
            No chapters yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Forge your first mythic chapter to begin the saga
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* SVG overlay for constellation lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ minHeight: '100%' }}
      >
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="text-border opacity-30"
          />
        ))}
      </svg>

      {/* Grid of chapter cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {chapters.map((chapter) => (
          <div key={chapter.id} data-chapter-id={chapter.id}>
            <ChapterCard chapter={chapter} />
          </div>
        ))}
      </div>
    </div>
  )
}
