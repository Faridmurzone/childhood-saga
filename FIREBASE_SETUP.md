# Firebase Setup Guide - Childhood Saga

## Quick Setup (5 Minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `childhood-saga` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
   - Toggle "Email/Password" to ENABLED
   - Click "Save"
5. (Optional) Enable **"Google"**
   - Toggle "Google" to ENABLED
   - Select support email
   - Click "Save"

### Step 3: Create Firestore Database

1. In sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules next)
4. Choose a location close to your users (e.g., `us-central`)
5. Click **"Enable"**

### Step 4: Deploy Security Rules

**IMPORTANT**: Deploy these rules to secure your database!

1. In Firestore Database, click **"Rules"** tab
2. Replace the content with the rules from `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    match /children/{childId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    match /chapters/{chapterId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Get Web App Configuration

1. In Project Overview (click ⚙️ icon), go to **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click the **Web icon** `</>`
4. Register app:
   - App nickname: `childhood-saga-web`
   - Don't check "Firebase Hosting" (not needed)
   - Click **"Register app"**
5. **Copy the config object** - you'll need this!

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### Step 6: Configure Environment Variables

1. In your project root, copy the example:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Firebase config:
   ```bash
   # From the firebaseConfig object above
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...

   # Get from Anthropic Console (console.anthropic.com)
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Save the file

### Step 7: Test It!

```bash
npm run dev
```

Open http://localhost:3000 and:

1. ✅ Sign up with email/password
2. ✅ Create a child profile
3. ✅ Forge a chapter
4. ✅ View in The Hero's Book

---

## Troubleshooting

### "Missing or insufficient permissions" Error

**Cause**: Firestore security rules not deployed or incorrect

**Solution**:
1. Go to Firestore Database → Rules tab
2. Make sure the rules from Step 4 are published
3. Check the "Simulator" tab to test rules

### "Firebase: Error (auth/...)" Errors

**Cause**: Authentication method not enabled

**Solution**:
1. Go to Authentication → Sign-in method
2. Make sure Email/Password is ENABLED
3. Make sure the toggle is ON (blue)

### "Configuration object is invalid"

**Cause**: Missing or incorrect environment variables

**Solution**:
1. Check `.env.local` exists in project root
2. Make sure all `NEXT_PUBLIC_FIREBASE_*` vars are set
3. Restart dev server after changing .env.local

### "Cannot read properties of undefined"

**Cause**: Firebase not initialized properly

**Solution**:
1. Clear browser cache and localStorage
2. Restart dev server
3. Check browser console for specific errors

---

## Firebase Console Quick Links

Once you've created your project, bookmark these:

- **Overview**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`
- **Authentication**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID/authentication`
- **Firestore**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID/firestore`
- **Rules**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID/firestore/rules`
- **Usage**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID/usage`

Replace `YOUR-PROJECT-ID` with your actual project ID!

---

## Security Rules Explanation

Our Firestore rules ensure:

✅ **Users can only read/write their own data**
- Children can only be created by the authenticated user
- Chapters can only be read by their creator
- No cross-user data access

✅ **Authentication required**
- All operations require a signed-in user
- No anonymous access to data

✅ **Ownership validation**
- Documents are owned by the user who created them
- `userId` field must match authenticated user

---

## Firestore Free Tier Limits

The Firebase free tier (Spark plan) includes:

- **Firestore**:
  - 1 GB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day

- **Authentication**:
  - Unlimited users
  - Email/password + Google included

This is plenty for development and small-scale production! ✨

---

## Next Steps

Once Firebase is set up:

1. ✅ Get an Anthropic API key for AI generation
2. ✅ Test the full flow: Sign up → Create child → Forge chapter
3. ✅ Deploy to Vercel (optional)
4. ✅ Share your mythic creations!

Need help? Check the main [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md)
