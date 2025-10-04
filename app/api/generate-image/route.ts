import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const dynamic = 'force-dynamic'

// Initialize Firebase Client SDK for storage uploads
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app
if (!getClientApps().length) {
  app = initializeClientApp(firebaseConfig)
} else {
  app = getClientApps()[0]
}

const storage = getStorage(app)

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
      console.warn('⚠️  GOOGLE_API_KEY not found. Using placeholder image.')
      return NextResponse.json({
        imageUrl: 'https://placehold.co/800x600/png?text=Chapter+Image',
        providerMeta: { provider: 'placeholder' },
      })
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
      ? `Create a colorful, whimsical, child-friendly illustration for toddlers (ages 2-4) in the style of children's book art. Theme: ${theme}. ${prompt}. USE THE PROVIDED REFERENCE IMAGE to depict the child character faithfully in the illustration. The character should match the appearance shown in the reference image. The image should be bright, cheerful, non-scary, with soft shapes and warm colors. Suitable for young children.`
      : `Create a colorful, whimsical, child-friendly illustration for toddlers (ages 2-4) in the style of children's book art. Theme: ${theme}. ${prompt}. The image should be bright, cheerful, non-scary, with soft shapes and warm colors. Suitable for young children.`

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

    // Upload to Firebase Storage in user's folder: userId/genimg/
    const fileName = `${userId}/genimg/${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const storageRef = ref(storage, fileName)

    await uploadBytes(storageRef, imageBuffer, {
      contentType: 'image/png',
    })

    const imageUrl = await getDownloadURL(storageRef)

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
