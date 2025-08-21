import { Stack } from "expo-router";

export default function MatchesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[matchId]/index" />
      <Stack.Screen name="[matchId]/player/[accountId]" />
    </Stack>
  );
}