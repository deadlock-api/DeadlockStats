import { FontAwesome6 } from "@expo/vector-icons";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import type React from "react";
import { useCallback, useState } from "react";
import { LayoutAnimation, Linking, Switch, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { getAnalyticsOptOut, saveAnalyticsOptOut } from "src/utils/analytics";
import { hasSteamId, removeSkipWelcomePreference, removeSteamId } from "src/utils/steamAuth";

export default function Settings() {
  const router = useRouter();
  const { setThemeContextOverride, themeContext, themed, theme } = useAppTheme();

  // Analytics opt-out state
  const [analyticsOptOut, setAnalyticsOptOut] = useState(getAnalyticsOptOut());

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate the transition
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark");
  }, [themeContext, setThemeContextOverride]);

  // Handle analytics opt-out toggle
  const toggleAnalyticsOptOut = useCallback(() => {
    const newOptOut = !analyticsOptOut;
    setAnalyticsOptOut(newOptOut);
    saveAnalyticsOptOut(newOptOut);
  }, [analyticsOptOut]);

  // Handle sign out
  const handleSignOut = useCallback(() => {
    removeSteamId();
    removeSkipWelcomePreference();
    router.replace("/welcome");
  }, [router]);

  // Handle linking to Steam
  const handleLinkToSteam = useCallback(() => {
    removeSkipWelcomePreference();
    router.replace("/welcome");
  }, [router]);

  // Check if user has Steam account linked
  const hasLinkedSteam = hasSteamId();

  return (
    <Screen preset="scroll" contentContainerStyle={[$styles.container, themed($container)]}>
      <Text style={themed($title)} preset="heading" tx="settingsScreen:title" />
      <SettingsSection title={translate("settingsScreen:appearanceSection")}>
        <SettingsItem
          icon={<FontAwesome6 name="moon" solid color={theme.colors.text} size={20} />}
          title={translate("settingsScreen:darkMode")}
          subtitle={translate("settingsScreen:useDarkTheme")}
          onPress={toggleTheme}
          rightElement={
            <Switch
              value={themeContext === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.palette.neutral300, true: theme.colors.palette.primary500 }}
              thumbColor={theme.colors.palette.primary700}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title={translate("settingsScreen:privacySection")}>
        <SettingsItem
          icon={<FontAwesome6 name="chart-line" solid color={theme.colors.text} size={20} />}
          title={translate("settingsScreen:analyticsOptOut")}
          subtitle={translate("settingsScreen:analyticsOptOutDescription")}
          onPress={toggleAnalyticsOptOut}
          rightElement={
            <Switch
              value={analyticsOptOut}
              onValueChange={toggleAnalyticsOptOut}
              trackColor={{ false: theme.colors.palette.neutral300, true: theme.colors.palette.primary500 }}
              thumbColor={theme.colors.palette.primary700}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title={translate("settingsScreen:supportSection")}>
        <SettingsItem
          icon={<FontAwesome6 name="discord" solid color={theme.colors.text} size={20} />}
          title={translate("settingsScreen:contactUs")}
          subtitle={translate("settingsScreen:joinDiscordServer")}
          onPress={() => Linking.openURL("https://discord.gg/XMF9Xrgfqu")}
        />
        <SettingsItem
          icon={<FontAwesome6 name="shield" solid color={theme.colors.text} size={20} />}
          title={translate("settingsScreen:privacyPolicy")}
          subtitle={translate("settingsScreen:readPrivacyPolicy")}
          onPress={() => Linking.openURL("https://deadlock-api.com/deadlockstats-privacy")}
        />
      </SettingsSection>

      <SettingsSection title={translate("settingsScreen:accountSection")}>
        {hasLinkedSteam ? (
          <SettingsItem
            icon={
              <FontAwesome6 name="arrow-right-from-bracket" solid color={theme.colors.palette.angry500} size={20} />
            }
            title={translate("settingsScreen:signOut")}
            subtitle={translate("settingsScreen:logOutOfAccount")}
            onPress={handleSignOut}
            rightElement={<FontAwesome6 name="chevron-right" solid color={theme.colors.palette.angry500} size={20} />}
          />
        ) : (
          <SettingsItem
            icon={<FontAwesome6 name="steam" solid color={theme.colors.text} size={20} />}
            title={translate("settingsScreen:linkToSteam")}
            subtitle={translate("settingsScreen:linkSteamAccount")}
            onPress={handleLinkToSteam}
            rightElement={<FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={20} />}
          />
        )}
      </SettingsSection>

      <Text style={themed($version)} size="xxs">
        {translate("settingsScreen:version")} {Application.nativeApplicationVersion}
      </Text>
    </Screen>
  );
}

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { themed, theme } = useAppTheme();
  return (
    <View style={themed($section)}>
      <Text size="xs" style={[themed($sectionTitle), { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={[themed($sectionContent), { backgroundColor: theme.colors.palette.neutral100 }]}>{children}</View>
    </View>
  );
};

export const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) => {
  const { themed, theme } = useAppTheme();
  return (
    <TouchableOpacity
      style={[themed($settingsItem), { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={themed($settingsLeft)}>
        <View style={[themed($settingsIcon), { backgroundColor: theme.colors.palette.primary600 }]}>{icon}</View>
        <View style={themed($settingsText)}>
          <Text style={[themed($settingsTitle), { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text size="xxs" style={[themed($settingsSubtitle), { color: theme.colors.textDim }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={themed($settingsRight)}>
        {rightElement || <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={20} />}
      </View>
    </TouchableOpacity>
  );
};

const $section: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 24,
});

const $sectionTitle: ThemedStyle<TextStyle> = () => ({
  fontFamily: "Inter-SemiBold",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
});

const $sectionContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 16,
  overflow: "hidden",
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  paddingHorizontal: spacing.xs,
});

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
});

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxl,
});

const $settingsItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
});

const $settingsLeft: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
});

const $settingsIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: spacing.md,
  justifyContent: "center",
  alignItems: "center",
});

const $settingsText: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $settingsTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
});

const $settingsSubtitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.normal,
});

const $settingsRight: ThemedStyle<ViewStyle> = () => ({
  width: 50,
  alignItems: "flex-end",
});

const $version: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  textAlign: "center",
  color: colors.textDim,
});
