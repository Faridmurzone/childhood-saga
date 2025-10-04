'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error occurred:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/90 backdrop-blur-md border-white/20 shadow-xl">
        <div className="text-center space-y-6">
          {/* Error Image */}
          <div className="relative w-64 h-64 mx-auto">
            <Image
              src="/assets/error.png"
              alt="Oops! Something went wrong"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-friendly">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-slate-friendly/70">
              Our Wizard is busy fixing the problem and will be back soon.
            </p>
          </div>

          {/* Error Message (only in development or if not sensitive) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <p className="text-sm font-mono text-red-800 break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={reset}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Additional Help Text */}
          <p className="text-sm text-slate-friendly/60 pt-4">
            If this problem persists, please try refreshing the page or contact support.
          </p>
        </div>
      </Card>
    </div>
  )
}
