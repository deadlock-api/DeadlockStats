import type { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import Config from "@/config";
import { ProfileOverviewScreen } from "@/screens/Profile/ProfileOverviewScreen";
import { useAppTheme } from "@/theme/context";
import { useBackButtonHandler } from "./navigationUtilities";

const exitRoutes = Config.exitRoutes;

export type ProfileStackParamList = {
  Overview: undefined;
};
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = NativeStackScreenProps<
  ProfileStackParamList,
  T
>;

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer<ProfileStackParamList>>> {}

export const ProfileNavigator = (_props: NavigationProps) => {
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
      <Stack.Screen name="Overview" component={ProfileOverviewScreen} />
    </Stack.Navigator>
  );
};
