import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createGlobalState } from "react-native-global-state-hooks";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { DEFAULT_TIME_RANGE, type TimeRange } from "../components/select/TimeRangeSelect";
import { useDeepLinking } from "../hooks/useDeepLinking";
import { initI18n } from "../i18n";
import type { SteamProfile } from "../services/api/types/steam_profile";
import { ThemeProvider } from "../theme/context";
import { customFontsToLoad } from "../theme/typography";
import { loadDateFnsLocale } from "../utils/formatDate";

// Globals
export const usePlayerSelected = createGlobalState<SteamProfile | null>(null);
export const useTimeRangeSelected = createGlobalState<TimeRange>(DEFAULT_TIME_RANGE);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  // Initialize deep linking
  useDeepLinking();

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale());
  }, []);

  useEffect(() => {
    if ((areFontsLoaded || fontLoadError) && isI18nInitialized) {
      SplashScreen.hideAsync();
    }
  }, [areFontsLoaded, fontLoadError, isI18nInitialized]);

  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null;
  }

  const queryClient = new QueryClient();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Stack screenOptions={{ headerShown: false }} />
            </QueryClientProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}