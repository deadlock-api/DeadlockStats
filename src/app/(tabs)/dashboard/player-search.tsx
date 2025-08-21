import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, TextInput, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "src/app/_layout";
import { SteamImage } from "src/components/profile/SteamImage";
import { SteamName } from "src/components/profile/SteamName";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { useDebounce } from "src/hooks/useDebounce";
import { useSearchSteamProfile } from "src/hooks/useSteamProfile";
import { translate } from "src/i18n/translate";
import type { SteamProfile } from "src/services/api/types/steam_profile";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { load, save } from "src/utils/storage";

export default function PlayerSearchScreen() {
  const router = useRouter();
  const { themed, theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [_, setPlayer] = usePlayerSelected();
  const [recentSearches, setRecentSearches] = useState<SteamProfile[]>(load("recentSearches") ?? []);
  const debounceSearchQuery = useDebounce(searchQuery);

  const handlePress = (player: SteamProfile) => {
    let newSearches: SteamProfile[];
    if (recentSearches.every((p) => p.account_id !== player.account_id)) {
      newSearches = [player, ...recentSearches].slice(0, 5);
    } else {
      newSearches = recentSearches.filter((p) => p.account_id !== player.account_id);
      newSearches.unshift(player);
    }
    setRecentSearches(newSearches);
    save("recentSearches", newSearches);
    setPlayer(player);
    router.back();
  };

  const { data: profiles, isLoading } = useSearchSteamProfile(debounceSearchQuery);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
      <View style={themed($header)}>
        <TouchableOpacity
          style={[themed($backButton), { backgroundColor: theme.colors.palette.neutral100 }]}
          onPress={() => router.back()}
        >
          <FontAwesome6 name="chevron-left" solid size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[themed($title)]} tx="playerSearchScreen:title" preset="subheading" />
        <View style={themed($placeholder)} />
      </View>

      <View
        style={[
          themed($searchContainer),
          { backgroundColor: theme.colors.palette.neutral100, borderColor: theme.colors.border },
        ]}
      >
        <FontAwesome6 name="magnifying-glass" solid color={theme.colors.text} size={20} />
        <TextInput
          style={[themed($searchInput), { color: theme.colors.text }]}
          placeholder={translate("playerSearchScreen:searchPlaceholder")}
          placeholderTextColor={theme.colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
      </View>

      <View style={themed($resultsSection)}>
        {!searchQuery ? (
          <View>
            {recentSearches && recentSearches.length > 0 && (
              <Text preset="subheading" tx="playerSearchScreen:recentSearches" />
            )}
            {recentSearches.map((player) => (
              <PlayerResult key={player.account_id} player={player} onPress={handlePress} />
            ))}
          </View>
        ) : (
          <View>
            <Text preset="subheading" tx="playerSearchScreen:searchResults" />
            {profiles && profiles.length > 0 ? (
              profiles?.map((item) => <PlayerResult key={item.account_id} onPress={handlePress} player={item} />)
            ) : isLoading ? (
              <View style={[themed($loadingResults), { backgroundColor: theme.colors.palette.neutral100 }]}>
                <ActivityIndicator size="large" color={theme.colors.tint} />
                <Text style={themed($loadingResultsText)} tx="common:loading" size="sm" />
              </View>
            ) : (
              <View style={[themed($noResults), { backgroundColor: theme.colors.palette.neutral100 }]}>
                <FontAwesome6 name="user" solid color={theme.colors.text} size={24} />
                <Text style={themed($noResultsText)} tx="playerSearchScreen:noPlayersFound" size="sm" />
                <Text
                  style={[themed($noResultsSubtext), { color: theme.colors.textDim }]}
                  size="xs"
                  tx="playerSearchScreen:tryCheckingSpelling"
                />
              </View>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const PlayerResult = ({ onPress, player }: { player: SteamProfile; onPress: (player: SteamProfile) => void }) => {
  const { themed, theme } = useAppTheme();
  return (
    <TouchableOpacity
      style={[themed($playerResult), { backgroundColor: theme.colors.palette.neutral100 }]}
      onPress={() => onPress(player)}
    >
      <View style={[themed($playerAvatar), { backgroundColor: theme.colors.palette.neutral200 }]}>
        <SteamImage profile={player} size={32} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={themed($playerName)} size="sm" numberOfLines={1}>
          <SteamName profile={player} />
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
});

const $backButton: ThemedStyle<ViewStyle> = () => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

const $title: ThemedStyle<TextStyle> = () => ({
  flex: 1,
  textAlign: "center",
  fontWeight: "bold",
});

const $placeholder: ThemedStyle<ViewStyle> = () => ({
  width: 48,
  height: 48,
});

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  gap: 12,
  marginBottom: spacing.md,
});

const $searchInput: ThemedStyle<TextStyle> = ({ typography }) => ({
  flex: 1,
  fontSize: 16,
  fontFamily: typography.primary.normal,
});

const $resultsSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $noResults: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $noResultsText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontWeight: "bold",
  marginBottom: spacing.md,
});

const $noResultsSubtext: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});

const $loadingResults: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $loadingResultsText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontWeight: "bold",
  marginBottom: spacing.md,
});

const $playerResult: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 12,
  marginBottom: spacing.xs,
});

const $playerAvatar: ThemedStyle<ViewStyle> = () => ({
  width: 32,
  height: 32,
  borderRadius: 24,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
});

const $playerName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
});
