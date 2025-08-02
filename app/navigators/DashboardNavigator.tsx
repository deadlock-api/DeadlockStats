import type { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import Config from "@/config";
import { DashboardScreen } from "@/screens/Dashboard/DashboardScreen";
import { PlayerSearchScreen } from "@/screens/Dashboard/PlayerSearchScreen";
import type { SteamProfile } from "@/services/api/types/steam_profile";
import { useAppTheme } from "@/theme/context";
import { useBackButtonHandler } from "./navigationUtilities";

const exitRoutes = Config.exitRoutes;

export type DashboardStackParamList = {
  Dashboard: {
    selectedPlayer?: SteamProfile;
  };
  PlayerSearch: undefined;
};
export type DashboardStackScreenProps<T extends keyof DashboardStackParamList> = NativeStackScreenProps<
  DashboardStackParamList,
  T
>;

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer<DashboardStackParamList>>> {}

export const DashboardNavigator = (_props: NavigationProps) => {
  const { theme } = useAppTheme();

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="PlayerSearch" component={PlayerSearchScreen} />
    </Stack.Navigator>
  );
};
