# Childhood Saga

Transform daily moments with your 2-4 year-old into mythic story chapters. Built with Next.js, Firebase, and powered by Claude Sonnet.

## Features

- 🎨 **14 Magical Themes**: Fantasy, Epic, Space Adventure, Forest Friends, Ocean Wonders, Dinosaur Time, Kind Robots, Magic School, Fairy Garden, Friendly Monsters, Pirate Islands, Snowy World, City Explorers, Cozy Bedtime
- ✨ **AI-Powered Storytelling**: Claude Sonnet generates age-appropriate stories in warm Rioplatense Spanish
- 📚 **The Hero's Book**: Constellation-like gallery of all your mythic chapters
- 🔐 **Secure Authentication**: Firebase Auth with Email/Password and Google sign-in
- 📱 **Responsive Design**: Beautiful UI built with TailwindCSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: TailwindCSS + shadcn/ui
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (for future image generation)
- **AI Text**: Anthropic Claude Sonnet 4
- **AI Image**: Gemini "Nano Banana" (planned)

## Prerequisites

- Node.js 18+ (Firebase SDK requires Node 20+ for full compatibility)
- npm or yarn
- Firebase project ([Create one here](https://console.firebase.google.com/))
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 - **Works fully with mock data** (no API keys needed)!

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup (5 minutes)

📖 **See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed step-by-step instructions**

Quick steps:
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password + Google)
3. Create Firestore Database
4. **Deploy security rules** from `firestore.rules`
5. Get web app configuration
5. Create **Storage Bucket**:
   - Go to Storage
   - Get started with default rules
6. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" and click Web app icon
   - Copy the config values

### 3. Firebase Admin SDK (for Server Actions)

**Option A: For Development (Recommended)**

Use your Firebase project without a service account:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set your default project
firebase use --add
```

**Option B: For Production**

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Minify the JSON (remove whitespace) and set as `FIREBASE_SERVICE_ACCOUNT_KEY` in environment variables

### 4. Anthropic API Key

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Copy the key for your `.env.local` file

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Firebase Client Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Optional - for production)
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (for future image generation)
# GOOGLE_API_KEY=your_google_api_key
```

See `.env.local.example` for a template.

### 6. Firestore Security Rules (Production)

Before deploying to production, add these security rules to Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Children collection
    match /children/{childId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Chapters collection
    match /chapters/{chapterId} {
      allow read: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Running the App

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Mock Fallbacks

The app includes mock fallbacks for development without API keys:

- **Text Generation**: Returns pre-written Spanish stories if `ANTHROPIC_API_KEY` is not set
- **Image Generation**: Returns placeholder images from Unsplash if `GOOGLE_API_KEY` is not set

This allows you to test the full user flow without configuring API providers.

## Project Structure

```
childhood-saga/
├── app/
│   ├── (app)/                    # Authenticated app routes
│   │   ├── dashboard/            # The Hero's Book
│   │   ├── child/                # Child profile selector
│   │   ├── new/                  # Create new chapter
│   │   └── chapter/[id]/         # Chapter detail view
│   ├── api/                      # API routes
│   │   ├── auth/verify/          # Token verification
│   │   ├── chapters/             # Chapter CRUD
│   │   └── recaps/               # Yearly recaps
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── AuthProvider.tsx          # Firebase Auth context
│   ├── ChildSelector.tsx         # Child profile management
│   ├── ThemeChips.tsx            # Theme selection chips
│   ├── ChapterCard.tsx           # Chapter thumbnail
│   └── ConstellationGrid.tsx     # Chapter grid with SVG lines
├── lib/
│   ├── ai/
│   │   ├── textProvider.ts       # Claude Sonnet integration
│   │   └── imageProvider.ts      # Image generation (stub)
│   ├── firebase.ts               # Firebase client SDK
│   ├── firestore.ts              # Firebase Admin SDK
│   ├── serverActions.ts          # Server actions
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utilities
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Data Model

### Collections

**users/{userId}**
```typescript
{
  displayName?: string
  email: string
  createdAt: Timestamp
}
```

**children/{childId}**
```typescript
{
  userId: string
  name: string
  birthDate?: string
  createdAt: Timestamp
}
```

**chapters/{chapterId}**
```typescript
{
  userId: string
  childId: string
  theme: string
  seedText: string
  createdAt: Timestamp
  mythTitle: string
  mythText: string
  tags: string[]
  imageUrl: string
  providerMeta: {
    text?: any
    image?: any
  }
  status: "generating" | "ready" | "failed"
}
```

## User Flow

1. **Sign In**: Email/password or Google sign-in
2. **Select/Create Child**: Choose or create a child profile
3. **Forge Chapter**: Select theme + describe a moment → Click "Forge"
4. **View Chapter**: Read the generated story with illustration
5. **Hero's Book**: Browse all chapters in a constellation grid
6. **Filter**: Filter chapters by theme or tags

## Prompt Template

The Claude Sonnet prompt follows these guidelines:

- **Language**: Rioplatense Spanish
- **Age**: 2-4 years old
- **Tone**: Warm, gentle, cozy wonder
- **Length**: 150-300 words
- **Content**: Concrete imagery, no fear/violence
- **Output**: JSON with `title`, `story`, `tags`

## Future Enhancements

- [ ] Gemini image generation integration
- [ ] Firebase Storage for custom images
- [ ] Annual recap PDF export
- [ ] Audio narration (TTS)
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Firestore security rules setup

## Troubleshooting

### Firebase Admin SDK Errors

If you see "Failed to initialize Firebase Admin SDK" errors:

1. Make sure you're running with Firebase CLI authenticated: `firebase login`
2. Or set `FIREBASE_SERVICE_ACCOUNT_KEY` with your service account JSON
3. Check that `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project

### Image Loading Issues

If images don't load:

1. Check that the domain is allowed in `next.config.js`
2. Verify Firebase Storage CORS configuration
3. Use placeholder images in development (automatic fallback)

### API Rate Limits

- Anthropic Claude: Check your tier limits
- Firebase: Free tier has quotas on reads/writes

## License

MIT

## Credits

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Icons from [Lucide](https://lucide.dev/)
