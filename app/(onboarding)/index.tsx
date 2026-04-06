import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { setLocalData, StorageKeys } from '../../lib/storage';
import { updateUserProfile } from '../../lib/firebase';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/Button';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [heightFormatted, setHeightFormatted] = useState('');
  const [weight, setWeight] = useState('');

  const canProceed = () => {
    switch (step) {
      case 1: return gender !== '';
      case 2: return goal !== '';
      case 3: return workoutDays !== '';
      case 4: return birthDay.length === 2 && birthMonth.length === 2 && birthYear.length === 4;
      case 5: return heightFormatted !== '' && weight !== '';
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    if (!user) return;
    
    const payload = {
      gender,
      goal,
      workoutDays,
      birthdate: `${birthYear}-${birthMonth}-${birthDay}`,
      height_ft: heightFormatted,
      weight_kg: weight,
    };

    router.replace({ pathname: '/(ai)/generate-plan' as any, params: payload });
  };

  const renderProgressBar = () => {
    return (
      <View className="flex-row items-center justify-between mb-8 mt-2 px-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const isActive = index + 1 <= step;
          return (
            <View
              key={index}
              className={`h-2 flex-1 mx-1 rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`}
            />
          );
        })}
      </View>
    );
  };

  const renderOptionCard = (label: string, icon: keyof typeof Ionicons.glyphMap, selectedState: string, setState: (val: string) => void) => {
    const isSelected = selectedState === label;
    return (
      <TouchableOpacity
        onPress={() => setState(label)}
        className={`bg-surface border-2 rounded-2xl p-5 mb-4 flex-row items-center`}
        style={{ borderColor: isSelected ? Colors.primary : Colors.border }}
      >
        <Ionicons name={icon} size={28} color={isSelected ? Colors.primary : Colors.text.secondary} />
        <Text className={`text-xl ml-4 font-semibold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background pt-14">
      <View className="px-6 pb-4">
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)} className="mb-2">
            <Ionicons name="arrow-back" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View className="mb-2 h-7" />
        )}
        {renderProgressBar()}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}>
        {step === 1 && (
          <View className="flex-1">
            <Text className="text-3xl font-bold text-text-primary mb-2">What is your gender?</Text>
            <Text className="text-text-secondary text-lg mb-8">This helps us calculate your specific metrics accurately.</Text>
            {renderOptionCard('Male', 'man-outline', gender, setGender)}
            {renderOptionCard('Female', 'woman-outline', gender, setGender)}
            {renderOptionCard('Other', 'transgender-outline', gender, setGender)}
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <Text className="text-3xl font-bold text-text-primary mb-2">What is your goal?</Text>
            <Text className="text-text-secondary text-lg mb-8">We will tailor your AI recommendations towards this.</Text>
            {renderOptionCard('Lose Weight', 'trending-down-outline', goal, setGoal)}
            {renderOptionCard('Maintain Weight', 'analytics-outline', goal, setGoal)}
            {renderOptionCard('Gain Weight', 'trending-up-outline', goal, setGoal)}
          </View>
        )}

        {step === 3 && (
          <View className="flex-1">
            <Text className="text-3xl font-bold text-text-primary mb-2">Workout Frequency?</Text>
            <Text className="text-text-secondary text-lg mb-8">How often do you train actively per week?</Text>
            {renderOptionCard('2-3 days', 'walk-outline', workoutDays, setWorkoutDays)}
            {renderOptionCard('3-4 days', 'fitness-outline', workoutDays, setWorkoutDays)}
            {renderOptionCard('5-6 days', 'barbell-outline', workoutDays, setWorkoutDays)}
          </View>
        )}

        {step === 4 && (
          <View className="flex-1">
            <Text className="text-3xl font-bold text-text-primary mb-2">When were you born?</Text>
            <Text className="text-text-secondary text-lg mb-8">Your age is necessary for calculating your metabolic rate.</Text>
            <View className="flex-row items-center space-x-4">
              <TextInput
                placeholder="DD"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="number-pad"
                maxLength={2}
                value={birthDay}
                onChangeText={setBirthDay}
                className="bg-surface border border-border rounded-xl flex-1 text-center py-4 text-xl font-bold text-text-primary"
              />
              <TextInput
                placeholder="MM"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="number-pad"
                maxLength={2}
                value={birthMonth}
                onChangeText={setBirthMonth}
                className="bg-surface border border-border rounded-xl flex-1 text-center py-4 text-xl font-bold text-text-primary"
              />
              <TextInput
                placeholder="YYYY"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="number-pad"
                maxLength={4}
                value={birthYear}
                onChangeText={setBirthYear}
                className="bg-surface border border-border rounded-xl flex-[1.5] text-center py-4 text-xl font-bold text-text-primary"
              />
            </View>
          </View>
        )}

        {step === 5 && (
          <View className="flex-1">
            <Text className="text-3xl font-bold text-text-primary mb-2">Body Metrics</Text>
            <Text className="text-text-secondary text-lg mb-8">Enter your height and weight manually.</Text>
            <View className="mb-6">
              <Text className="text-text-secondary font-medium ml-1 mb-2">Height (ft e.g., 5.11)</Text>
              <TextInput
                placeholder="5.9"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="decimal-pad"
                value={heightFormatted}
                onChangeText={setHeightFormatted}
                className="bg-surface border border-border rounded-xl py-4 px-5 text-xl font-bold text-text-primary mb-4"
              />
              <Text className="text-text-secondary font-medium ml-1 mb-2">Weight (kg)</Text>
              <TextInput
                placeholder="70"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                className="bg-surface border border-border rounded-xl py-4 px-5 text-xl font-bold text-text-primary"
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-6 pb-12">
        <Button
          title={step === TOTAL_STEPS ? "Complete Setup" : "Continue"}
          onPress={handleNext}
          disabled={!canProceed()}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
