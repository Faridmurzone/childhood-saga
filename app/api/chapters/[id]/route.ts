import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firestore'
import { getChapter } from '@/lib/serverActions'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const chapter = await getChapter(id, userId)

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error getting chapter:', error)
    return NextResponse.json(
      { error: 'Failed to get chapter' },
      { status: 500 }
    )
  }
}
