import type { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import Config from "@/config";
import { HeroDetailsScreen } from "@/screens/Heroes/HeroDetailsScreen";
import { HeroesStatsScreen } from "@/screens/Heroes/HeroesStatsScreen";
import { useAppTheme } from "@/theme/context";
import { useBackButtonHandler } from "./navigationUtilities";

const exitRoutes = Config.exitRoutes;

export type HeroesStackParamList = {
  Stats: undefined;
  Details: { heroId: number };
};
export type HeroesStackScreenProps<T extends keyof HeroesStackParamList> = NativeStackScreenProps<
  HeroesStackParamList,
  T
>;

const Stack = createNativeStackNavigator<HeroesStackParamList>();

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer<HeroesStackParamList>>> {}

export const HeroesNavigator = (_props: NavigationProps) => {
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
      <Stack.Screen name="Stats" component={HeroesStatsScreen} />
      <Stack.Screen name="Details" component={HeroDetailsScreen} />
    </Stack.Navigator>
  );
};
