import { FontAwesome6 } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import { Alert, type TextStyle, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { translate } from "@/i18n/translate";
import type { AppStackScreenProps } from "@/navigators/AppNavigator";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import {
  convertToSteamID3,
  extractSteamIdFromUrl,
  removeSkipWelcomePreference,
  saveSkipWelcomePreference,
  saveSteamId
} from "@/utils/steamAuth";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { themed, theme } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initiates the Steam OpenID Connect authentication flow
   */
  const handleSteamSignIn = useCallback(async () => {
    setIsLoading(true);

    try {
      // Build Steam OpenID parameters
      const params = new URLSearchParams({
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": "https://deadlock-api.com/auth/steam/callback",
        "openid.realm": "https://deadlock-api.com",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
      });

      const steamAuthUrl = `${STEAM_OPENID_URL}?${params.toString()}`;

      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(steamAuthUrl);
      if (canOpen) {
        await Linking.openURL(steamAuthUrl);
      } else {
        throw new Error("Cannot open Steam authentication URL");
      }
    } catch (error) {
      console.error("Steam sign-in error:", error);
      setIsLoading(false);
      Alert.alert(translate("welcomeScreen:errorTitle"), translate("welcomeScreen:errorMessage"), [
        {
          text: translate("welcomeScreen:errorRetryButton"),
          onPress: () => setIsLoading(false),
        },
      ]);
    }
  }, []);

  /**
   * Handles the Steam authentication callback
   */
  const handleAuthCallback = useCallback(
    (url: string) => {
      try {
        const steamId64 = extractSteamIdFromUrl(url);

        if (steamId64) {
          // Convert to SteamID3 format
          const steamId3 = convertToSteamID3(steamId64);

          // Save to storage
          const saved = saveSteamId(steamId3);

          if (saved) {
            // Remove skip preference since user has now linked Steam
            removeSkipWelcomePreference();
            // Navigate to main app
            navigation.navigate("Main");
          } else {
            throw new Error("Failed to save Steam ID");
          }
        } else {
          throw new Error("Steam ID not found in callback URL");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setIsLoading(false);
        Alert.alert(translate("welcomeScreen:errorTitle"), translate("welcomeScreen:errorMessage"), [
          {
            text: translate("welcomeScreen:errorRetryButton"),
            onPress: () => {},
          },
        ]);
      }
    },
    [navigation],
  );

  /**
   * Handles skipping the welcome screen
   */
  const handleSkip = useCallback(() => {
    saveSkipWelcomePreference(true);
    navigation.navigate("Main");
  }, [navigation]);

  /**
   * Set up deep link listener for Steam auth callback
   */
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes("auth/steam/callback")) {
        handleAuthCallback(event.url);
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url?.includes("auth/steam/callback")) {
        handleAuthCallback(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [handleAuthCallback]);

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={themed([$container, { paddingTop: top + 20 }])}
      safeAreaEdges={["bottom"]}
    >
      <View style={themed($content)}>
        <Text preset="heading" tx="welcomeScreen:title" style={themed($title)} />

        <Text preset="subheading" tx="welcomeScreen:subtitle" style={themed($subtitle)} />

        <Text tx="welcomeScreen:description" style={themed($description)} />

        <Button preset="filled" onPress={handleSteamSignIn} style={themed($signInButton)}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text>{translate("welcomeScreen:signInButton")}</Text>
            <FontAwesome6 name="steam" solid color={theme.colors.text} size={20} style={{ marginHorizontal: 8 }} />
          </View>
        </Button>

        <Button preset="default" onPress={handleSkip} style={themed($skipButton)}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text>{translate("welcomeScreen:skipButton")}</Text>
            <FontAwesome6 name="forward" solid color={theme.colors.text} size={20} />
          </View>
        </Button>

        <Text tx="welcomeScreen:skipDescription" style={themed($skipDescription)} />

        {isLoading && <Text tx="welcomeScreen:loadingMessage" style={themed($loadingText)} />}
      </View>
    </Screen>
  );
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
});

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $title: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.md,
});

const $subtitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.lg,
});

const $description: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginBottom: spacing.xl,
  color: colors.textDim,
  lineHeight: 24,
});

const $signInButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  width: 200,
});

const $skipButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  width: 200,
});

const $skipDescription: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  color: colors.textDim,
  fontSize: 14,
  marginBottom: spacing.lg,
});

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  textAlign: "center",
  color: colors.textDim,
});
