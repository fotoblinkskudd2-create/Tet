# Fracture Mobile

React Native mobile app for Fracture - the learning app for chaotic minds.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';  // For development
```

For iOS Simulator, use `http://localhost:8000/api`
For Android Emulator, use `http://10.0.2.2:8000/api`
For physical device on same network, use your computer's IP: `http://192.168.x.x:8000/api`

### Run Development Server

```bash
npm start
```

This opens the Expo development tools. Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

### Build for Production

```bash
# iOS
expo build:ios

# Android
expo build:android
```

## App Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.tsx      # Initial assessment
│   │   ├── LearningScreen.tsx        # Core learning interface
│   │   ├── ConsequenceDashboard.tsx  # The brutal math
│   │   └── ProgressDashboard.tsx     # Progress tracking
│   └── services/
│       └── api.ts                    # Backend API client
├── App.tsx                           # Main app component
└── package.json
```

## Screens

### Onboarding Screen
- "How fucked are you?" chaos level assessment (0-100)
- Primary learning goal input
- Current situation description
- DID/dissociative issues checkbox
- Optional debt amount tracking

**Flow:**
User completes assessment → Backend creates profile → Navigate to Learning

### Learning Screen
- Displays AI-selected learning module
- Shows directive: "Now learn this: CSS Grid. 12 minutes. Start."
- Renders learning content (concepts, code examples, practice)
- Tracks completion rate
- Shows intervention messages when mental state deteriorates

**Features:**
- Real-time mental state monitoring
- Intervention overlays (dissociation detection)
- Completion rate selection (30%, 60%, 90%, 100%)
- Practice exercises with solutions

### Consequence Dashboard
**The brutal math. No sugar coating.**

Shows:
- Current stats (hours learned, skills acquired, market value)
- Debt tracking (if provided)
- **"Continue current pace" projection:**
  - Weeks to job-ready
  - Job probability percentage
  - Estimated salary
  - Debt clearance timeline
- **"Give up now" projection:**
  - Job probability: 0%
  - Consequence timeline (inkasso → utlegg → destroyed credit)

### Progress Dashboard
**What's been done. No celebration.**

Shows:
- Days active, total sessions, learning time
- Skills by category
- Average cognitive load
- Best learning times (based on behavioral analysis)
- DID parts detected (if applicable)

## Key Features

### Real-Time Adaptation
- Logs user interactions for behavioral analysis
- Adjusts module difficulty and length based on mental state
- Triggers interventions when dissociation/overload detected

### No Gamification
- No badges, no streaks (except as fact)
- No "you're on fire 🔥"
- Just math and consequences

### DID Support (Planned)
- Detects different alters/parts from interaction patterns
- Adapts content per part
- Tracks knowledge transfer

## API Integration

All backend communication happens through `src/services/api.ts`:

- `onboardUser()` - Initial assessment
- `startSession()` - Begin learning
- `getNextModule()` - AI selects module
- `completeSession()` - Finish session
- `getCurrentState()` - Get mental state analysis
- `getConsequences()` - Brutal math dashboard
- `getProgress()` - Progress tracking

## Styling

Dark theme throughout:
- Background: `#000` (pure black)
- Text: `#fff` (white)
- Secondary text: `#888` (gray)
- Accent (positive): `#0f0` (green)
- Accent (negative): `#ff4444` (red)
- Code blocks: `#1a1a1a` with `#0f0` terminal green

No gradients. No animations (except loading). Just clarity.

## Development Notes

### State Management
Currently using React hooks and local state. For production, consider:
- Zustand for global state (user, session)
- React Query for server state (already integrated)

### Behavioral Tracking
TODO: Implement on-device behavioral event logging:
- Keystroke timing analysis
- Touch pressure/duration tracking
- Interaction pattern logging
- Send to backend for mental state classification

### Offline Support
TODO: Allow learning modules to be cached for offline use

### Notifications
TODO: Intelligent notifications based on optimal learning windows
- No spam
- No streaks
- Just: "Optimal learning window: 02:00-04:00" based on past data

## Testing

```bash
# Unit tests (not yet implemented)
npm test
```

## Production Checklist

- [ ] Update API_BASE_URL to production backend
- [ ] Add error tracking (Sentry)
- [ ] Implement analytics (privacy-first)
- [ ] Add crash reporting
- [ ] Implement local encryption for sensitive data
- [ ] Add biometric authentication option
- [ ] Test on multiple devices
- [ ] Submit to App Store / Play Store

## License

MIT (tentative)
