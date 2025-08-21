import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "src/components/ui/Text";

export default function ShareProfile() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Shared Profile: {accountId}</Text>
    </View>
  );
}
