import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export const SocialButton = ({ title, onPress, loading = false }: SocialButtonProps) => {
  return (
    <TouchableOpacity
      className="bg-card border border-border rounded-2xl py-3.5 flex-row items-center justify-center mb-4"
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" className="mr-3" />
      ) : (
        <Ionicons name="logo-google" size={20} color="#FFFFFF" className="mr-3" />
      )}
      <Text className="text-text font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  );
};
