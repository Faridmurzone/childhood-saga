'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { getChildrenClient, upsertChildClient } from '@/lib/clientDb'
import { Child } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ChildSelectorProps {
  onChildSelected: (child: Child) => void
  selectedChildId?: string
}

export function ChildSelector({
  onChildSelected,
  selectedChildId,
}: ChildSelectorProps) {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadChildren()
  }, [user])

  useEffect(() => {
    // Load from localStorage if available
    const storedChildId = localStorage.getItem('selectedChildId')
    if (storedChildId && children.length > 0) {
      const child = children.find((c) => c.id === storedChildId)
      if (child) {
        onChildSelected(child)
      }
    }
  }, [children])

  const loadChildren = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getChildrenClient(user.uid)
      setChildren(data)
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChild = async () => {
    if (!user || !name.trim()) return

    try {
      setSaving(true)
      const newChild = await upsertChildClient(
        {
          userId: user.uid,
          name: name.trim(),
          birthDate: birthDate || undefined,
        },
        user.uid
      )

      setChildren([...children, newChild])
      setShowForm(false)
      setName('')
      setBirthDate('')
      handleSelectChild(newChild)
    } catch (error) {
      console.error('Error creating child:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectChild = (child: Child) => {
    localStorage.setItem('selectedChildId', child.id)
    onChildSelected(child)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {children.map((child) => (
          <Card
            key={child.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedChildId === child.id
                ? 'ring-2 ring-primary'
                : ''
            }`}
            onClick={() => handleSelectChild(child)}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {child.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{child.name}</h3>
                {child.birthDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(child.birthDate).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!showForm && (
          <Card
            className="cursor-pointer border-dashed hover:bg-accent transition-all"
            onClick={() => setShowForm(true)}
          >
            <CardContent className="p-6 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2">+</div>
                <div className="text-sm font-medium">Add Child</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add a New Child</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter child's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Birth Date (optional)
              </label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateChild}
                disabled={!name.trim() || saving}
              >
                {saving ? 'Saving...' : 'Add Child'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setName('')
                  setBirthDate('')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
