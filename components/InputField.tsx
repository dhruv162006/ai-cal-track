import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';

interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export const InputField = ({
  label,
  icon,
  error,
  isPassword,
  ...props
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="text-text-secondary text-sm font-medium mb-1.5 ml-1">{label}</Text>}
      <View className={`flex-row items-center bg-surface border ${error ? 'border-error' : 'border-border'} rounded-2xl px-4 py-3.5`}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={Colors.text.secondary}
            className="mr-3"
          />
        )}
        <TextInput
          className="flex-1 text-text-primary text-base"
          placeholderTextColor={Colors.text.secondary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-primary text-xs mt-1.5 ml-1">{error}</Text>}
    </View>
  );
};
