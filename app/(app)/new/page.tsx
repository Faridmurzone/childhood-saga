'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { ThemeChips } from '@/components/ThemeChips'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createChapterWithAI } from '@/lib/chapterService'

export default function NewChapterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState('')
  const [seedText, setSeedText] = useState('')
  const [isForging, setIsForging] = useState(false)
  const [childId, setChildId] = useState<string | null>(null)

  useEffect(() => {
    // Get selected child from localStorage
    const storedChildId = localStorage.getItem('selectedChildId')
    if (!storedChildId) {
      router.push('/child')
    } else {
      setChildId(storedChildId)
    }
  }, [router])

  const handleForge = async () => {
    if (!user || !childId || !selectedTheme || !seedText.trim()) return

    setIsForging(true)

    try {
      const chapter = await createChapterWithAI(
        {
          childId,
          theme: selectedTheme,
          seedText: seedText.trim(),
        },
        user.uid
      )

      // Navigate to the new chapter
      router.push(`/chapter/${chapter.id}`)
    } catch (error) {
      console.error('Error forging chapter:', error)
      alert('Failed to forge chapter. Please try again.')
      setIsForging(false)
    }
  }

  const canForge = selectedTheme && seedText.trim().length > 0

  if (!childId) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Forge a New Chapter</h1>
        <p className="text-muted-foreground">
          Choose a theme and describe a special moment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Your Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeChips selected={selectedTheme} onSelect={setSelectedTheme} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Describe the Moment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Tell me about a special moment today... (e.g., 'We splashed water in the patio')"
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            rows={4}
            maxLength={160}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {seedText.length} / 160
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleForge}
          disabled={!canForge || isForging}
          className="min-w-[200px]"
        >
          {isForging ? (
            <span className="flex items-center gap-2">
              <span className="shimmer">Forging...</span>
            </span>
          ) : (
            'Forge Chapter'
          )}
        </Button>
      </div>

      {isForging && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Weaving your mythic tale with Claude Sonnet...</p>
          <p className="mt-1">This may take a moment</p>
        </div>
      )}
    </div>
  )
}
