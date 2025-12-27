import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: any = null
let messaging: any = null

// Initialize Firebase only if config is provided
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
  } catch (error) {
    console.error('Firebase initialization failed:', error)
  }
}

export async function requestNotificationPermission() {
  if (!messaging) {
    console.log('Firebase not configured')
    return null
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      })

      console.log('FCM Token:', token)
      return token
    }

    return null
  } catch (error) {
    console.error('Notification permission error:', error)
    return null
  }
}

export function onMessageListener() {
  if (!messaging) return Promise.reject('Firebase not configured')

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
}

export { app, messaging }
