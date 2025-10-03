'use client'

/**
 * Client-side chapter creation service with AI generation
 */

import { Timestamp } from 'firebase/firestore'
import { getDoc, doc } from 'firebase/firestore'
import { db } from './firebase'
import { textProvider } from './ai/textProvider'
import { imageProvider } from './ai/imageProvider'
import { createChapterClient, updateChapterClient } from './clientDb'
import { Chapter, CreateChapterInput, Child } from './types'

export async function createChapterWithAI(
  input: CreateChapterInput,
  userId: string
): Promise<Chapter> {
  try {
    // Get child info to determine age
    const childDoc = await getDoc(doc(db, 'children', input.childId))

    if (!childDoc.exists()) {
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
    const initialChapter: Omit<Chapter, 'id'> = {
      userId,
      childId: input.childId,
      theme: input.theme,
      seedText: input.seedText,
      createdAt: Timestamp.now() as any,
      mythTitle: '',
      mythText: '',
      tags: [],
      imageUrl: '',
      providerMeta: {},
      status: 'generating',
    }

    const chapter = await createChapterClient(initialChapter)

    // Generate myth text with Claude (runs in background)
    try {
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
      await updateChapterClient(chapter.id, {
        mythTitle: mythResult.title,
        mythText: mythResult.story,
        tags: mythResult.tags,
        imageUrl: imageResult.imageUrl,
        providerMeta: {
          text: mythResult,
          image: imageResult.providerMeta,
        },
        status: 'ready',
      })

      // Return updated chapter
      return {
        ...chapter,
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
    } catch (error) {
      console.error('Error generating content:', error)
      // Mark as failed
      await updateChapterClient(chapter.id, {
        status: 'failed',
      })
      throw error
    }
  } catch (error) {
    console.error('Error creating chapter:', error)
    throw new Error('Failed to create chapter')
  }
}
