import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import * as admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim()) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
        storageBucket,
      })
    } catch (error) {
      admin.initializeApp({ projectId, storageBucket })
    }
  } else {
    admin.initializeApp({ projectId, storageBucket })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const childName = formData.get('childName') as string
    const childAge = formData.get('childAge') as string
    const description = formData.get('description') as string
    const photoFile = formData.get('photo') as File | null

    if (!userId || !childName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      console.error('⚠️  GOOGLE_API_KEY not found.')
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY not configured' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    let prompt = ''
    let contents: any[] = []

    if (photoFile) {
      // Generate avatar from photo
      const photoBytes = await photoFile.arrayBuffer()
      const photoBase64 = Buffer.from(photoBytes).toString('base64')

      prompt = `Create a cute, child-friendly cartoon avatar based on this photo.
The avatar should be colorful, whimsical, and suitable for children's storybooks.
Style: Digital illustration, soft colors, friendly and happy expression.
If the photo is not of a child or person, create a random cute character based on the name "${childName}", age ${childAge}, use something from this description: ${description || 'a cheerful child'}.`

      contents = [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: photoFile.type,
                data: photoBase64,
              },
            },
          ],
        },
      ]
    } else {
      // Generate avatar from description only
      prompt = `Create a cute, child-friendly cartoon avatar for a character named "${childName}", age ${childAge}.
Description: ${description || 'a cheerful, happy child'}
Style: Colorful digital illustration, whimsical, suitable for children's storybooks, friendly and happy expression.`

      contents = [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ]
    }

    const config = {
      responseModalities: ['IMAGE'],
    }

    const model = 'gemini-2.5-flash-image'

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    let imageBuffer: Buffer | null = null

    // Collect the image data from the stream
    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue
      }

      const inlineData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData
      if (inlineData?.data) {
        imageBuffer = Buffer.from(inlineData.data, 'base64')
        break
      }
    }

    if (!imageBuffer) {
      throw new Error('No image data received from Gemini')
    }

    // Upload to Firebase Storage using Admin SDK
    const now = new Date()
    const timestamp = now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')

    const sanitizedName = childName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const fileName = `${userId}/avatar/${timestamp}_${sanitizedName}_avatar.png`
    const bucket = admin.storage().bucket()
    const file = bucket.file(fileName)

    await file.save(imageBuffer, {
      contentType: 'image/png',
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: crypto.randomUUID(),
        },
      },
    })

    const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`

    return NextResponse.json({
      avatarUrl,
      providerMeta: {
        provider: 'gemini-2.5-flash-image',
        prompt,
      },
    })
  } catch (error) {
    console.error('Error generating avatar with Gemini:', error)
    return NextResponse.json(
      { error: 'Failed to generate avatar' },
      { status: 500 }
    )
  }
}
