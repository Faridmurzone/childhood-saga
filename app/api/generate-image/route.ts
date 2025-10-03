import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { adminStorage } from '@/lib/firebaseServer'

export async function POST(request: NextRequest) {
  try {
    const { prompt, theme } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
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
    const enhancedPrompt = `Create a colorful, whimsical, child-friendly illustration for toddlers (ages 2-4) in the style of children's book art. Theme: ${theme}. ${prompt}. The image should be bright, cheerful, non-scary, with soft shapes and warm colors. Suitable for young children.`

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
    ]

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
    if (!adminStorage) {
      throw new Error('Firebase Admin Storage not initialized')
    }

    const fileName = `chapters/${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const bucket = adminStorage.bucket()
    const file = bucket.file(fileName)

    await file.save(imageBuffer, {
      contentType: 'image/png',
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: Math.random().toString(36).substring(7),
        },
      },
    })

    // Make the file publicly accessible
    await file.makePublic()

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

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
