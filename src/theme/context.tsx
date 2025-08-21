// React Navigation themes removed for Expo Router
import { createContext, type FC, type PropsWithChildren, useCallback, useContext, useEffect, useMemo } from "react";
import { type StyleProp, useColorScheme } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import { storage } from "../utils/storage";

import { setImperativeTheming } from "./context.utils";
import { darkTheme, lightTheme } from "./theme";
import type {
  AllowedStylesT,
  ImmutableThemeContextModeT,
  Theme,
  ThemeContextModeT,
  ThemedFnT,
  ThemedStyle
} from "./types";

export type ThemeContextType = {
  setThemeContextOverride: (newTheme: ThemeContextModeT) => void;
  theme: Theme;
  themeContext: ImmutableThemeContextModeT;
  themed: ThemedFnT;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export interface ThemeProviderProps {
  initialContext?: ThemeContextModeT;
}

/**
 * The ThemeProvider is the heart and soul of the design token system. It provides a context wrapper
 * for your entire app to consume the design tokens as well as global functionality like the app's theme.
 *
 * To get started, you want to wrap your entire app's JSX hierarchy in `ThemeProvider`
 * and then use the `useAppTheme()` hook to access the theme context.
 *
 * Documentation: https://docs.infinite.red/ignite-cli/boilerplate/app/theme/Theming/
 */
export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({ children, initialContext }) => {
  // The operating system theme:
  const systemColorScheme = useColorScheme();
  // Our saved theme context: can be "light", "dark", or undefined (system theme)
  const [themeScheme, setThemeScheme] = useMMKVString("ignite.themeScheme", storage);

  /**
   * This function is used to set the theme context and is exported from the useAppTheme() hook.
   *  - setThemeContextOverride("dark") sets the app theme to dark no matter what the system theme is.
   *  - setThemeContextOverride("light") sets the app theme to light no matter what the system theme is.
   *  - setThemeContextOverride(undefined) the app will follow the operating system theme.
   */
  const setThemeContextOverride = useCallback(
    (newTheme: ThemeContextModeT) => {
      setThemeScheme(newTheme);
    },
    [setThemeScheme],
  );

  const themeContext: ImmutableThemeContextModeT = useMemo(() => {
    const t = initialContext || themeScheme || systemColorScheme || "light";
    return t === "dark" ? "dark" : "light";
  }, [initialContext, themeScheme, systemColorScheme]);

  // Navigation theme removed for Expo Router

  const theme: Theme = useMemo(() => {
    switch (themeContext) {
      case "dark":
        return darkTheme;
      default:
        return lightTheme;
    }
  }, [themeContext]);

  useEffect(() => {
    setImperativeTheming(theme);
  }, [theme]);

  const themed = useCallback(
    <T,>(styleOrStyleFn: AllowedStylesT<T>) => {
      const flatStyles = [styleOrStyleFn].flat(3) as (ThemedStyle<T> | StyleProp<T>)[];
      const stylesArray = flatStyles.map((f) => {
        if (typeof f === "function") {
          return (f as ThemedStyle<T>)(theme);
        } else {
          return f;
        }
      });
      // Flatten the array of styles into a single object
      return Object.assign({}, ...stylesArray) as T;
    },
    [theme],
  );

  const value = {
    theme,
    themeContext,
    setThemeContextOverride,
    themed,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * This is the primary hook that you will use to access the theme context in your components.
 * Documentation: https://docs.infinite.red/ignite-cli/boilerplate/app/theme/useAppTheme.tsx/
 */
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within an ThemeProvider");
  }
  return context;
};
