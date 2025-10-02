'use client'

/**
 * Client-side Firestore operations
 * Use these for development when Admin SDK credentials aren't available
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import { Child, Chapter, ListChaptersParams, RecapParams, RecapItem } from './types'

/**
 * Create or update a child profile (client-side)
 */
export async function upsertChildClient(
  child: Omit<Child, 'id' | 'createdAt'> & { id?: string },
  userId: string
): Promise<Child> {
  if (child.id) {
    // Update existing
    const childRef = doc(db, 'children', child.id)
    await updateDoc(childRef, {
      name: child.name,
      birthDate: child.birthDate,
    })

    const childDoc = await getDoc(childRef)
    return {
      id: child.id,
      ...childDoc.data(),
    } as Child
  } else {
    // Create new
    const childRef = await addDoc(collection(db, 'children'), {
      userId,
      name: child.name,
      birthDate: child.birthDate,
      createdAt: Timestamp.now(),
    })

    return {
      id: childRef.id,
      userId,
      name: child.name,
      birthDate: child.birthDate,
      createdAt: Timestamp.now() as any,
    }
  }
}

/**
 * Get children for a user (client-side)
 */
export async function getChildrenClient(userId: string): Promise<Child[]> {
  const q = query(
    collection(db, 'children'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Child[]
}

/**
 * Create a chapter (client-side)
 */
export async function createChapterClient(
  chapterData: Omit<Chapter, 'id'>
): Promise<Chapter> {
  const chapterRef = await addDoc(collection(db, 'chapters'), chapterData)

  return {
    id: chapterRef.id,
    ...chapterData,
  }
}

/**
 * Update a chapter (client-side)
 */
export async function updateChapterClient(
  chapterId: string,
  updates: Partial<Chapter>
): Promise<void> {
  const chapterRef = doc(db, 'chapters', chapterId)
  await updateDoc(chapterRef, updates)
}

/**
 * Get a chapter (client-side)
 */
export async function getChapterClient(
  chapterId: string,
  userId: string
): Promise<Chapter | null> {
  const chapterRef = doc(db, 'chapters', chapterId)
  const chapterDoc = await getDoc(chapterRef)

  if (!chapterDoc.exists()) {
    return null
  }

  const chapter = {
    id: chapterDoc.id,
    ...chapterDoc.data(),
  } as Chapter

  // Verify ownership
  if (chapter.userId !== userId) {
    throw new Error('Unauthorized')
  }

  return chapter
}

/**
 * List chapters (client-side)
 */
export async function listChaptersClient(
  params: ListChaptersParams,
  userId: string
): Promise<Chapter[]> {
  const { childId, pageSize = 20, after } = params

  let q = query(
    collection(db, 'chapters'),
    where('userId', '==', userId),
    where('childId', '==', childId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  )

  if (after) {
    const afterDoc = await getDoc(doc(db, 'chapters', after))
    if (afterDoc.exists()) {
      q = query(q, startAfter(afterDoc))
    }
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Chapter[]
}
