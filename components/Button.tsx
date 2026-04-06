import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

import { Colors } from '../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-surface border border-border';
      case 'outline':
        return 'bg-transparent border-2 border-primary';
      case 'primary':
      default:
        return 'bg-primary';
    }
  };

  const getVariantTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-text-primary';
      case 'outline':
        return 'text-primary';
      case 'primary':
      default:
        return 'text-text-inverse';
    }
  };

  return (
    <TouchableOpacity
      className={`rounded-2xl py-4 items-center justify-center flex-row ${getVariantStyles()} ${
        disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text.inverse} className="mr-2" />
      ) : null}
      <Text className={`${getVariantTextStyles()} font-bold text-base`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
