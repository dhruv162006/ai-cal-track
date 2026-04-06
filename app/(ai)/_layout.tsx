import { Stack } from 'expo-router';

export default function AILayout() {
  return (
    <Stack>
      <Stack.Screen name="generate-plan" options={{ headerShown: false }} />
    </Stack>
  );
}
