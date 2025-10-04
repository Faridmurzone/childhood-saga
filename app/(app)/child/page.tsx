'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getChildrenClient, upsertChildClient } from '@/lib/clientDb'
import { Child } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Info, Pen, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ChildManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [description, setDescription] = useState('')
  const [context, setContext] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generatingAvatar, setGeneratingAvatar] = useState(false)

  useEffect(() => {
    loadChildren()
  }, [user])

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setName(child.name)
    setBirthDate(child.birthDate || '')
    setDescription(child.description || '')
    setContext(child.context || '')
    setPhotoPreview(child.avatarUrl || null)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingChild(null)
    setName('')
    setBirthDate('')
    setDescription('')
    setContext('')
    setPhoto(null)
    setPhotoPreview(null)
    setShowForm(true)
  }

  const handleSaveChild = async () => {
    if (!user || !name.trim()) return

    try {
      setSaving(true)
      let avatarUrl = editingChild?.avatarUrl || ''

      // Generate avatar if photo or description is provided (or changed)
      if (photo || (description && !editingChild?.avatarUrl)) {
        setGeneratingAvatar(true)
        const formData = new FormData()
        formData.append('userId', user.uid)
        formData.append('childName', name.trim())

        if (birthDate) {
          const age = Math.floor(
            (Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          )
          formData.append('childAge', age.toString())
        }

        if (description) {
          formData.append('description', description)
        }

        if (photo) {
          formData.append('photo', photo)
        }

        const response = await fetch('/api/generate-avatar', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          avatarUrl = data.avatarUrl
        }
        setGeneratingAvatar(false)
      }

      const childData = {
        id: editingChild?.id,
        userId: user.uid,
        name: name.trim(),
        birthDate: birthDate || undefined,
        description: description || undefined,
        context: context || undefined,
        avatarUrl: avatarUrl || undefined,
      }

      const savedChild = await upsertChildClient(childData, user.uid)

      // Update local state
      if (editingChild) {
        setChildren(children.map(c => c.id === savedChild.id ? savedChild : c))
      } else {
        setChildren([...children, savedChild])
      }

      // Reset form
      setShowForm(false)
      setEditingChild(null)
      setName('')
      setBirthDate('')
      setDescription('')
      setContext('')
      setPhoto(null)
      setPhotoPreview(null)
    } catch (error) {
      console.error('Error saving child:', error)
      alert('Failed to save child profile. Please try again.')
    } finally {
      setSaving(false)
      setGeneratingAvatar(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingChild(null)
    setName('')
    setBirthDate('')
    setDescription('')
    setContext('')
    setPhoto(null)
    setPhotoPreview(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Children</h1>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {!showForm && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Card
                key={child.id}
                className="group cursor-pointer transition-all hover:shadow-lg relative"
                onClick={() => handleEdit(child)}
              >
                {/* Edit icon on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                    <Pen className="h-4 w-4" />
                  </div>
                </div>

                <CardContent className="p-6 flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {child.avatarUrl && <AvatarImage src={child.avatarUrl} alt={child.name} />}
                    <AvatarFallback className="text-2xl">
                      {child.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{child.name}</h3>
                    {child.birthDate && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(child.birthDate).toLocaleDateString('es-AR')}
                      </p>
                    )}
                    {child.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {child.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card
              className="cursor-pointer border-dashed hover:bg-accent transition-all"
              onClick={handleAddNew}
            >
              <CardContent className="p-6 flex items-center justify-center h-full min-h-[120px]">
                <div className="text-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">Add New Child</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingChild ? `Edit ${editingChild.name}` : 'Add a New Child'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Privacy Notice</p>
                <p>
                  The photo you upload is not stored. We generate a cartoon avatar from it that will be used to illustrate the stories. This avatar will be saved and used as a reference for future illustrations.
                </p>
              </div>
            </div>

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

            <div>
              <label className="text-sm font-medium mb-1 block">
                Description (optional)
              </label>
              <Textarea
                placeholder="e.g., Manuel has blonde hair, is tall and always smiling"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/200
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Family Context (optional)
              </label>
              <Textarea
                placeholder="e.g., The child has two dads, lives with grandparents, etc."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {context.length}/200 - This context helps avoid inconsistencies in stories
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Photo (optional)
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editingChild && !photo
                      ? 'Upload a new photo to update the avatar'
                      : "We'll create an avatar from this photo"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveChild}
                disabled={!name.trim() || saving || generatingAvatar}
                className="flex-1"
              >
                {generatingAvatar
                  ? 'Generating Avatar...'
                  : saving
                  ? 'Saving...'
                  : editingChild
                  ? 'Update Child'
                  : 'Add Child'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving || generatingAvatar}
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
