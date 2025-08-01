import * as Application from "expo-application";
import { type FC, useCallback } from "react";
import { LayoutAnimation, Linking, type TextStyle, useColorScheme, View, type ViewStyle } from "react-native";

import { Button } from "@/components/ui/Button";
import { ListItem } from "@/components/ui/ListItem";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { isRTL } from "@/i18n";
import type { MainTabScreenProps } from "@/navigators/MainNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

/**
 * @param {string} url - The URL to open in the browser.
 * @returns {void} - No return value.
 */
function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null;

export const MainSettingsScreen: FC<MainTabScreenProps<"Settings">> = function MainSettingsScreen(_props) {
  const { setThemeContextOverride, themeContext, themed } = useAppTheme();

  // @ts-expect-error
  const usingFabric = global.nativeFabricUIManager != null;

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate the transition
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark");
  }, [themeContext, setThemeContextOverride]);

  // Resets the theme to the system theme
  const colorScheme = useColorScheme();
  const resetTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setThemeContextOverride(undefined);
  }, [setThemeContextOverride]);

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={[$styles.container, themed($container)]}>
      <Text
        style={themed($reportBugsLink)}
        tx="settingsScreen:reportBugs"
        onPress={() => openLinkInBrowser("https://github.com/infinitered/ignite/issues")}
      />

      <Text style={themed($title)} preset="heading" tx="settingsScreen:title" />
      <Text preset="bold">Current system theme: {colorScheme}</Text>
      <Text preset="bold">Current app theme: {themeContext}</Text>
      <Button onPress={resetTheme} text={`Reset`} />

      <View style={themed($itemsContainer)}>
        <Button onPress={toggleTheme} text={`Toggle Theme: ${themeContext}`} />
      </View>
      <View style={themed($itemsContainer)}>
        <ListItem
          LeftComponent={
            <View style={themed($item)}>
              <Text preset="bold">App Id</Text>
              <Text>{Application.applicationId}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={themed($item)}>
              <Text preset="bold">App Name</Text>
              <Text>{Application.applicationName}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={themed($item)}>
              <Text preset="bold">App Version</Text>
              <Text>{Application.nativeApplicationVersion}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={themed($item)}>
              <Text preset="bold">App Build Version</Text>
              <Text>{Application.nativeBuildVersion}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={themed($item)}>
              <Text preset="bold">Hermes Enabled</Text>
              <Text>{String(usingHermes)}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={themed($item)}>
              <Text preset="bold">Fabric Enabled</Text>
              <Text>{String(usingFabric)}</Text>
            </View>
          }
        />
      </View>
    </Screen>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
});

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxl,
});

const $reportBugsLink: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.lg,
  alignSelf: isRTL ? "flex-start" : "flex-end",
});

const $item: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});

const $itemsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xl,
});

const _$button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
});

const _$buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});

const _$hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
  lineHeight: 15,
  paddingBottom: spacing.lg,
});
