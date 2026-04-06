import React from 'react';
import { View, Text } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Button } from '../../components/Button';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-3xl font-bold text-text mb-4">Hello,</Text>
      <Text className="text-xl text-primary font-semibold mb-8">
        {user?.emailAddresses[0].emailAddress}
      </Text>
      
      <View className="w-full max-w-sm">
        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={() => signOut()} 
        />
      </View>
    </View>
  );
}
