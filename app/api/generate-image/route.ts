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
    const { prompt, theme, userId, avatarUrl } = await request.json()

    if (!prompt || !userId) {
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

    const ai = new GoogleGenAI({
      apiKey,
    })

    const config = {
      responseModalities: ['IMAGE'],
    }

    const model = 'gemini-2.5-flash-image'

    // Enhanced prompt for toddler-friendly, colorful, whimsical illustrations
    const enhancedPrompt = avatarUrl
      ? `Create a colorful, whimsical, child-friendly illustration for toddlers (ages 2-4) in the style of children's book art. Theme: ${theme}. ${prompt}. USE THE PROVIDED REFERENCE IMAGE to depict the child character faithfully in the illustration. The character should match the appearance shown in the reference image. The image should be bright, cheerful, non-scary, with soft shapes and warm colors. Suitable for young children. Never put text in the image.`
      : `Create a colorful, whimsical, child-friendly illustration for toddlers (ages 2-4) in the style of children's book art. Theme: ${theme}. ${prompt}. The image should be bright, cheerful, non-scary, with soft shapes and warm colors. Suitable for young children. Never put text in the image.`

    let contents: any[] = []

    // If avatar is provided, fetch it and include as reference image
    if (avatarUrl) {
      try {
        const avatarResponse = await fetch(avatarUrl)
        const avatarBuffer = await avatarResponse.arrayBuffer()
        const avatarBase64 = Buffer.from(avatarBuffer).toString('base64')

        contents = [
          {
            role: 'user',
            parts: [
              {
                text: enhancedPrompt,
              },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: avatarBase64,
                },
              },
            ],
          },
        ]
      } catch (error) {
        console.error('Error fetching avatar for reference:', error)
        // Fall back to text-only prompt
        contents = [
          {
            role: 'user',
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
        ]
      }
    } else {
      contents = [
        {
          role: 'user',
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ]
    }

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
    const fileName = `${userId}/genimg/${Date.now()}-${Math.random().toString(36).substring(7)}.png`
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

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`

    return NextResponse.json({
      imageUrl,
      providerMeta: {
        provider: 'gemini-2.5-flash-image',
        prompt: enhancedPrompt,
        storagePath: fileName,
      },
    })
  } catch (error) {
    console.error('Error generating image with Gemini:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
