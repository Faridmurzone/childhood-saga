import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `
  You are a gentle storyteller for toddlers (ages 2–4).
  Write in warm, simple English, between 150–300 words, filled with cozy wonder.
  Avoid fear, violence, or harsh conflict. Use concrete, kind, and imaginative imagery.
  Stories should feel calm, safe, and magical—like bedtime tales full of love and curiosity.
`

export async function POST(request: NextRequest) {
  try {
    const { seedText, theme, childAgeMonths, childName, childDescription, childContext } = await request.json()

    if (!seedText || !theme || !childName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.error('⚠️  ANTHROPIC_API_KEY not found.')
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const client = new Anthropic({ apiKey })

    // Build context disclaimer if provided
    let contextDisclaimer = ''
    if (childContext) {
      contextDisclaimer = `\n\nIMPORTANT CONTEXT (for consistency, do not explicitly mention in story unless relevant): ${childContext}`
    }

    // Build description if provided
    let descriptionText = ''
    if (childDescription) {
      descriptionText = `\nChild Description: ${childDescription}`
    }

    const userPrompt = `Seed: "${seedText}"
Theme: "${theme}"
ChildName: "${childName}"
AgeMonths: ${childAgeMonths || 36}${descriptionText}${contextDisclaimer}

Write JSON only, using the child's name "${childName}" as the protagonist:
{
  "title": "<short poetic title>",
  "story": "<single-paragraph story in english featuring ${childName}>",
  "tags": ["<1-4 simple tags>"]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract text content from response
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response')
    }

    const result = JSON.parse(jsonMatch[0])

    // Validate the response
    if (!result.title || !result.story || !Array.isArray(result.tags)) {
      throw new Error('Invalid response format from Claude')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating myth with Claude:', error)
    return NextResponse.json(
      { error: 'Failed to generate myth' },
      { status: 500 }
    )
  }
}
