# Quick Start Guide - Childhood Saga

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run with Mock Data (No API Keys Required!)
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**You can now:**
- ✅ Sign up with email/password
- ✅ Create a child profile
- ✅ Forge chapters (uses mock English stories)
- ✅ View The Hero's Book
- ✅ Browse chapters with constellation view

The app works fully without any API keys using mock fallbacks!

---

## 🔐 Full Setup (With AI Generation)

### Step 1: Firebase Setup (5 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name it "childhood-saga" (or your choice)
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - Click "Authentication" in sidebar
   - Click "Get started"
   - Enable "Email/Password"
   - (Optional) Enable "Google"

3. **Create Firestore Database**
   - Click "Firestore Database" in sidebar
   - Click "Create database"
   - Start in production mode
   - Choose a location (closest to your users)

4. **Get Firebase Config**
   - Click ⚙️ (Settings) > Project settings
   - Scroll to "Your apps"
   - Click Web icon (</>) to add a web app
   - Register app with nickname "childhood-saga-web"
   - Copy the config object

### Step 2: Anthropic API Key (2 minutes)

1. **Sign up for Anthropic**
   - Go to [console.anthropic.com](https://console.anthropic.com/)
   - Create an account
   - Add credits ($5 minimum)

2. **Create API Key**
   - Go to API Keys
   - Click "Create Key"
   - Name it "childhood-saga"
   - Copy the key (starts with `sk-ant-`)

### Step 3: Environment Variables

1. **Create `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in values**
   ```bash
   # From Firebase Console > Project Settings > General
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

   # From Anthropic Console
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. **Save and restart dev server**
   ```bash
   npm run dev
   ```

Now chapters will be generated with real AI!

---

## 🧪 Test the Full Flow

1. **Sign Up**
   - Go to http://localhost:3000
   - Enter email: test@example.com
   - Enter password: test1234
   - Click "Sign Up"

2. **Create a Child**
   - Click "Get Started"
   - Click "+ Add Child"
   - Name: "Luna"
   - Birth date: 2022-06-15
   - Click "Add Child"

3. **Forge a Chapter**
   - Select "Fantasy" theme
   - Enter: "We built a fort with blankets"
   - Click "Forge Chapter"
   - Wait ~5 seconds

4. **View the Chapter**
   - See the AI-generated English story!
   - Note the tags and theme
   - Click share button to copy link

5. **Browse The Hero's Book**
   - Click "Hero's Book" in nav
   - See your chapter in the constellation grid
   - Try filtering by theme/tags

---

## 📝 Sample Themes to Try

- **Fantasy**: "We found a magic stone in the garden"
- **Space Adventure**: "We counted stars before bedtime"
- **Ocean Wonders**: "We watched fish at the aquarium"
- **Forest Friends**: "A squirrel visited our backyard"
- **Dinosaur Time**: "We played with toy dinosaurs"
- **Cozy Bedtime**: "We read three bedtime stories"

---

## 🎨 Customization

### Add Your Own Theme
1. Click "+ Custom" in theme selector
2. Type your theme (e.g., "Underwater Kingdom")
3. Click "Add"

### Adjust Child's Age
Edit the child's birth date - the AI adapts story complexity based on age!

---

## 🐛 Troubleshooting

### "Failed to initialize Firebase Admin SDK"
- Make sure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set
- Firebase Admin works without service account for dev

### Images not loading
- This is normal in dev - placeholder images are used
- Images work fine in production with Firebase Storage

### "Too many requests" error
- You hit Anthropic's rate limit
- Wait a minute, or upgrade your tier
- App falls back to mock stories automatically

### Build errors
- Run `rm -rf .next && npm run build`
- Make sure Node 18+ is installed

---

## 📚 Learn More

- [Full README](./README.md) - Complete documentation
- [Implementation Details](./IMPLEMENTATION.md) - Technical deep dive
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Anthropic Docs](https://docs.anthropic.com/)

---

## 🎉 You're Ready!

Enjoy creating mythic memories with your little one! ✨

Questions? Check the [README](./README.md) or open an issue.
