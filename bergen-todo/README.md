# Bergen Todo

En enkel og moderne todo-app for iOS og Android bygget med React Native og Expo.

## Funksjoner

- ✅ Opprett, rediger og slett oppgaver
- 📊 Prioritetsnivåer (lav, medium, høy) med fargekoder
- 📅 Forfallsdato for oppgaver
- 🔄 Pull-to-refresh for oppdatering
- 🌙 Automatisk dark mode støtte
- 💾 Lokal lagring med AsyncStorage
- 👆 Swipe-gester for redigering og sletting
- 🔍 Filtrer mellom alle, ferdige og uferdige oppgaver

## Kom i gang

### Forutsetninger

- Node.js (v16 eller nyere)
- npm eller yarn
- Expo Go-appen installert på din telefon

### Installasjon

```bash
# Installer avhengigheter
npm install

# Start Expo utviklingsserver
npm start
```

### Kjør på telefon

1. Installer **Expo Go** fra App Store (iOS) eller Google Play (Android)
2. Kjør `npm start` i terminalen
3. Skann QR-koden med:
   - **iOS**: Bruk kameraet på telefonen
   - **Android**: Bruk Expo Go-appen

## Teknologier

- React Native
- Expo
- TypeScript
- AsyncStorage (lokal lagring)
- React Native Gesture Handler (swipe-gester)
- React Native Reanimated (animasjoner)

## Prosjektstruktur

```
bergen-todo/
├── App.tsx              # Hovedapp-komponent
├── src/
│   ├── components/      # UI-komponenter
│   │   ├── TodoItem.tsx
│   │   ├── TodoModal.tsx
│   │   └── FilterBar.tsx
│   ├── hooks/           # Custom hooks
│   │   └── useTodos.ts
│   ├── utils/           # Hjelpefunksjoner
│   │   └── storage.ts
│   └── types.ts         # TypeScript typer
├── app.json             # Expo konfigurasjon
└── package.json
```

## Lisens

MIT
