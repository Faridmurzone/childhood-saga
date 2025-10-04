import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Firebase configuration with hardcoded values as fallback for production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDAqu_gC5Xli7IRY76DH43oNPmsaZVTk7k",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "childhood-saga.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "childhood-saga",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "childhood-saga.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "848700724231",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:848700724231:web:314b605cda3be2231bc6a2",
}

// Debug: Log configuration in development only
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? 'Present' : 'Missing',
  })
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (typeof window !== 'undefined') {
  // Initialize Firebase only on client side
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    console.error('Firebase Config:', firebaseConfig)
    throw error
  }
}

export { auth, db, storage }
