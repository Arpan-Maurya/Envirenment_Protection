import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fileConfig from '../../firebase-applet-config.json';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined;

const firebaseConfig = (apiKey && apiKey !== 'MY_FIREBASE_API_KEY')
  ? { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId }
  : fileConfig;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


