import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { generateNutritionPlan, UserData, NutritionPlan } from '../../lib/ai';
import { updateUserProfile } from '../../lib/firebase';
import { setLocalData, StorageKeys } from '../../lib/storage';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/Button';
import { LoadingSteps } from '../../components/LoadingSteps';

export default function GeneratePlanScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const generationTriggered = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [aiCompleted, setAiCompleted] = useState(false);

  const triggerGeneration = async () => {
    if (generationTriggered.current) return;
    
    if (!user?.id) {
      console.error('User not ready, skipping save');
      return;
    }
    
    console.log('User ready:', user.id);
    generationTriggered.current = true;
    setLoading(true);
    setAiCompleted(false);
    setError('');

    try {
      const computedPlan = await generateNutritionPlan(params as unknown as UserData);
      setPlan(computedPlan);

      console.log('Auto-saving nutrition plan...');
      const fullUpdatePayload = {
        gender: params.gender,
        goal: params.goal,
        workoutDays: params.workoutDays,
        birthdate: params.birthdate,
        height_ft: params.height_ft,
        weight_kg: params.weight_kg,
        onboardingCompleted: true,
        nutritionPlan: {
          calories: computedPlan.calories,
          protein: computedPlan.protein,
          carbs: computedPlan.carbs,
          fats: computedPlan.fats,
          waterIntakeLiters: computedPlan.waterIntakeLiters,
          tips: computedPlan.tips,
          createdAt: new Date().toISOString()
        }
      };

      const removeUndefinedFields = (obj: any) => {
        return Object.fromEntries(
          Object.entries(obj).filter(([_, v]) => v !== undefined)
        );
      };

      const safePayload = removeUndefinedFields(fullUpdatePayload);
      console.log('Sanitized payload:', safePayload);

      await updateUserProfile(user.id, safePayload);
      await setLocalData(StorageKeys.USER_ONBOARDING, true);
      console.log('Auto-save successful');

      // Trigger the 5th checkmark gracefully, wait roughly 1.3 seconds so user visually feels resolution
      setAiCompleted(true);
      setTimeout(() => {
        setLoading(false);
      }, 1300);

    } catch (err: any) {
      console.log('Auto-save failed');
      setError(err?.message || 'We encountered an error contacting the AI server or saving data.');
      generationTriggered.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    void triggerGeneration();
  }, [isLoaded, user]);

  const handleFinish = async () => {
    router.replace('/(app)');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center px-6">
        <LoadingSteps isAiDone={aiCompleted} />
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Ionicons name="warning" size={48} color={Colors.error} className="mb-4" />
        <Text className="text-2xl font-bold text-text-primary mb-2 text-center">Generation Failed</Text>
        <Text className="text-text-secondary text-base text-center mb-8">{error}</Text>
        <Button title="Retry Generation" onPress={triggerGeneration} className="w-full" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pt-14">
      <View className="px-6 pb-4">
        <Text className="text-3xl font-bold text-text-primary mb-2">Your AI Blueprint</Text>
        <Text className="text-text-secondary text-base">Perfectly mapped to your biometric profile.</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <View className="bg-surface rounded-3xl p-6 mb-6 mt-4 border border-border shadow-sm">
          <Text className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-1">Daily Burn</Text>
          <View className="flex-row items-end mb-6">
            <Text className="text-5xl font-black text-text-primary">{plan.calories}</Text>
            <Text className="text-lg text-text-secondary font-bold mb-1 ml-2">kcal</Text>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-text-secondary font-medium mb-1 line-clamp-1">Protein</Text>
              <Text className="text-xl font-bold text-text-primary">{plan.protein}g</Text>
            </View>
            <View>
              <Text className="text-text-secondary font-medium mb-1 line-clamp-1">Carbs</Text>
              <Text className="text-xl font-bold text-text-primary">{plan.carbs}g</Text>
            </View>
            <View>
              <Text className="text-text-secondary font-medium mb-1 line-clamp-1">Fats</Text>
              <Text className="text-xl font-bold text-text-primary">{plan.fats}g</Text>
            </View>
          </View>
        </View>

        <View className="bg-surface rounded-2xl p-5 mb-6 border border-border flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-[#E5F1FB] items-center justify-center mr-4">
            <Ionicons name="water" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-lg mb-0.5">Hydration Goal</Text>
            <Text className="text-text-secondary">{plan.waterIntakeLiters} liters daily strictly</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-text-primary mb-4 mt-2">Coach Tips</Text>
        {plan.tips.map((tip, index) => (
          <View key={index} className="flex-row mb-4 pl-1">
            <View className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 opacity-80" />
            <Text className="text-text-primary text-base leading-6 flex-1">{tip}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-12 pt-4 bg-background border-t border-border">
        <Button
          title="Proceed to Dashboard"
          onPress={handleFinish}
          loading={saving}
        />
      </View>
    </View>
  );
}
