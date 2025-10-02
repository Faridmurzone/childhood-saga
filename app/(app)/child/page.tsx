'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChildSelector } from '@/components/ChildSelector'
import { Child } from '@/lib/types'
import { Button } from '@/components/ui/button'

export default function ChildPage() {
  const router = useRouter()
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)

  const handleChildSelected = (child: Child) => {
    setSelectedChild(child)
  }

  const handleContinue = () => {
    if (selectedChild) {
      router.push('/new')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Select Your Little Hero</h1>
        <p className="text-muted-foreground">
          Choose or create a profile for the star of today&apos;s saga
        </p>
      </div>

      <ChildSelector
        onChildSelected={handleChildSelected}
        selectedChildId={selectedChild?.id}
      />

      {selectedChild && (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleContinue}>
            Continue to Forge a Chapter
          </Button>
        </div>
      )}
    </div>
  )
}
