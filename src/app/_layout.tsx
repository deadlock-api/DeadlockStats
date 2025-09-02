import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SteamProfile } from "deadlock-api-client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createGlobalState } from "react-native-global-state-hooks";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { DEFAULT_TIME_RANGE, type TimeRange } from "src/components/select/TimeRangeSelect";
import { useDeepLinking } from "src/hooks/useDeepLinking";
import { initI18n } from "src/i18n";
import { ThemeProvider } from "src/theme/context";
import { isAnalyticsEnabled } from "src/utils/analytics";
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
      <PostHogProvider
        apiKey="phc_Z9gIP4QbqkIYVaE2FR0SgDcnmhwWHsyZld5aGuy2k8"
        options={{
          host: "https://eu.i.posthog.com",
          enableSessionReplay: isAnalyticsEnabled(),
          disabled: !isAnalyticsEnabled(),
        }}
        autocapture={isAnalyticsEnabled()}
      >
        <KeyboardProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="player-search" options={{ presentation: "modal" }} />
              </Stack>
            </QueryClientProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}
