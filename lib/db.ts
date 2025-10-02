'use server'

/**
 * Database operations using Firestore client SDK on server
 * This works in development without Admin SDK credentials
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let db: FirebaseFirestore.Firestore

// Initialize Firebase Admin
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  try {
    // Try to use service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      })
      console.log('✅ Firebase Admin initialized with service account')
    } else {
      // For development without service account
      // This requires running with Firebase emulator or gcloud auth
      initializeApp({
        projectId,
      })
      console.log('⚠️  Firebase Admin initialized without credentials (emulator mode)')
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error)
    throw error
  }
}

db = getFirestore()

// Set Firestore settings for development
if (process.env.NODE_ENV === 'development') {
  // Use emulator if FIRESTORE_EMULATOR_HOST is set
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('📡 Using Firestore Emulator')
  } else {
    console.log('⚠️  No Firestore emulator detected. Make sure you have proper credentials or use the emulator.')
  }
}

export { db }
export type { Timestamp } from 'firebase-admin/firestore'
