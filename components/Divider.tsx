import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
}

export const Divider = ({ text }: DividerProps) => {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-[1px] bg-border" />
      {text && (
        <View className="px-4">
          <Text className="text-text-secondary text-sm font-medium">{text}</Text>
        </View>
      )}
      <View className="flex-1 h-[1px] bg-border" />
    </View>
  );
};
