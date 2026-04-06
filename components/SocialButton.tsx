import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export const SocialButton = ({ title, onPress, loading = false }: SocialButtonProps) => {
  return (
    <TouchableOpacity
      className="bg-surface border border-border rounded-2xl py-3.5 flex-row items-center justify-center mb-4"
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text.primary} className="mr-3" />
      ) : (
        <Ionicons name="logo-google" size={20} color={Colors.text.primary} className="mr-3" />
      )}
      <Text className="text-text-primary font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  );
};
