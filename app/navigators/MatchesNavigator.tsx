import type { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import Config from "@/config";
import { MatchesDetailsScreen } from "@/screens/Matches/MatchesDetailsScreen";
import { MatchesListScreen } from "@/screens/Matches/MatchesListScreen";
import { useAppTheme } from "@/theme/context";
import { useBackButtonHandler } from "./navigationUtilities";

const exitRoutes = Config.exitRoutes;

export type MatchesStackParamList = {
  List: { matchIds?: number[] };
  Details: { matchId?: number };
};
export type MatchesStackScreenProps<T extends keyof MatchesStackParamList> = NativeStackScreenProps<
  MatchesStackParamList,
  T
>;

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer<MatchesStackParamList>>> {}

export const MatchesNavigator = (_props: NavigationProps) => {
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
      <Stack.Screen name="List" component={MatchesListScreen} />
      <Stack.Screen name="Details" component={MatchesDetailsScreen} />
    </Stack.Navigator>
  );
};
