import { NavigationContainer, type NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";

import Config from "@/config";
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { useAppTheme } from "@/theme/context";
import { hasSteamId, saveSteamId } from "@/utils/steamAuth";

import { MainNavigator, type MainTabParamList } from "./MainNavigator";
import { navigationRef, useBackButtonHandler } from "./navigationUtilities";

export type AppStackParamList = {
  Welcome: undefined;
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
  const [hasStoredSteamId, setHasStoredSteamId] = useState<boolean | null>(null);

  if (!hasStoredSteamId && __DEV__) {
    saveSteamId(74963221);
    setHasStoredSteamId(true);
  }

  // Check if user has Steam ID stored
  useEffect(() => {
    const checkSteamId = () => {
      const steamIdExists = hasSteamId();
      setHasStoredSteamId(steamIdExists);
    };

    checkSteamId();
  }, []);

  // Show loading state while checking Steam ID
  if (hasStoredSteamId === null) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={hasStoredSteamId ? "Main" : "Welcome"}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
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
