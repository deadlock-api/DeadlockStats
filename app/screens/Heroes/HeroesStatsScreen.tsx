import type { FC } from "react";
import { type TextStyle, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { HeroDescriptionRole } from "@/components/heroes/HeroDescriptionRole";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useHeroStats } from "@/hooks/useHeroStats";
import type { HeroesStackScreenProps } from "@/navigators/HeroesNavigator";
import type { HeroStats } from "@/services/api/types/hero_stats";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatRelativeTime } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";

export const HeroesStatsScreen: FC<HeroesStackScreenProps<"Stats">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [player, _] = usePlayerSelected();

  const { data: heroStats } = useHeroStats(player?.account_id ?? null);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
      <AccountSelector />

      {heroStats && heroStats.length > 0 ? (
        <View style={themed($heroesContainer)}>
          {heroStats
            .filter((heroStat) => heroStat.matches_played > 0)
            .sort((a, b) => b.last_played - a.last_played)
            .map((heroStat) => (
              <HeroStatItem key={heroStat.hero_id} heroStat={heroStat} />
            ))}
        </View>
      ) : (
        <Text>No matches found</Text>
      )}
    </Screen>
  );
};

const $heroesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  gap: spacing.lg,
});

const HeroStatItem = ({ heroStat }: { heroStat: HeroStats }) => {
  const { themed, theme } = useAppTheme();

  const winrate = Math.round((100 * heroStat.wins) / heroStat.matches_played);
  const avgKills = Math.round((10 * heroStat.kills) / heroStat.matches_played) / 10;
  const avgDeaths = Math.round((10 * heroStat.deaths) / heroStat.matches_played) / 10;
  const avgAssists = Math.round((10 * heroStat.assists) / heroStat.matches_played) / 10;
  const avgKd = Math.round((10 * (heroStat.kills + heroStat.assists)) / heroStat.deaths) / 10;
  const lastPlayed = formatRelativeTime(heroStat.last_played);

  return (
    <View style={themed($heroStats)}>
      <View style={themed($heroStatTopRow)}>
        <HeroImage heroId={heroStat.hero_id} size={40} />
        <View style={themed($heroesNameContainer)}>
          <Text numberOfLines={1} style={themed($heroNameText)}>
            <HeroName heroId={heroStat.hero_id} />
          </Text>
          <Text numberOfLines={2} style={themed($heroRoleText)}>
            <HeroDescriptionRole heroId={heroStat.hero_id} />
          </Text>
        </View>
      </View>
      <View style={themed($heroStatsContent)}>
        <View style={themed($heroStatsContentStat)}>
          <Text>Games Played</Text>
          <Text>{heroStat.matches_played}</Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>Win Rate</Text>
          <Text style={{ color: scaleColor(winrate, 30, 70) }}>{winrate}%</Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>KDA</Text>
          <Text style={{ color: scaleColor(avgKd, 0.5, 4) }}>
            {avgKills}/{avgDeaths}/{avgAssists}
          </Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>Accuracy</Text>
          <Text style={{ color: scaleColor(heroStat.accuracy, 0.45, 0.7) }}>
            {Math.round(100 * heroStat.accuracy)}%
          </Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>Headshot Rate</Text>
          <Text style={{ color: scaleColor(heroStat.crit_shot_rate, 0.08, 0.22) }}>
            {Math.round(100 * heroStat.crit_shot_rate)}%
          </Text>
        </View>
      </View>
      <View style={themed($heroStatsBottomRow)}>
        <Text style={{ color: theme.colors.textDim, fontSize: 13 }}>Last played {lastPlayed}</Text>
      </View>
    </View>
  );
};

const $heroStats: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
});

const $heroStatTopRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
});

const $heroStatsBottomRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  borderTopWidth: 1,
  borderTopColor: colors.border,
  paddingTop: spacing.xs,
});

const $heroStatsContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({});

const $heroStatsContentStat: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
});

const $heroesNameContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
  justifyContent: "center",
});

const $heroNameText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.semiBold,
  lineHeight: 16,
});

const $heroRoleText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
});
