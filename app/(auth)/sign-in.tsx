import React, { useState, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { SocialButton } from '../../components/SocialButton';
import { Divider } from '../../components/Divider';
import { Link as ExpoLink, useRouter } from 'expo-router';

import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Sign in failed");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err?.errors?.[0]?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId) {
        setOAuthActive!({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('OAuth error', err);
      Alert.alert("Error", err?.errors?.[0]?.message || "Google Sign-In failed");
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-10">
          <Text className="text-4xl font-bold text-text-primary mb-2">Welcome back,</Text>
          <Text className="text-text-secondary text-lg">Sign in to continue your journey.</Text>
        </View>

        <SocialButton 
          title="Continue with Google" 
          onPress={onGoogleSignInPress}
          loading={googleLoading}
        />

        <Divider text="OR LOG IN WITH EMAIL" />

        <InputField
          label="Email"
          placeholder="Enter your email"
          icon="mail-outline"
          value={emailAddress}
          onChangeText={setEmailAddress}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Button
          title="Sign In"
          onPress={onSignInPress}
          loading={loading}
          className="mt-6"
        />

        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary text-base">Don't have an account? </Text>
          <ExpoLink href="/(auth)/sign-up">
            <Text className="text-primary font-bold text-base">Sign Up</Text>
          </ExpoLink>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
