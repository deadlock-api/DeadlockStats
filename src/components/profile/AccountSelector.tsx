import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect } from "react";
import { TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "src/app/_layout";
import { Text } from "src/components/ui/Text";
import { useSteamProfile } from "src/hooks/useSteamProfile";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import { getSteamId } from "src/utils/steamAuth";
import { SteamImage } from "./SteamImage";
import { SteamName } from "./SteamName";

export const AccountSelector = ({ onSearchPress }: { onSearchPress: () => void }) => {
  const { themed, theme } = useAppTheme();

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
            <SteamImage profile={player ?? undefined} size={48} />
          </View>
        )}
        <Text numberOfLines={1} preset="subheading" style={{ maxWidth: 160 }}>
          {!steamId && !player && !userProfile ? (
            translate("common:noSteamAccount")
          ) : player && player.account_id !== steamId ? (
            <SteamName profile={player} />
          ) : (
            <SteamName profile={userProfile ?? undefined} />
          )}
        </Text>
        {player && player.account_id !== steamId && (
          <TouchableOpacity onPress={() => setPlayer(userProfile ?? null)}>
            <FontAwesome6 name="reply" solid color={theme.colors.error} size={20} />
          </TouchableOpacity>
        )}
      </View>
      <View style={themed($buttonContainer)}>
        {/*{player && <ShareButton player={player} style={{ marginRight: theme.spacing.xs }} />}*/}
        <TouchableOpacity style={[themed($searchButton)]} onPress={() => onSearchPress}>
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
