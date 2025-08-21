import { useNavigation } from "expo-router";
import { useEffect, useLayoutEffect } from "react";
import { Platform } from "react-native";

import { Header, type HeaderProps } from "src/components/ui/Header";

/**
 * A hook that can be used to easily set the Header of an Expo Router screen from within the screen's component.
 * @param {HeaderProps} headerProps - The props for the `Header` component.
 * @param {any[]} deps - The dependencies to watch for changes to update the header.
 */
export function useHeader(headerProps: HeaderProps, deps: Parameters<typeof useLayoutEffect>[1] = []) {
  const navigation = useNavigation();

  /**
   * We need to have multiple implementations of this hook for web and mobile.
   * Web needs to use useEffect to avoid a rendering loop.
   * In mobile and also to avoid a visible header jump when navigating between screens, we use
   * `useLayoutEffect`, which will apply the settings before the screen renders.
   */
  const usePlatformEffect = Platform.OS === "web" ? useEffect : useLayoutEffect;

  // To avoid a visible header jump when navigating between screens, we use
  // `useLayoutEffect`, which will apply the settings before the screen renders.
  usePlatformEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <Header {...headerProps} />,
    });
    // intentionally created API to have user set when they want to update the header via `deps`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, navigation]);
}
