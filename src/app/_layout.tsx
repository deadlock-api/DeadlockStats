import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createGlobalState } from "react-native-global-state-hooks";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { DEFAULT_TIME_RANGE, type TimeRange } from "src/components/select/TimeRangeSelect";
import { useDeepLinking } from "src/hooks/useDeepLinking";
import { initI18n } from "src/i18n";
import type { SteamProfile } from "src/services/api/types/steam_profile";
import { ThemeProvider } from "src/theme/context";
import { customFontsToLoad } from "src/theme/typography";
import { loadDateFnsLocale } from "src/utils/formatDate";

// Globals
export const usePlayerSelected = createGlobalState<SteamProfile | null>(null);
export const useTimeRangeSelected = createGlobalState<TimeRange>(DEFAULT_TIME_RANGE);

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

  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null;
  }

  const queryClient = new QueryClient();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }} />
          </QueryClientProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
