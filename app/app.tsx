/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
import "./utils/gestureHandler";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { createGlobalState } from "react-hooks-global-states";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { DEFAULT_TIME_RANGE, type TimeRange } from "@/components/select/TimeRangeSelect";
import { initI18n } from "./i18n";
import { AppNavigator } from "./navigators/AppNavigator";
import { useNavigationPersistence } from "./navigators/navigationUtilities";
import type { SteamProfile } from "./services/api/types/steam_profile";
import { ThemeProvider } from "./theme/context";
import { customFontsToLoad } from "./theme/typography";
import { loadDateFnsLocale } from "./utils/formatDate";
import * as storage from "./utils/storage";

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE";

// Globals
export const usePlayerSelected = createGlobalState<SteamProfile | null>(null);
export const useTimeRangeSelected = createGlobalState<TimeRange>(DEFAULT_TIME_RANGE);

// Web linking configuration
const prefix = Linking.createURL("/");
const config = {
  screens: {
    Welcome: "welcome",
    "auth/steam/callback": "auth/steam/callback",
    Main: {
      screens: {
        Dashboard: "dashboard",
        MatchesList: "matches",
        MatchDetails: "matches/:matchId",
        HeroesStats: "heroes",
        HeroesDetails: "heroes/:heroId",
        Settings: "settings",
      },
    },
  },
};

/**
 * This is the root component of our app.
 *
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY);

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale());
  }, []);

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!isNavigationStateRestored || !isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null;
  }

  const linking = {
    prefixes: [prefix],
    config,
  };

  const queryClient = new QueryClient();

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AppNavigator
              linking={linking}
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
