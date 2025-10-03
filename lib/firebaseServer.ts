import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin SDK for server-side operations
if (!getApps().length) {
  try {
    // Try to use service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
    } else {
      // Fallback: use default credentials (for cloud environments)
      initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
  }
}

export const adminStorage = getApps().length > 0 ? getStorage() : null
