import { FontAwesome6 } from "@expo/vector-icons";
import { ScrollView, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { StatItem } from "@/components/matches/StatItem";
import { Text } from "@/components/ui/Text";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useSteamProfile } from "@/hooks/useSteamProfile";
import type { Players } from "@/services/api/types/match_metadata";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface PlayerStatsProps {
  /**
   * The player data to display stats for
   */
  player: Players;
  /**
   * Function to call when the "View Profile" button is pressed
   */
  updatePlayer: (accountId: number) => void;
}

const PlayerName = ({ accountId }: { accountId?: number }) => {
  const { data: profile } = useSteamProfile(accountId);

  if (!accountId) {
    return <>Unknown</>;
  }
  return <>{profile?.personaname ?? profile?.realname ?? profile?.account_id ?? "Loading..."}</>;
};

/**
 * A comprehensive player statistics component that displays detailed match performance data
 */
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

  const handleViewProfile = () => {
    if (player.account_id) {
      updatePlayer(player.account_id);
    }
  };

  return (
    <View style={themed($playerStatsContainer)}>
      {/* Header Section */}
      <View style={themed($playerStatsHeader)}>
        <View style={themed($playerHeroInfo)}>
          <HeroImage heroId={player.hero_id ?? 0} size={50} />
          <View style={themed($playerBasicInfo)}>
            <Text numberOfLines={1} style={themed($playerName)} weight="semiBold">
              <PlayerName accountId={player.account_id} />
            </Text>
            <Text style={themed($heroName)} size="md">
              {hero?.name ?? "Unknown Hero"}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={themed($playerLevel)} size="sm">
                Level {player.level ?? 0}
              </Text>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs }}
                onPress={handleViewProfile}
              >
                <Text numberOfLines={1} style={[themed($viewProfileText)]} tx="matchDetailsScreen:viewProfile" />
                <FontAwesome6 name="chevron-right" solid color={theme.colors.text} size={13} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* Core Stats Section */}
        <View>
          <Text size="md" weight="semiBold" tx="matchDetailsScreen:playerStats" />
          <View style={themed($statsGrid)}>
            <StatItem label="K/D/A" value={`${player.kills}/${player.deaths}/${player.assists}`} />
            <StatItem label="KDA Ratio" value={kda.toFixed(2)} />
            <StatItem label="Net Worth" value={`${((player.net_worth ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Last Hits" value={`${player.last_hits ?? 0}`} />
            <StatItem label="Denies" value={`${player.denies ?? 0}`} />
            <StatItem label="Ability Points" value={`${player.ability_points ?? 0}`} />
          </View>
        </View>

        {/* Combat Stats Section */}
        <View>
          <Text size="md" weight="semiBold" text="Combat Stats" />
          <View style={themed($statsGrid)}>
            <StatItem label="Player Damage" value={`${((latestStats?.player_damage ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Damage Taken" value={`${((latestStats?.player_damage_taken ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Healing Done" value={`${((latestStats?.player_healing ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Self Healing" value={`${((latestStats?.self_healing ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
            <StatItem label="Crit Rate" value={`${critRate.toFixed(1)}%`} />
          </View>
        </View>

        {/* Economy Stats Section */}
        <View>
          <Text size="md" weight="semiBold" text="Economy" />
          <View style={themed($statsGrid)}>
            <StatItem label="Gold Earned" value={`${((latestStats?.gold_player ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Creep Kills" value={`${latestStats?.creep_kills ?? 0}`} />
            <StatItem label="Neutral Kills" value={`${latestStats?.neutral_kills ?? 0}`} />
            <StatItem label="Boss Damage" value={`${((latestStats?.boss_damage ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Gold Lost" value={`${((latestStats?.gold_death_loss ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Max Health" value={`${latestStats?.max_health ?? 0}`} />
          </View>
        </View>

        {/* Power Stats Section */}
        <View>
          <Text size="md" weight="semiBold" text="Power Stats" />
          <View style={themed($statsGrid)}>
            <StatItem label="Weapon Power" value={`${latestStats?.weapon_power ?? 0}`} />
            <StatItem label="Tech Power" value={`${latestStats?.tech_power ?? 0}`} />
            <StatItem label="Damage Absorbed" value={`${((latestStats?.damage_absorbed ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Damage Mitigated" value={`${((latestStats?.damage_mitigated ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem label="Heal Prevented" value={`${((latestStats?.heal_prevented ?? 0) / 1000).toFixed(1)}k`} />
            <StatItem
              label="Absorption Provided"
              value={`${((latestStats?.absorption_provided ?? 0) / 1000).toFixed(1)}k`}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const $viewProfileText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "bold",
  lineHeight: 18,
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

const $playerBasicInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  justifyContent: "space-around",
  gap: spacing.xxs,
  flex: 1,
});

const $playerName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  lineHeight: 18,
  fontSize: 18,
  overflow: "hidden",
});

const $heroName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  lineHeight: 16,
});

const $playerLevel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  lineHeight: 14,
  fontSize: 14,
});

const $statsGrid: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
});
