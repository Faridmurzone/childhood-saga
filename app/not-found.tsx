'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/90 backdrop-blur-md border-white/20 shadow-xl">
        <div className="text-center space-y-6">
          {/* 404 Image */}
          <div className="relative w-64 h-64 mx-auto">
            <Image
              src="/assets/404.png"
              alt="Page not found"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-slate-friendly">
              404
            </h1>
            <h2 className="text-3xl font-bold text-slate-friendly">
              Page Not Found
            </h2>
            <p className="text-lg text-slate-friendly/70">
              The map seems to be leading you in the wrong direction.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Additional Help Text */}
          <p className="text-sm text-slate-friendly/60 pt-4">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>
      </Card>
    </div>
  )
}
