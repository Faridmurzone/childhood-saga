'use server'

import { adminDb } from './firestore'
import { textProvider } from './ai/textProvider'
import { imageProvider } from './ai/imageProvider'
import {
  Chapter,
  CreateChapterInput,
  ListChaptersParams,
  RecapParams,
  RecapItem,
  Child,
} from './types'

/**
 * Create a new chapter with AI-generated content
 */
export async function createChapter(
  input: CreateChapterInput,
  userId: string
): Promise<Chapter> {
  try {
    // Get child info to determine age
    const childDoc = await adminDb.collection('children').doc(input.childId).get()

    if (!childDoc.exists) {
      throw new Error('Child not found')
    }

    const childData = childDoc.data() as Child

    // Calculate age in months (approximate)
    let childAgeMonths = 36 // Default to 3 years
    if (childData.birthDate) {
      const birthDate = new Date(childData.birthDate)
      const now = new Date()
      childAgeMonths =
        (now.getFullYear() - birthDate.getFullYear()) * 12 +
        (now.getMonth() - birthDate.getMonth())
    }

    // Create initial chapter document with "generating" status
    const chapterRef = adminDb.collection('chapters').doc()
    const createdAt = new Date()

    const initialChapter: Omit<Chapter, 'id'> = {
      userId,
      childId: input.childId,
      theme: input.theme,
      seedText: input.seedText,
      createdAt: createdAt as any,
      mythTitle: '',
      mythText: '',
      tags: [],
      imageUrl: '',
      providerMeta: {},
      status: 'generating',
    }

    await chapterRef.set(initialChapter)

    // Generate myth text with Claude
    const mythResult = await textProvider.generateMyth({
      seedText: input.seedText,
      theme: input.theme,
      childAgeMonths,
      childName: childData.name,
    })

    // Generate image
    const imageResult = await imageProvider.generateImage({
      prompt: `${input.theme}: ${mythResult.title}`,
      theme: input.theme,
    })

    // Update chapter with generated content
    const updatedChapter: Omit<Chapter, 'id'> = {
      ...initialChapter,
      mythTitle: mythResult.title,
      mythText: mythResult.story,
      tags: mythResult.tags,
      imageUrl: imageResult.imageUrl,
      providerMeta: {
        text: mythResult,
        image: imageResult.providerMeta,
      },
      status: 'ready',
    }

    await chapterRef.update(updatedChapter)

    return {
      id: chapterRef.id,
      ...updatedChapter,
    }
  } catch (error) {
    console.error('Error creating chapter:', error)
    throw new Error('Failed to create chapter')
  }
}

/**
 * List chapters for a specific child with pagination
 */
export async function listChapters(
  params: ListChaptersParams,
  userId: string
): Promise<Chapter[]> {
  try {
    const { childId, pageSize = 20, after } = params

    let query = adminDb
      .collection('chapters')
      .where('userId', '==', userId)
      .where('childId', '==', childId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize)

    if (after) {
      const afterDoc = await adminDb.collection('chapters').doc(after).get()
      if (afterDoc.exists) {
        query = query.startAfter(afterDoc)
      }
    }

    const snapshot = await query.get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chapter[]
  } catch (error) {
    console.error('Error listing chapters:', error)
    throw new Error('Failed to list chapters')
  }
}

/**
 * Get a single chapter by ID
 */
export async function getChapter(
  chapterId: string,
  userId: string
): Promise<Chapter | null> {
  try {
    const doc = await adminDb.collection('chapters').doc(chapterId).get()

    if (!doc.exists) {
      return null
    }

    const chapter = { id: doc.id, ...doc.data() } as Chapter

    // Verify ownership
    if (chapter.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return chapter
  } catch (error) {
    console.error('Error getting chapter:', error)
    return null
  }
}

/**
 * List recap for a specific year (stub implementation)
 */
export async function listRecap(
  params: RecapParams,
  userId: string
): Promise<RecapItem[]> {
  try {
    const { childId, year } = params

    // Get chapters from the specified year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const snapshot = await adminDb
      .collection('chapters')
      .where('userId', '==', userId)
      .where('childId', '==', childId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        mythTitle: data.mythTitle,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt,
        theme: data.theme,
      }
    }) as RecapItem[]
  } catch (error) {
    console.error('Error listing recap:', error)
    throw new Error('Failed to list recap')
  }
}

/**
 * Create or update a child profile
 */
export async function upsertChild(
  child: Omit<Child, 'id' | 'createdAt'> & { id?: string },
  userId: string
): Promise<Child> {
  try {
    if (child.id) {
      // Update existing child
      const childRef = adminDb.collection('children').doc(child.id)
      const doc = await childRef.get()

      if (!doc.exists) {
        throw new Error('Child not found')
      }

      const existingChild = doc.data() as Child
      if (existingChild.userId !== userId) {
        throw new Error('Unauthorized')
      }

      await childRef.update({
        name: child.name,
        birthDate: child.birthDate,
      })

      return {
        id: child.id,
        ...child,
        userId,
        createdAt: existingChild.createdAt,
      } as Child
    } else {
      // Create new child
      const childRef = adminDb.collection('children').doc()
      const createdAt = new Date()

      const newChild: Omit<Child, 'id'> = {
        userId,
        name: child.name,
        birthDate: child.birthDate,
        createdAt: createdAt as any,
      }

      await childRef.set(newChild)

      return {
        id: childRef.id,
        ...newChild,
      }
    }
  } catch (error) {
    console.error('Error upserting child:', error)
    throw new Error('Failed to save child')
  }
}

/**
 * Get children for a user
 */
export async function getChildren(userId: string): Promise<Child[]> {
  try {
    const snapshot = await adminDb
      .collection('children')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Child[]
  } catch (error) {
    console.error('Error getting children:', error)
    throw new Error('Failed to get children')
  }
}
