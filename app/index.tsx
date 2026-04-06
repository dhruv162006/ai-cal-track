import { View, ActivityIndicator } from "react-native";

import { Colors } from '../constants/colors';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
