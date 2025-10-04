'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getThemePlaceholder } from '@/lib/themeImages'

interface ChapterImageProps {
  src: string
  alt: string
  theme: string
  className?: string
  fill?: boolean
  priority?: boolean
}

export function ChapterImage({ src, alt, theme, className = '', fill = false, priority = false }: ChapterImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const placeholderSrc = getThemePlaceholder(theme)

  return (
    <div className="relative w-full h-full">
      {/* Placeholder Image - Storybook Cover */}
      <Image
        src={placeholderSrc}
        alt={`${theme} storybook cover`}
        fill={fill}
        className={`object-cover transition-opacity duration-700 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        priority={priority}
      />

      {/* Actual Generated Image */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={`object-cover transition-all duration-700 ${
          imageLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-[1.02]'
        } ${className}`}
        onLoadingComplete={() => setImageLoaded(true)}
        priority={priority}
      />
    </div>
  )
}
