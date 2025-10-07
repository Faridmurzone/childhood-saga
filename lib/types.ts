import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'

export interface User {
  id: string
  displayName?: string
  email: string
  createdAt: FirestoreTimestamp
}

export interface Child {
  id: string
  userId: string
  name: string
  birthDate?: string
  description?: string
  context?: string
  avatarUrl?: string
  createdAt: FirestoreTimestamp
}

export type ChapterStatus = 'generating' | 'ready' | 'failed'
export type ChapterVisibility = 'private' | 'public'

export interface Chapter {
  id: string
  userId: string
  childId: string
  theme: string
  seedText: string
  createdAt: FirestoreTimestamp
  mythTitle: string
  mythText: string
  tags: string[]
  imageUrl: string
  providerMeta: {
    text?: any
    image?: any
  }
  status: ChapterStatus
  visibility?: ChapterVisibility
}

export interface CreateChapterInput {
  childId: string
  theme: string
  seedText: string
}

export interface ListChaptersParams {
  childId: string
  pageSize?: number
  after?: string
}

export interface RecapParams {
  childId: string
  year: number
}

export interface RecapItem {
  id: string
  mythTitle: string
  imageUrl: string
  createdAt: FirestoreTimestamp
  theme: string
}
