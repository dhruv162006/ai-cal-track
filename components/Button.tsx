import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

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
        return 'bg-card border border-border';
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
        return 'text-text';
      case 'outline':
        return 'text-primary';
      case 'primary':
      default:
        return 'text-white';
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
        <ActivityIndicator color={variant === 'outline' ? '#FF4B4B' : '#FFFFFF'} className="mr-2" />
      ) : null}
      <Text className={`${getVariantTextStyles()} font-bold text-base`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
