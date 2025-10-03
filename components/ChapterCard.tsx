'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Chapter } from '@/lib/types'

interface ChapterCardProps {
  chapter: Chapter
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Link href={`/chapter/${chapter.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={chapter.imageUrl}
            alt={chapter.mythTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {chapter.mythTitle}
          </h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {chapter.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {chapter.createdAt?.toDate ?
              chapter.createdAt.toDate().toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) :
              'Fecha no disponible'
            }
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
