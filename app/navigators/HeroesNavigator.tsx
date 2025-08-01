import type { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import Config from "@/config";
import { HeroesDetailsScreen } from "@/screens/Heroes/HeroesDetailsScreen";
import { HeroesListScreen } from "@/screens/Heroes/HeroesListScreen";
import { useAppTheme } from "@/theme/context";
import { useBackButtonHandler } from "./navigationUtilities";

const exitRoutes = Config.exitRoutes;

export type HeroesStackParamList = {
  List: undefined;
  Details: { hero_id: number };
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
        navigationBarColor: theme.colors.background,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="List" component={HeroesListScreen} />
      <Stack.Screen name="Details" component={HeroesDetailsScreen} />
    </Stack.Navigator>
  );
};
