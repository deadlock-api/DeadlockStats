import { Stack } from "expo-router";
import { DashboardScreen } from "../../screens/Dashboard/DashboardScreen";

export default function Dashboard() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DashboardScreen />
    </>
  );
}
