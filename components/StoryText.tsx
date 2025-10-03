'use client'

import { useEffect, useRef } from 'react'

interface StoryTextProps {
  text: string
  staggerMs?: number
}

export function StoryText({ text, staggerMs = 100 }: StoryTextProps) {
  const sentenceRefs = useRef<(HTMLParagraphElement | null)[]>([])

  // Split text into sentences using robust regex
  // Matches sentences ending with . ! ? … followed by optional quotes and whitespace
  const sentences = text
    .split(/(?<=[.!?…]["']?)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true')
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element fully enters viewport
      }
    )

    sentenceRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sentences])

  return (
    <div className="space-y-6">
      {sentences.map((sentence, index) => (
        <p
          key={index}
          ref={(el) => {
            sentenceRefs.current[index] = el
          }}
          className="text-2xl leading-relaxed text-slate-friendly sentence-fade-in"
          style={{
            transitionDelay: `${index * staggerMs}ms`,
          }}
          data-visible="false"
        >
          {sentence}
        </p>
      ))}

      <style jsx>{`
        .sentence-fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .sentence-fade-in[data-visible='true'] {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
