'use client'

import { useEffect, useState } from 'react'
import { Star, Bird, Squirrel, PawPrint, Rabbit, Rocket, Book, Cloud, Ship, Moon } from 'lucide-react'

const loadingMessages = [
  "Searching for treasures in the pirate's chest...",
  "Following the secret map of the hidden island...",
  "Feeding cookies to the friendly dinosaur...",
  "Charging the robot's laughter batteries...",
  "Assembling fairy dust for the next story...",
  "Sailing across the ocean of chocolate waves...",
  "Building castles on the clouds of bedtime...",
  "Walking through the forest of talking trees...",
  "Collecting starlight from the space adventure...",
  "Sharpening the knight's crayons for the epic quest...",
  "Hiding clues under the magic school's library...",
  "Teaching a monster how to say goodnight...",
  "Polishing the pirate ship's golden telescope...",
  "Knocking on the door of the snowy world igloo...",
  "Drawing smiley faces on the moon's surface...",
  "Packing sandwiches for the city explorers...",
  "Unlocking the fairy garden's secret gate...",
  "Counting the rainbow steps to the dragon's cave..."
]

const icons = [Star, Bird, Squirrel, PawPrint, Rabbit, Rocket, Book, Cloud, Ship, Moon]

export function ForgingLoader() {
  const [message, setMessage] = useState('')
  const [IconComponent, setIconComponent] = useState<any>(null)

  const getRandomMessageAndIcon = () => {
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    const RandomIcon = icons[Math.floor(Math.random() * icons.length)]

    setMessage(randomMessage)
    setIconComponent(() => RandomIcon)
  }

  useEffect(() => {
    // Set initial message and icon
    getRandomMessageAndIcon()

    // Change message and icon every 3.5 seconds
    const interval = setInterval(() => {
      getRandomMessageAndIcon()
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  if (!IconComponent) return null

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center space-y-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-sky-bright/20 to-violet-gummy/20 rounded-full animate-ping" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-sky-bright to-violet-gummy rounded-full flex items-center justify-center animate-bounce">
              <IconComponent className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Shimmer Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold shimmer-text">Forging Your Chapter...</h2>
          <p className="text-lg text-slate-friendly/80">{message}</p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-sky-bright rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-sun-radiant rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-violet-gummy rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        <style jsx>{`
          .shimmer-text {
            background: linear-gradient(
              90deg,
              #5BC0EB 0%,
              #FFE66D 25%,
              #B28EEB 50%,
              #FFE66D 75%,
              #5BC0EB 100%
            );
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s linear infinite;
          }

          @keyframes shimmer {
            to {
              background-position: 200% center;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
