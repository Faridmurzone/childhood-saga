'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { getChildrenClient } from '@/lib/clientDb'
import { Child } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderChildSelectorProps {
  selectedChild: Child | null
  onChildSelected: (child: Child | null, shouldReload?: boolean) => void
  onAddNewChild: () => void
}

export function HeaderChildSelector({
  selectedChild,
  onChildSelected,
  onAddNewChild,
}: HeaderChildSelectorProps) {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    loadChildren()
  }, [user])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadChildren = async () => {
    if (!user) return

    try {
      const data = await getChildrenClient(user.uid)
      setChildren(data)

      // Load from localStorage if available (DON'T reload on initial load)
      const storedChildId = localStorage.getItem('selectedChildId')
      if (storedChildId && data.length > 0) {
        const child = data.find((c) => c.id === storedChildId)
        if (child && !selectedChild) {
          // Pass false for shouldReload - this is just initial load
          onChildSelected(child, false)
        }
      } else if (data.length > 0 && !selectedChild) {
        // Auto-select first child if none selected
        const firstChild = data[0]
        localStorage.setItem('selectedChildId', firstChild.id)
        onChildSelected(firstChild, false)
      }
    } catch (error) {
      console.error('Error loading children:', error)
    }
  }

  const handleSelectChild = (child: Child) => {
    setIsOpen(false)
    // Pass true for shouldReload - user explicitly selected a different child
    onChildSelected(child, true)
  }

  const handleAddNew = () => {
    setIsOpen(false)
    router.push('/child')
  }

  if (!selectedChild && children.length === 0) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        {selectedChild ? (
          <>
            <Avatar className="h-8 w-8">
              {selectedChild.avatarUrl && (
                <AvatarImage src={selectedChild.avatarUrl} alt={selectedChild.name} />
              )}
              <AvatarFallback className="text-sm">
                {selectedChild.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm hidden sm:inline">
              {selectedChild.name}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground">Select child</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => handleSelectChild(child)}
              className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors ${
                selectedChild?.id === child.id ? 'bg-accent/50' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                {child.avatarUrl && <AvatarImage src={child.avatarUrl} alt={child.name} />}
                <AvatarFallback className="text-sm">
                  {child.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{child.name}</div>
                {child.birthDate && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(child.birthDate).toLocaleDateString('es-AR')}
                  </div>
                )}
              </div>
            </button>
          ))}

          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={handleAddNew}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-primary"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Add/Edit Child</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
