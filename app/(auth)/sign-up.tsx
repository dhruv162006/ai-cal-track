import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { Link as ExpoLink, useRouter } from 'expo-router';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err?.errors?.[0]?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        const userId = completeSignUp.createdUserId;
        
        if (userId) {
          // Sync logic is safely abstracted to the layout listener to prevent duplicate logic
        }

        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        Alert.alert("Error", "Could not complete verification");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err?.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {!pendingVerification && (
          <>
            <View className="mb-10">
              <Text className="text-4xl font-bold text-text-primary mb-2">Create Account</Text>
              <Text className="text-text-secondary text-lg">Start your fitness journey today.</Text>
            </View>

            <InputField
              label="Full Name"
              placeholder="Enter your name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
            />

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
              placeholder="Create a password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Button
              title="Sign Up"
              onPress={onSignUpPress}
              loading={loading}
              className="mt-6"
            />

            <View className="flex-row justify-center mt-8">
              <Text className="text-text-secondary text-base">Already have an account? </Text>
              <ExpoLink href="/(auth)/sign-in">
                <Text className="text-primary font-bold text-base">Sign In</Text>
              </ExpoLink>
            </View>
          </>
        )}

        {pendingVerification && (
          <>
            <View className="mb-10">
              <Text className="text-4xl font-bold text-text-primary mb-2">Check your email</Text>
              <Text className="text-text-secondary text-lg">We sent a verification code to {emailAddress}</Text>
            </View>

            <InputField
              label="Verification Code"
              placeholder="Enter 6-digit code"
              icon="key-outline"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />

            <Button
              title="Verify Email"
              onPress={onPressVerify}
              loading={loading}
              className="mt-6"
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
