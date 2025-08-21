import { FontAwesome6 } from "@expo/vector-icons";
import { type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { HeroImage } from "src/components/heroes/HeroImage";
import { SteamName } from "src/components/profile/SteamName";
import { Text } from "src/components/ui/Text";
import { useAssetsHero } from "src/hooks/useAssetsHeroes";
import { EGoldSource, type Players } from "src/services/api/types/match_metadata";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import { StatItem } from "./StatItem";

const GOLD_SOURCE_NAMES: Record<EGoldSource, string> = {
  [EGoldSource.Players]: "Players",
  [EGoldSource.LaneCreeps]: "Creeps",
  [EGoldSource.Neutrals]: "Neutrals",
  [EGoldSource.Bosses]: "Bosses",
  [EGoldSource.Treasure]: "Urn",
  [EGoldSource.Assists]: "Assists",
  [EGoldSource.Denies]: "Denies",
  [EGoldSource.TeamBonus]: "Team Bonus",
  [EGoldSource.UNRECOGNIZED]: "Unknown",
};

export interface PlayerStatsProps {
  player: Players;
  updatePlayer: (accountId: number) => void;
}

export function PlayerStats({ player, updatePlayer }: PlayerStatsProps) {
  const { themed, theme } = useAppTheme();
  const { data: hero } = useAssetsHero(player.hero_id ?? 0);

  // Get the latest stats (end of match)
  const latestStats = player.stats[player.stats.length - 1];

  // Calculate some derived stats
  const kda = ((player.kills ?? 0) + (player.assists ?? 0)) / Math.max(player.deaths ?? 1, 1);
  const accuracy =
    latestStats?.shots_hit && latestStats?.shots_missed
      ? (latestStats.shots_hit / (latestStats.shots_hit + latestStats.shots_missed)) * 100
      : 0;
  const critRate =
    latestStats?.hero_bullets_hit && latestStats?.hero_bullets_hit_crit
      ? (latestStats.hero_bullets_hit_crit / latestStats.hero_bullets_hit) * 100
      : 0;

  const goldSources: Record<EGoldSource, number> = (latestStats?.gold_sources ?? []).reduce(
    (acc, { source, gold }) => {
      if (source) acc[source] = (acc[source] ?? 0) + (gold ?? 0);
      return acc;
    },
    {} as Record<EGoldSource, number>,
  );

  return (
    <View style={themed($playerStatsContainer)}>
      {/* Header Section */}
      <View style={themed($playerStatsHeader)}>
        <View style={themed($playerHeroInfo)}>
          <HeroImage heroId={player.hero_id ?? 0} size={50} />
          <View style={themed($playerBasicInfo)}>
            <Text numberOfLines={1} style={themed($playerName)} weight="semiBold" size="md">
              {player.account_id && <SteamName accountId={player.account_id} />}
            </Text>
            <Text style={themed($heroName)} size="sm">
              {hero?.name ?? "Unknown Hero"}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={themed($playerLevel)} size="xs">
                Level {player.level ?? 0}
              </Text>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs }}
                onPress={() => player.account_id && updatePlayer(player.account_id)}
              >
                <Text
                  numberOfLines={1}
                  size="xs"
                  style={[themed($viewProfileText), { color: theme.colors.tint }]}
                  tx="matchDetailsScreen:viewProfile"
                />
                <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={14} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Core Stats Section */}
      <View style={themed($statsSection)}>
        <Text size="md" weight="semiBold" tx="matchDetailsScreen:playerStats" />
        <View style={themed($statsGrid)}>
          <StatItem width="30%" label="K/D/A" value={`${player.kills}/${player.deaths}/${player.assists}`} />
          <StatItem width="30%" label="KDA Ratio" value={kda.toFixed(2)} />
          <StatItem width="30%" label="Net Worth" value={`${((player.net_worth ?? 0) / 1000).toFixed(1)}k`} />
          <StatItem width="30%" label="Last Hits" value={`${player.last_hits ?? 0}`} />
          <StatItem width="30%" label="Denies" value={`${player.denies ?? 0}`} />
          <StatItem width="30%" label="Ability Points" value={`${player.ability_points ?? 0}`} />
        </View>
      </View>

      {/* Combat Stats Section */}
      <View style={themed($statsSection)}>
        <Text size="md" weight="semiBold" text="Combat Stats" />
        <View style={themed($statsGrid)}>
          <StatItem
            width="30%"
            label="Player Damage"
            value={`${((latestStats?.player_damage ?? 0) / 1000).toFixed(1)}k`}
          />
          <StatItem
            width="30%"
            label="Damage Taken"
            value={`${((latestStats?.player_damage_taken ?? 0) / 1000).toFixed(1)}k`}
          />
          <StatItem width="30%" label="Healing Done" value={`${(latestStats?.player_healing ?? 0).toFixed(0)}`} />
          <StatItem width="30%" label="Self Healing" value={`${(latestStats?.self_healing ?? 0).toFixed(0)}`} />
          <StatItem width="30%" label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
          <StatItem width="30%" label="Crit Rate" value={`${critRate.toFixed(1)}%`} />
        </View>
      </View>

      {/* Economy Stats Section */}
      <View style={themed($statsSection)}>
        <Text size="md" weight="semiBold" text="Soul Sources" />
        <View style={themed($statsGrid)}>
          {Object.entries(goldSources)
            .filter(([source, gold]) => Object.hasOwn(GOLD_SOURCE_NAMES, source) && gold > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([source, gold]) => (
              <StatItem
                key={source}
                width="22%"
                label={GOLD_SOURCE_NAMES[source as unknown as EGoldSource] ?? "Unknown"}
                value={`${(gold / 1000).toFixed(1)}k`}
              />
            ))}
        </View>
      </View>
    </View>
  );
}

const $viewProfileText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "bold",
});

const $playerStatsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  gap: spacing.xs,
});

const $playerStatsHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xs,
});

const $playerHeroInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $playerBasicInfo: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  justifyContent: "space-around",
  flex: 1,
});

const $playerName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  overflow: "hidden",
});

const $heroName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $playerLevel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $statsGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-evenly",
  gap: spacing.sm,
  marginTop: spacing.xs,
});

const $statsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  alignItems: "center",
});
