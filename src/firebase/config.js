import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD6sV60PHkg7BifElAyy2OOv0QiqUGXlDE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hexonallm.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://hexonallm-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hexonallm',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hexonallm.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '212316468351',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:212316468351:web:e5113b830c5ed562cfbb4a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CLWWCLYV0P',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;

