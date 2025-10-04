import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firestore'
import { createChapter, listChapters } from '@/lib/serverActions'
import { CreateChapterInput, ListChaptersParams } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const idToken = authHeader.substring(7)
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken.uid
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const input: CreateChapterInput = await request.json()

    if (!input.childId || !input.theme || !input.seedText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const chapter = await createChapter(input, userId)

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const pageSize = searchParams.get('pageSize')
    const after = searchParams.get('after')

    if (!childId) {
      return NextResponse.json(
        { error: 'Missing childId parameter' },
        { status: 400 }
      )
    }

    const params: ListChaptersParams = {
      childId,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      after: after || undefined,
    }

    const chapters = await listChapters(params, userId)

    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error listing chapters:', error)
    return NextResponse.json(
      { error: 'Failed to list chapters' },
      { status: 500 }
    )
  }
}
