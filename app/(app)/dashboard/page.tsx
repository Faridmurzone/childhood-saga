'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { listChaptersClient } from '@/lib/clientDb'
import { Chapter } from '@/lib/types'
import { ConstellationGrid } from '@/components/ConstellationGrid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Filter } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [childId, setChildId] = useState<string | null>(null)

  useEffect(() => {
    // Get selected child from localStorage
    const storedChildId = localStorage.getItem('selectedChildId')
    setChildId(storedChildId)
  }, [])

  useEffect(() => {
    if (childId) {
      loadChapters()
    }
  }, [childId, user])

  const loadChapters = async () => {
    if (!user || !childId) {
      console.log('Cannot load chapters:', { user: !!user, childId })
      return
    }

    try {
      setLoading(true)
      const data = await listChaptersClient({ childId }, user.uid)
      setChapters(data)
    } catch (error) {
      console.error('Error loading chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique themes and tags
  const themes = Array.from(new Set(chapters.map((c) => c.theme)))
  const allTags = Array.from(
    new Set(chapters.flatMap((c) => c.tags))
  )

  // Filter chapters
  const filteredChapters = chapters.filter((chapter) => {
    if (selectedTheme && chapter.theme !== selectedTheme) return false
    if (selectedTag && !chapter.tags.includes(selectedTag)) return false
    return true
  })

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          No child selected
        </h2>
        <Link href="/child">
          <Button>Select a Child</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your Hero&apos;s Book...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">The Hero&apos;s Book</h1>
          <p className="text-muted-foreground mt-2">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} in the saga
          </p>
        </div>
        <Link href="/new">
          <Button size="lg">Forge New Chapter</Button>
        </Link>
      </div>

      {chapters.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Filter by Theme</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTheme === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTheme(null)}
              >
                All
              </Badge>
              {themes.map((theme) => (
                <Badge
                  key={theme}
                  variant={selectedTheme === theme ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTheme(theme)}
                >
                  {theme}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Filter by Tag</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTag === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.slice(0, 20).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConstellationGrid chapters={filteredChapters} />
    </div>
  )
}
