import { NavigationContainer, type NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";

import Config from "@/config";
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary";
import { useAppTheme } from "@/theme/context";

import { MainNavigator, type MainTabParamList } from "./MainNavigator";
import { navigationRef, useBackButtonHandler } from "./navigationUtilities";

export type AppStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
};

const exitRoutes = Config.exitRoutes;

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme();

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  );
};
