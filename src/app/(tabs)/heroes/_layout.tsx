import { Stack } from "expo-router";

export default function HeroesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[heroId]" />
    </Stack>
  );
}