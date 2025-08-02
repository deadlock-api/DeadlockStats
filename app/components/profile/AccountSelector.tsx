import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type React from "react";
import { useEffect } from "react";
import { TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { AutoImage } from "@/components/ui/AutoImage";
import { Text } from "@/components/ui/Text";
import { useSteamProfile } from "@/hooks/useSteamProfile";
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
        {player?.avatar && (
          <AutoImage source={{ uri: player?.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
        )}
        <Text preset="subheading">
          {player && player.account_id !== steamId
            ? (player?.personaname ?? player?.realname ?? player?.account_id)
            : (userProfile?.personaname ?? userProfile?.realname ?? userProfile?.account_id)}
        </Text>
        {player && player.account_id !== steamId && (
          <TouchableOpacity onPress={() => setPlayer(userProfile ?? null)}>
            <FontAwesome6 name="reply" solid color={theme.colors.error} size={20} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[themed($searchButton)]}
        onPress={() => navigator.navigate("MainDashboard", { screen: "PlayerSearch" })}
      >
        <FontAwesome6 name="magnifying-glass" solid color={theme.colors.text} size={24} />
      </TouchableOpacity>
    </View>
  );
};

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
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
