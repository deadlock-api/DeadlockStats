import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, Linking } from "react-native";
import { usePlayerSelected } from "src/app/_layout";
import { translate } from "src/i18n/translate";
import { api } from "src/services/api";

export const useDeepLinking = () => {
  const router = useRouter();
  const [_, setPlayer] = usePlayerSelected();

  const handleProfileShare = async (accountId: string) => {
    try {
      const accountIdNumber = parseInt(accountId, 10);

      if (Number.isNaN(accountIdNumber)) {
        Alert.alert(translate("profileSharing:invalidProfileLink"), "The profile link is not valid.", [
          { text: translate("common:ok") },
        ]);
        return;
      }

      // Fetch the player profile
      const response = await api.getSteamProfile(accountIdNumber);

      if (response.ok && response.data) {
        // Set the player as selected
        setPlayer(response.data);

        // Navigate to the dashboard to show the player's stats
        router.replace("/(tabs)/dashboard");
      } else {
        Alert.alert(
          translate("profileSharing:sharedProfileError"),
          "Could not load the shared profile. Please try again.",
          [{ text: translate("common:ok") }],
        );
      }
    } catch (error) {
      console.error("Error loading shared profile:", error);
      Alert.alert(
        translate("profileSharing:sharedProfileError"),
        "Could not load the shared profile. Please try again.",
        [{ text: translate("common:ok") }],
      );
    }
  };

  const handleDeepLink = (url: string) => {
    // Handle profile sharing deep links
    const shareMatch = url.match(/\/share\/(\d+)/);
    if (shareMatch) {
      const accountId = shareMatch[1];
      handleProfileShare(accountId);
      return;
    }

    // Handle existing Steam auth callback
    if (url.includes("auth/steam/callback")) {
      // This is handled in WelcomeScreen, so we don't need to do anything here
      return;
    }
  };

  useEffect(() => {
    // Listen for incoming links when app is already running
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [handleDeepLink]);

  return {
    handleProfileShare,
  };
};
