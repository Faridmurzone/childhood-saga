'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { HeaderChildSelector } from '@/components/HeaderChildSelector'
import { Child } from '@/lib/types'

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleChildSelected = (child: Child | null, shouldReload: boolean = false) => {
    if (!child) return

    setSelectedChild(child)
    localStorage.setItem('selectedChildId', child.id)

    // Only reload if explicitly requested (from user clicking dropdown)
    if (shouldReload && selectedChild?.id !== child.id) {
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <h1 className="text-xl sm:text-2xl font-bold">Childhood Saga</h1>
            </Link>

            {/* Desktop: Forge New Chapter on the left */}
            <Link href="/new" className="hidden md:block">
              <Button variant="default">Forge New Chapter</Button>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <HeaderChildSelector
              selectedChild={selectedChild}
              onChildSelected={handleChildSelected}
              onAddNewChild={() => router.push('/child')}
            />
            <Link href="/dashboard">
              <Button variant="ghost">Hero&apos;s Book</Button>
            </Link>
            <Button variant="ghost" onClick={() => signOut()}>
              Sign Out
            </Button>
          </nav>

          {/* Mobile: Child Selector and Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <HeaderChildSelector
              selectedChild={selectedChild}
              onChildSelected={handleChildSelected}
              onAddNewChild={() => router.push('/child')}
            />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link href="/new" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  Forge New Chapter
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  Hero&apos;s Book
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
              >
                Sign Out
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AuthProvider>
  )
}
