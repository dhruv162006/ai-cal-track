import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };

/**
 * Creates a user document in Firestore if it doesn't already exist.
 * This guarantees idempotency.
 */
export const createUserIfNotExists = async (user: {
  userId: string;
  email: string;
  name?: string;
}) => {
  if (!user || !user.userId) return;

  const userRef = doc(db, 'users', user.userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    try {
      await setDoc(userRef, {
        userId: user.userId,
        name: user.name || '',
        email: user.email,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
      });
      console.log('User successfully created in Firestore.');
    } catch (error) {
      console.error('Error creating user in Firestore', error);
      throw error;
    }
  }
};
