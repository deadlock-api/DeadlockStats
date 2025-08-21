import { Stack } from "expo-router";
import { PlayerSearchScreen } from "../screens/Dashboard/PlayerSearchScreen";

export default function PlayerSearchModal() {
  return (
    <>
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />
      <PlayerSearchScreen />
    </>
  );
}