'use client'

import { useEffect } from 'react'
import Image from 'next/image'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error occurred:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-bright/20 to-violet-gummy/20">
          <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-xl">
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
                <h1 className="text-4xl font-bold text-gray-900">
                  Oops! Something went wrong
                </h1>
                <p className="text-lg text-gray-600">
                  We encountered an unexpected error
                </p>
              </div>

              {/* Error Message (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-mono text-red-800 break-words">
                    {error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Go Home
                </a>
              </div>

              {/* Additional Help Text */}
              <p className="text-sm text-gray-500 pt-4">
                If this problem persists, please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
