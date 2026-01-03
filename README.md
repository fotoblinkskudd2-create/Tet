# Tet - Digital Minimalism Platform

A comprehensive platform combining problem-solving utilities with the **Digital Minimalism Enforcer** - an iOS-optimized web app that helps you declutter your digital life effortlessly and guilt-free.

## Projects

### 1. Tet Problem Solver (CLI)

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams.

**Usage:**
```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

### 2. Digital Minimalism Enforcer (iOS Web App)

A comprehensive declutter agent that proactively identifies and surfaces digital waste, making cleanup effortless.

## Digital Minimalism Enforcer

### Features

#### 📁 File System Scanner
- Scans local and cloud drives for duplicate files
- Identifies large unused downloads (50MB+, 90+ days unused)
- Detects blurry and low-resolution photos
- Provides detailed breakdown of digital waste

#### 💳 Subscription Tracker
- Integrates with bank statements (via MCP) to identify recurring charges
- Flags services not used in the last 90 days
- Shows potential monthly savings
- Suggests cheaper alternatives for each subscription

#### ✉️ Auto-Draft Cancellation Emails
The genius twist! For each unused subscription, the app automatically:
- Drafts a polite but firm cancellation email
- Suggests cheaper alternatives with savings calculations
- Provides ready-to-send email templates
- Includes service comparison and recommendations

#### ✨ One-Click Cleanup
- Weekly summary dashboard with all flagged items
- Single button to archive/delete all digital waste
- Beautiful iOS-native design
- Dark mode support

### Quick Start

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

#### Running the App

1. **Start the Backend**
```bash
cd backend
npm run dev
```
The API will run on `http://localhost:3001`

2. **Start the Frontend**
```bash
cd frontend
npm run dev
```
The app will run on `http://localhost:3000`

3. **Open on iOS Device**
- Navigate to `http://[your-ip]:3000` on your iPhone
- Tap the Share button and "Add to Home Screen"
- Launch the app from your home screen for a native-like experience

### Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── declutter.ts     # File scanning & cleanup
│   │   │   └── subscriptions.ts # Subscription tracking & emails
│   │   └── server.ts            # Express server setup
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── declutter/
│   │   │   │   └── dashboard.tsx    # Main dashboard
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── signup.tsx
│   │   │   ├── _app.tsx
│   │   │   └── index.tsx
│   │   ├── components/
│   │   │   └── declutter/
│   │   │       ├── FileScanner.tsx
│   │   │       ├── SubscriptionTracker.tsx
│   │   │       └── WeeklySummary.tsx
│   │   └── styles/
│   │       └── declutter.css    # iOS-optimized styles
│   ├── public/
│   │   └── manifest.json        # PWA manifest
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
└── app.py                       # Original problem solver CLI
```

### API Endpoints

#### File System
- `POST /api/declutter/scan` - Scan directories for digital waste
- `GET /api/declutter/scan/history` - Get scan history
- `POST /api/declutter/cleanup` - Archive or delete flagged files

#### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions with unused flags
- `POST /api/subscriptions/sync` - Sync with bank data via MCP
- `POST /api/subscriptions/:id/cancel-email` - Generate cancellation email

#### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Features Showcase

#### Weekly Summary
- Beautiful iOS-native design
- Storage reclamation metrics
- Potential savings calculator
- One-click cleanup button
- Digital minimalism tips

#### Subscription Cancellation
- Auto-generated polite but firm emails
- Alternative service suggestions
- Savings calculations
- One-click copy to clipboard

#### File Scanner
- Real-time scanning progress
- Categorized results (duplicates, large files, low-quality photos)
- File size formatting
- Preview of flagged items

### iOS Optimization

The app is specifically optimized for iOS:
- Apple's San Francisco font
- Native iOS design patterns
- Safe area support for notched devices
- Haptic feedback ready
- Dark mode support
- PWA manifest for "Add to Home Screen"
- Gesture-friendly touch targets
- Smooth animations and transitions

### Future Enhancements

- [ ] Real file system scanning (currently uses mock data)
- [ ] MCP integration for actual bank transaction analysis
- [ ] Machine learning for photo quality detection
- [ ] Scheduled weekly cleanup reminders
- [ ] Cloud storage integration (Google Drive, Dropbox, iCloud)
- [ ] Email newsletter cleanup
- [ ] Browser extension for tab management
- [ ] Social media time tracking

### Development

#### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for hot reload
```

#### Frontend Development
```bash
cd frontend
npm run dev  # Start Next.js dev server
```

#### Build for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Technologies

**Backend:**
- Node.js + Express
- TypeScript
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React 18
- Next.js 14
- TypeScript
- CSS (iOS-optimized)

### License

MIT

### Contributing

Contributions welcome! Please feel free to submit a Pull Request.
