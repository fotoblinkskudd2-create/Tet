# 🚨 LifeGuard - iOS Emergency Assistance App

LifeGuard is a comprehensive life-saving iOS application designed to provide quick access to emergency services, store critical medical information, offer first aid guidance, and share your location in emergencies.

## 🌟 Features

### 1. **Emergency SOS**
- Quick dial to emergency services (911 and international numbers)
- 3-second countdown for accidental prevention
- One-tap access to saved emergency contacts
- Quick view of critical medical information for first responders
- International emergency numbers for travelers

### 2. **Medical Profile**
- Store personal medical information:
  - Blood type
  - Allergies (highlighted in red for visibility)
  - Current medications
  - Medical conditions
  - Date of birth
- Emergency contacts with:
  - Name, relationship, and phone number
  - One-tap calling from the Emergency SOS screen
- All data stored locally and securely on your device

### 3. **First Aid Guide**
- Comprehensive step-by-step instructions for:
  - Life-threatening emergencies (CPR, choking, severe bleeding, heart attack, stroke)
  - Medical emergencies (allergic reactions, seizures, poisoning, shock)
  - Common injuries (burns, fractures)
  - Environmental emergencies (hypothermia)
- Category filtering for quick access
- Search functionality
- Important warnings highlighted
- Share instructions with others
- Direct emergency call button from any guide

### 4. **Location Sharing**
- Real-time GPS location tracking
- Reverse geocoding for human-readable addresses
- Share location via SMS with:
  - Coordinates
  - Address
  - Google Maps and Apple Maps links
- Open current location in Maps app
- Copy coordinates to clipboard
- Accuracy indicator

## 🛠 Technical Requirements

### System Requirements
- iOS 16.0 or later
- Xcode 15.0 or later
- Swift 5.9 or later
- iPhone or iPad device (recommended for full functionality)

### Permissions Required
- **Location Services**: For emergency location sharing
- **Phone**: For making emergency calls
- **Messages**: For sharing location via SMS

## 📦 Installation & Build Instructions

### Option 1: Build with Xcode

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Tet
   ```

2. **Open the project in Xcode**
   ```bash
   open LifeGuard.xcodeproj
   ```

3. **Configure signing**
   - Select the LifeGuard target in Xcode
   - Go to "Signing & Capabilities"
   - Select your development team
   - Xcode will automatically create a provisioning profile

4. **Build and run**
   - Select a simulator or connected device
   - Press ⌘R or click the Run button
   - The app will build and launch

### Option 2: Command Line Build

```bash
# Navigate to project directory
cd Tet

# Build for simulator
xcodebuild -project LifeGuard.xcodeproj \
           -scheme LifeGuard \
           -sdk iphonesimulator \
           -configuration Debug \
           build

# Build for device (requires proper code signing)
xcodebuild -project LifeGuard.xcodeproj \
           -scheme LifeGuard \
           -sdk iphoneos \
           -configuration Release \
           -allowProvisioningUpdates \
           build
```

### Testing on a Real Device

For full functionality (especially location services and phone calls), test on a real device:

1. Connect your iPhone/iPad via USB
2. Trust the computer on your device if prompted
3. In Xcode, select your device from the device dropdown
4. Ensure your Apple ID is added to Xcode (Xcode > Settings > Accounts)
5. Build and run on device

## 🚀 Usage Guide

### First Time Setup

1. **Grant Permissions**
   - Allow location access when prompted
   - Allow phone access for emergency calls

2. **Set Up Medical Profile**
   - Tap "Medical Info" tab
   - Tap "Edit" in the top right
   - Fill in your personal and medical information
   - Add emergency contacts
   - Tap "Done" to save

### In an Emergency

1. **Call Emergency Services**
   - Open the app to the "Emergency" tab
   - Tap "CALL 911" (3-second countdown)
   - Or tap "Cancel" if accidental

2. **Contact Emergency Contacts**
   - Scroll down to see your saved emergency contacts
   - Tap any contact to call them immediately

3. **Share Your Location**
   - Go to "Location" tab
   - Tap "Share Location via SMS"
   - Select a contact to send your location with maps links

4. **Access First Aid Instructions**
   - Go to "First Aid" tab
   - Search or browse by category
   - Tap any emergency for detailed instructions
   - Follow step-by-step guidance
   - Share instructions with others if needed

## 🏗 Project Structure

```
LifeGuard/
├── LifeGuardApp.swift              # App entry point
├── ContentView.swift               # Main tab navigation
├── Info.plist                      # App configuration & permissions
├── Assets.xcassets/                # App icons and colors
├── Models/
│   ├── MedicalProfile.swift        # Medical data model & storage
│   └── FirstAidItem.swift          # First aid database
├── Views/
│   ├── EmergencySOSView.swift      # Emergency calling interface
│   ├── MedicalProfileView.swift    # Medical info editor
│   ├── FirstAidGuideView.swift     # First aid instructions
│   └── LocationShareView.swift     # Location sharing interface
└── Managers/
    └── LocationManager.swift       # Location services handler
```

## 🔒 Privacy & Security

- **Local Storage Only**: All medical information is stored locally on your device using UserDefaults
- **No Cloud Sync**: Your data never leaves your device
- **No Analytics**: No tracking or analytics are collected
- **Permission Based**: Location and phone permissions requested only when needed
- **Open Source**: Review the code to verify privacy practices

## ⚠️ Important Disclaimers

1. **Not a Substitute for Professional Medical Care**: This app provides first aid guidance but is NOT a substitute for professional medical training or emergency medical services.

2. **Always Call Emergency Services**: In life-threatening situations, always call your local emergency number (911 in the US) immediately.

3. **First Aid Training Recommended**: Consider taking certified first aid and CPR courses from organizations like the American Red Cross or local emergency services.

4. **Information Accuracy**: While first aid instructions are based on widely accepted guidelines, always follow instructions from emergency dispatchers and trained medical professionals.

5. **Device Limitations**: The app requires a working phone connection to make emergency calls and an active GPS signal for location services.

## 🔄 Future Enhancements

Potential features for future versions:
- Apple Watch companion app
- Widget for lock screen emergency access
- Multi-language support
- Offline maps
- Emergency contacts auto-notification
- Health app integration
- Automatic crash detection
- Medical ID integration

## 📝 License

This project is created for educational and humanitarian purposes. Feel free to use, modify, and distribute as needed to help save lives.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- First aid information is accurate and from reputable sources
- Code follows Swift best practices
- Features genuinely help in emergency situations
- Privacy and security are maintained

## 📞 Support & Feedback

For issues, suggestions, or contributions, please open an issue or submit a pull request.

---

**Remember: In a real emergency, always call your local emergency services first!**

**Emergency Numbers:**
- United States: 911
- United Kingdom: 999
- European Union: 112
- Australia: 000
- Canada: 911

---

*Made with ❤️ for safety and emergency preparedness*
