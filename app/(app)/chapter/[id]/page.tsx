'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getChapterClient } from '@/lib/clientDb'
import { Chapter } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Share2 } from 'lucide-react'
import { getThemeBackground } from '@/lib/themeBackgrounds'
import { StoryText } from '@/components/StoryText'
import { ChapterImage } from '@/components/ChapterImage'

export default function ChapterDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChapter()
  }, [params.id, user])

  useEffect(() => {
    // Set background based on chapter theme
    if (chapter) {
      const backgroundUrl = getThemeBackground(chapter.theme)
      document.body.style.backgroundImage = `url(${backgroundUrl})`
    }

    // Cleanup: restore default background when unmounting
    return () => {
      document.body.style.backgroundImage = 'url(/assets/default.png)'
    }
  }, [chapter])

  const loadChapter = async () => {
    if (!user || !params.id) return

    try {
      setLoading(true)
      const data = await getChapterClient(params.id as string, user.uid)
      setChapter(data)
    } catch (error) {
      console.error('Error loading chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: chapter?.mythTitle,
        text: `Check out this mythic chapter: ${chapter?.mythTitle}`,
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading chapter...</div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chapter not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between bg-white/90 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-friendly">{chapter.mythTitle}</h1>
          <div className="flex flex-wrap gap-2">
            {chapter.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-slate-friendly/70">
            {chapter.createdAt?.toDate ?
              chapter.createdAt.toDate().toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) :
              'Fecha no disponible'
            }
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden bg-white/90 backdrop-blur-md border-white/20">
        <div className="relative aspect-[16/9] w-full">
          <ChapterImage
            src={chapter.imageUrl}
            alt={chapter.mythTitle}
            theme={chapter.theme}
            fill
            priority
          />
        </div>
      </Card>

      <Card className="p-8 bg-white/90 backdrop-blur-md border-white/20">
        <StoryText text={chapter.mythText} staggerMs={100} />
      </Card>

      <div className="text-center text-sm bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <p className="text-slate-friendly/70">Seed: &quot;{chapter.seedText}&quot;</p>
        <p className="mt-1 text-slate-friendly/70">Theme: {chapter.theme}</p>
      </div>
    </div>
  )
}
