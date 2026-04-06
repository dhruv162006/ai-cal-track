import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const STEPS = [
  'Analyzing your profile',
  'Calculating calorie needs',
  'Generating macro distribution',
  'Creating personalized tips',
  'Finalizing your plan',
];

interface LoadingStepsProps {
  isAiDone: boolean;
}

export function LoadingSteps({ isAiDone }: LoadingStepsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // We only simulate up to step index 3 (the 4th step: "Creating personalized tips") completing.
    // Index 4 ("Finalizing...") waits for isAiDone indefinitely.
    if (currentStepIndex < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 1200); // Progress every ~1.2s artificially
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  useEffect(() => {
    // When the external AI call cleanly resolves, force evaluate the absolute final step.
    if (isAiDone) {
      setCurrentStepIndex(STEPS.length); // Push out of bounds (length = 5) meaning ALL are completed
    }
  }, [isAiDone]);

  return (
    <View className="w-full mt-4">
      <Text className="text-xl font-bold text-text-primary text-center mb-6">
        Creating your personalized blueprint...
      </Text>
      
      <View className="w-full bg-surface rounded-3xl p-6 border border-border shadow-sm">
        {STEPS.map((step, index) => {
          const isPending = index > currentStepIndex;
          const isActive = index === currentStepIndex && !isAiDone;
          const isCompleted = index < currentStepIndex || (index === STEPS.length - 1 && isAiDone);

          return (
            <View key={index} className="flex-row items-center mb-5 last:mb-0">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-4 bg-background border border-border overflow-hidden">
                {isCompleted ? (
                  <View className="w-full h-full bg-green-500 items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="white" />
                  </View>
                ) : isActive ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <View className="w-2 h-2 rounded-full bg-border" /> // Soft pending dot
                )}
              </View>
              <Text
                className={`text-base font-medium flex-1 ${
                  isActive || isCompleted ? 'text-text-primary' : 'text-text-secondary opacity-50'
                }`}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
