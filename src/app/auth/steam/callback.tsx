import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Text } from "src/components/ui/Text";

export default function SteamCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle Steam auth callback logic here
    // For now, just redirect to main app
    router.replace("/(tabs)/dashboard");
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Processing Steam authentication...</Text>
    </View>
  );
}
