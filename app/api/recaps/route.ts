import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firestore'
import { listRecap } from '@/lib/serverActions'
import { RecapParams } from '@/lib/types'

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
    const yearStr = searchParams.get('year')

    if (!childId || !yearStr) {
      return NextResponse.json(
        { error: 'Missing childId or year parameter' },
        { status: 400 }
      )
    }

    const year = parseInt(yearStr, 10)
    if (isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      )
    }

    const params: RecapParams = {
      childId,
      year,
    }

    const recap = await listRecap(params, userId)

    return NextResponse.json(recap)
  } catch (error) {
    console.error('Error getting recap:', error)
    return NextResponse.json(
      { error: 'Failed to get recap' },
      { status: 500 }
    )
  }
}
