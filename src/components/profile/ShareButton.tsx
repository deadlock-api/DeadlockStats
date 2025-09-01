import { FontAwesome6 } from "@expo/vector-icons";
import type { SteamProfile } from "deadlock-api-client";
import { Alert, Share, TouchableOpacity, type ViewStyle } from "react-native";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";

interface ShareButtonProps {
  player: SteamProfile;
  style?: ViewStyle;
}

export const ShareButton = ({ player, style }: ShareButtonProps) => {
  const { themed, theme } = useAppTheme();

  const handleShare = async () => {
    try {
      const shareUrl = `https://deadlock-api.com/share/${player.account_id}`;
      const shareMessage = translate("profileSharing:shareMessage");
      const playerName = player.personaname ?? player.realname ?? `Player ${player.account_id}`;

      const result = await Share.share({
        message: `${shareMessage} ${playerName}\n${shareUrl}`,
        url: shareUrl,
        title: translate("profileSharing:shareProfile"),
      });

      // Handle share result if needed
      if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
      }
    } catch (error) {
      console.error("Error sharing profile:", error);
      Alert.alert(translate("profileSharing:shareError"), "Please try again later.", [
        { text: translate("common:ok") },
      ]);
    }
  };

  return (
    <TouchableOpacity
      style={[themed($shareButton), style]}
      onPress={handleShare}
      accessibilityLabel={translate("profileSharing:shareProfile")}
      accessibilityRole="button"
    >
      <FontAwesome6 name="share-nodes" solid color={theme.colors.text} size={20} />
    </TouchableOpacity>
  );
};

const $shareButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
});
