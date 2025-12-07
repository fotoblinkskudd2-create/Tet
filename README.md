# Necessary Evil

**The app that bullies you into getting your shit together.**

A brutal habit tracking app with dark humor, social shame mechanics, and ruthless productivity coaching.

## Features

### Core Features
- 🔥 **Brutal Habit Tracking** - Track your habits with unforgiving accountability
- 💀 **Hard-Truth Productivity Coach** - Get roasted based on your performance
- 🏆 **Social Shame Leaderboards** - Compete (or suffer) with others
- 🎮 **Dark Humor Gamification** - Streaks, titles, and brutal feedback
- 🚨 **Panic Redemption Mode** - Last-ditch effort to save a wasted day

### Personalization
- **Roast Levels**: Soft, Normal, or Brutal
- **Tone Personas**: Cold CEO, Passive Aggressive Roommate, Disappointed Parent, Brutal Coach
- **Custom Habits**: Set 3-7 goals/habits to track
- **Smart Scheduling**: Configure wake time, work hours, and do-not-disturb windows

### Stats & Analytics
- Daily, weekly, and monthly completion rates
- Streak tracking
- Habit breakdown with success/failure rates
- "Hall of Shame" for your most broken habits
- Brutally honest summaries

## Tech Stack

- **Framework**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **UI Components**: Custom-built with consistent theming
- **Charts**: React Native SVG

## Project Structure

```
necessary-evil/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   └── ProgressRing.js
│   ├── screens/          # Screen components
│   │   ├── WelcomeScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── StatsScreen.js
│   │   ├── LeaderboardScreen.js
│   │   ├── SettingsScreen.js
│   │   └── PanicModeScreen.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── store/            # State management
│   │   └── useStore.js
│   ├── services/         # Business logic
│   │   ├── roastEngine.js
│   │   └── notificationService.js
│   ├── data/             # Static data
│   │   ├── personas.js
│   │   └── roasts.js
│   ├── theme/            # Design system
│   │   ├── colors.js
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   └── index.js
│   └── utils/            # Helper functions
├── assets/               # Images, fonts, icons
├── App.js               # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

### Running on Different Platforms

- **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
- **Android**: Press `a` in the terminal or scan QR code with Expo Go app
- **Web**: Press `w` in the terminal

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

### Adding New Roasts

Edit `src/data/roasts.js` to add new roast messages. Messages are organized by:
- Context (daily greeting, notifications, stats summary, etc.)
- Performance level (success/failing)
- Roast level (soft/normal/brutal)

Example:
```javascript
dailyGreeting: {
  failing: {
    brutal: [
      'Your new roast message here',
    ],
  },
},
```

### Adding New Personas

Edit `src/data/personas.js` to add new persona types:

```javascript
export const personas = {
  yourPersona: {
    id: 'yourPersona',
    name: 'Your Persona Name',
    description: 'How this persona treats the user',
    icon: '😈',
  },
};
```

## Configuration

### Notifications

The app uses Expo Notifications for scheduling reminders. Configure notification times in:
- Settings screen (user-facing)
- `src/services/notificationService.js` (developer)

### Storage

All user data is stored locally using AsyncStorage. No backend required for basic functionality.

To reset all data:
1. Go to Settings
2. Scroll to "Danger Zone"
3. Tap "Reset Everything"

## Features Roadmap

### Planned Features
- [ ] Backend integration for real leaderboards
- [ ] AI-generated personalized roasts
- [ ] Premium subscription tier
- [ ] Habit categories and templates
- [ ] Social features (friends, challenges)
- [ ] Achievement badges (with sarcastic descriptions)
- [ ] Export data as CSV/JSON
- [ ] Dark/light theme toggle
- [ ] Multiple languages support

### Potential Integrations
- [ ] Calendar sync
- [ ] Fitness tracker integration
- [ ] Time tracking apps
- [ ] Productivity tools (Notion, Todoist, etc.)

## Architecture Decisions

### Why React Native + Expo?
- Single codebase for iOS, Android, and Web
- Fast development and hot reload
- Large ecosystem and community
- Easy to add native features later

### Why Zustand for State Management?
- Lightweight and simple API
- No boilerplate compared to Redux
- Perfect for small to medium apps
- Easy to persist state with AsyncStorage

### Why Local Storage?
- No backend costs to start
- Fast and responsive
- Works offline
- Easy to migrate to backend later

## Contributing

### Code Style
- Use functional components and hooks
- Follow existing component structure
- Keep components small and focused
- Use theme constants for styling
- Write clear, descriptive names

### Adding New Screens
1. Create screen component in `src/screens/`
2. Add to navigation in `src/navigation/AppNavigator.js`
3. Update any related state in `src/store/useStore.js`

## Design Philosophy

**Tone**: Sarcastic, honest, slightly toxic but never illegal, hateful, or discriminatory. Like a ruthless friend who's always right.

**UI/UX**: Clean, modern, minimal with subtle "villain" vibes. Strong typography, high contrast, sharp animations.

**Color Palette**:
- Background: Pure black (#000000)
- Surface: Dark gray (#111827)
- Accent: Red (#EF4444) for warnings and roasts
- Success: Green (#10B981) for rare moments of success

## License

This project is private and proprietary.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Remember**: This app is designed to be brutally honest. If you can't handle the truth, maybe you shouldn't install it. 💀
