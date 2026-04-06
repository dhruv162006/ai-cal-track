import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { tokenCache } from '../lib/clerk';
import '../global.css';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

import { getUserProfile, createUserIfNotExists } from '../lib/firebase';
import { getLocalData, setLocalData, StorageKeys } from '../lib/storage';

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const syncAttempted = React.useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const checkStateAndRoute = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inAppGroup = segments[0] === '(app)';
      const inOnboardingGroup = segments[0] === '(onboarding)';
      const inAIGroup = segments[0] === '(ai)';

      if (!isSignedIn) {
        if (!inAuthGroup) router.replace('/(auth)/sign-in');
        return;
      }

      // If signed in, check onboarding status safely
      let isOnboarded = await getLocalData(StorageKeys.USER_ONBOARDING);

      if (!isOnboarded && user) {
        const profile = await getUserProfile(user.id);
        if (profile?.onboardingCompleted) {
          isOnboarded = true;
          await setLocalData(StorageKeys.USER_ONBOARDING, true);
        }
      }

      if (isOnboarded) {
        if (!inAppGroup) router.replace('/(app)');
      } else {
        if (!inOnboardingGroup && !inAIGroup) router.replace('/(onboarding)' as any);
      }
    };
    
    void checkStateAndRoute();
  }, [isSignedIn, isLoaded, user, segments]);

  useEffect(() => {
    if (isSignedIn && user && !syncAttempted.current) {
      syncAttempted.current = true;
      createUserIfNotExists({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || '',
      }).catch((err: any) => {
        console.error('Failed to sync user to Firestore:', err);
      });
    } else if (!isSignedIn) {
      syncAttempted.current = false;
    }
  }, [isSignedIn, user]);

  return <Slot />;
}

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <InitialLayout />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
