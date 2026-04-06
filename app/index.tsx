import { View, ActivityIndicator } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#FF4B4B" />
    </View>
  );
}
