import * as admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  // For development, we can use Application Default Credentials or service account
  // In production, set GOOGLE_APPLICATION_CREDENTIALS environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim()) {
    try {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      )
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      })
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error)
      // Fallback to default initialization
      admin.initializeApp({
        projectId,
      })
    }
  } else {
    // For local development without service account
    // Uses emulator or requires gcloud auth
    admin.initializeApp({
      projectId,
    })
  }
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()

export type { Timestamp } from 'firebase-admin/firestore'
