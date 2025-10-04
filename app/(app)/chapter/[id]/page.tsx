'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getChapterClient, updateChapterClient } from '@/lib/clientDb'
import { Chapter } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Share2, Pen, X } from 'lucide-react'
import { getThemeBackground } from '@/lib/themeBackgrounds'
import { StoryText } from '@/components/StoryText'
import { ChapterImage } from '@/components/ChapterImage'

export default function ChapterDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editStory, setEditStory] = useState('')
  const [saving, setSaving] = useState(false)

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

  const handleEdit = () => {
    if (chapter) {
      setEditTitle(chapter.mythTitle)
      setEditStory(chapter.mythText)
      setIsEditModalOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!chapter || !editTitle.trim() || !editStory.trim()) return

    try {
      setSaving(true)
      await updateChapterClient(chapter.id, {
        mythTitle: editTitle.trim(),
        mythText: editStory.trim(),
      })

      // Update local state immediately
      setChapter({
        ...chapter,
        mythTitle: editTitle.trim(),
        mythText: editStory.trim(),
      })

      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Error updating chapter:', error)
      alert('Failed to update chapter. Please try again.')
    } finally {
      setSaving(false)
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleEdit}>
            <Pen className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Chapter</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  disabled={saving}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Chapter title"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Story <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  placeholder="Chapter story"
                  rows={12}
                  disabled={saving}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || !editStory.trim() || saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
