import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { ShareButton } from "@/components/profile/ShareButton";
import { AutoImage } from "@/components/ui/AutoImage";
import { Text } from "@/components/ui/Text";
import { useSteamProfile } from "@/hooks/useSteamProfile";
import { translate } from "@/i18n/translate";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { getSteamId } from "@/utils/steamAuth";

export const AccountSelector = () => {
  const { themed, theme } = useAppTheme();
  const navigator = useNavigation();

  const [player, setPlayer] = usePlayerSelected();

  const steamId = getSteamId();
  const { data: userProfile } = useSteamProfile(steamId);

  useEffect(() => {
    if (!player && userProfile) setPlayer(userProfile ?? null);
  }, [userProfile, setPlayer, player]);

  return (
    <View style={themed($header)}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
        {(player?.avatar || (!steamId && !player)) && (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.palette.neutral300,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {player?.avatar ? (
              <AutoImage source={{ uri: player.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            ) : (
              <FontAwesome6 name="user" solid color={theme.colors.textDim} size={24} />
            )}
          </View>
        )}
        <Text numberOfLines={1} preset="subheading" style={{ maxWidth: 160 }}>
          {!steamId && !player && !userProfile
            ? translate("common:noSteamAccount")
            : player && player.account_id !== steamId
              ? (player?.personaname ?? player?.realname ?? player?.account_id)
              : (userProfile?.personaname ?? userProfile?.realname ?? userProfile?.account_id ?? "Loading...")}
        </Text>
        {player && player.account_id !== steamId && (
          <TouchableOpacity onPress={() => setPlayer(userProfile ?? null)}>
            <FontAwesome6 name="reply" solid color={theme.colors.error} size={20} />
          </TouchableOpacity>
        )}
      </View>
      <View style={themed($buttonContainer)}>
        {player && <ShareButton player={player} style={{ marginRight: theme.spacing.xs }} />}
        <TouchableOpacity
          style={[themed($searchButton)]}
          onPress={() => navigator.navigate("MainDashboard", { screen: "PlayerSearch" })}
        >
          <FontAwesome6 name="magnifying-glass" solid color={theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
});

const $buttonContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
});

const $searchButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
});
