# Drunk Party Games 🍺🎉

Hilarious drunk party games using GPS and gyroscope sensors!

## Features

### Games Available

1. **Shake-o-Meter 📳** - Who can shake their phone the hardest? Find out who's the biggest idiot!
2. **Balance Master 🎯** - Hold your phone perfectly still. Good luck doing that drunk!
3. **GPS Treasure Hunt 🗺️** - Navigate to a random location nearby. Hot or cold? You decide!
4. **Spin & Point 🧭** - Spin around and point to a target direction. Dizzy yet?
5. **Drunk Walk Challenge 🚶** (Coming Soon) - Walk in a straight line while drunk. GPS tracks your path!
6. **Who's The Biggest Idiot? 🏆** (Coming Soon) - Combination of all challenges!

### Technologies Used

- **Next.js** - React framework for the web app
- **TypeScript** - Type-safe development
- **Device Sensors** - Gyroscope, Accelerometer, and GPS
- **PWA** - Installable as a mobile app

## Getting Started

### Prerequisites

- Node.js 18+
- A mobile device with gyroscope, accelerometer, and GPS

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Important:** Most sensor APIs require HTTPS in production. For local development, some browsers allow localhost without HTTPS.

### Installing as PWA

On mobile devices:
1. Open the app in your browser
2. Use "Add to Home Screen" option
3. The app will work like a native app!

## Sensor Permissions

The games require the following permissions:
- **Gyroscope/Orientation** - For rotation and direction detection
- **Accelerometer/Motion** - For shake detection
- **GPS/Location** - For treasure hunt and navigation games

On iOS 13+, you'll need to grant permission when prompted.

## Game Instructions

### Shake-o-Meter
- Shake your phone as hard as you can for 10 seconds
- The harder you shake, the higher your score
- Try not to drop your phone!

### Balance Master
- Hold your phone perfectly level
- Stay within the green zone
- Game ends when stability reaches 0

### GPS Treasure Hunt
- Follow the arrow to find the hidden treasure
- The color tells you how close you are (hot/cold)
- Get within 10 meters to win!

### Spin & Point
- Spin around 5 times
- Point your phone to the target direction
- The closer you are, the more points you get!

## Safety Warning

⚠️ **Please drink responsibly!**

- Don't play these games while driving
- Watch where you're walking during GPS games
- Don't break your phone (or your face)
- Stay safe and have fun!

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Sensors:** Web APIs (DeviceOrientation, DeviceMotion, Geolocation)
- **PWA:** manifest.json for mobile installation

## Browser Compatibility

Works best on:
- iOS Safari 13+
- Chrome for Android
- Edge Mobile

## Contributing

This is a fun project! Feel free to add more stupid games.

## License

Have fun and don't sue us if you hurt yourself!
