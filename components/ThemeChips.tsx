'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const THEMES = [
  'Fantasy',
  'Epic',
  'Space Adventure',
  'Forest Friends',
  'Ocean Wonders',
  'Dinosaur Time',
  'Kind Robots',
  'Magic School',
  'Fairy Garden',
  'Friendly Monsters',
  'Pirate Islands',
  'Snowy World',
  'City Explorers',
  'Cozy Bedtime',
] as const

export type Theme = (typeof THEMES)[number] | string

interface ThemeChipsProps {
  selected: string
  onSelect: (theme: string) => void
}

export function ThemeChips({ selected, onSelect }: ThemeChipsProps) {
  const [customTheme, setCustomTheme] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleCustomSubmit = () => {
    if (customTheme.trim()) {
      onSelect(customTheme.trim())
      setShowCustomInput(false)
    }
  }

  const isCustom = !THEMES.includes(selected as any) && selected !== ''

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => onSelect(theme)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              'border-2',
              selected === theme
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent border-border'
            )}
          >
            {theme}
          </button>
        ))}

        {!showCustomInput && !isCustom && (
          <button
            onClick={() => setShowCustomInput(true)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all border-2 border-dashed border-border hover:bg-accent"
          >
            + Custom
          </button>
        )}

        {isCustom && (
          <Badge
            variant="outline"
            className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground border-primary"
          >
            {selected}
          </Badge>
        )}
      </div>

      {showCustomInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom theme..."
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomSubmit()
              }
              if (e.key === 'Escape') {
                setShowCustomInput(false)
                setCustomTheme('')
              }
            }}
            className="max-w-xs"
            autoFocus
          />
          <button
            onClick={handleCustomSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowCustomInput(false)
              setCustomTheme('')
            }}
            className="px-4 py-2 border border-border rounded-md text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
