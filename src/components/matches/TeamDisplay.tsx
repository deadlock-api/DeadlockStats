import { type TextStyle, View, type ViewStyle } from "react-native";
import { RankImage } from "src/components/rank/RankImage";
import { Text } from "src/components/ui/Text";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";

export interface TeamDisplayProps {
  /**
   * The team name (e.g., "AMBER", "SAPPHIRE")
   */
  teamName: string;
  /**
   * The team's average badge/rank
   */
  badge?: number;
  /**
   * Whether this team won the match
   */
  isWinner: boolean;
  /**
   * Team statistics to display
   */
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    netWorth: number;
    playerDamage: number;
  };
}

/**
 * A component for displaying team information and statistics in match details
 */
export function TeamDisplay({ teamName, badge, isWinner, stats }: TeamDisplayProps) {
  const { theme, themed } = useAppTheme();
  const isLeft = teamName === "AMBER";

  const style: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.xxs,
  };

  const kdaLabel = translate("matchDetailsScreen:playerKdaLabel");
  const kdaValue = `${stats.kills}/${stats.deaths}/${stats.assists}`;
  const kda = isLeft ? (
    <View style={style}>
      <Text size="xs">{kdaLabel}</Text>
      <Text size="xs">{kdaValue}</Text>
    </View>
  ) : (
    <View style={style}>
      <Text size="xs">{kdaValue}</Text>
      <Text size="xs">{kdaLabel}</Text>
    </View>
  );

  const netWorthLabel = translate("matchDetailsScreen:playerSoulsLabel");
  const netWorthValue = `${(stats.netWorth / 1000).toFixed(0).toLocaleString()}k`;
  const netWorth = isLeft ? (
    <View style={style}>
      <Text size="xs">{netWorthLabel}</Text>
      <Text size="xs">{netWorthValue}</Text>
    </View>
  ) : (
    <View style={style}>
      <Text size="xs">{netWorthValue}</Text>
      <Text size="xs">{netWorthLabel}</Text>
    </View>
  );

  const playerDamageLabel = translate("matchDetailsScreen:playerDamageLabel");
  const playerDamageValue = `${(stats.playerDamage / 1000).toFixed(0).toLocaleString()}k`;
  const playerDamage = isLeft ? (
    <View style={style}>
      <Text size="xs">{playerDamageLabel}</Text>
      <Text size="xs">{playerDamageValue}</Text>
    </View>
  ) : (
    <View style={style}>
      <Text size="xs">{playerDamageValue}</Text>
      <Text size="xs">{playerDamageLabel}</Text>
    </View>
  );

  return (
    <View style={themed($teamContainer)}>
      <View style={[themed($teamContainerTop), themed(isLeft ? $teamContainerTopLeft : $teamContainerTopRight)]}>
        {isLeft && badge && <RankImage rank={badge} />}
        <View style={themed(isLeft ? $leftTeamNameContainer : $rightTeamNameContainer)}>
          <Text size="md" style={themed(isLeft ? $leftTeamName : $rightTeamName)}>
            {teamName}
          </Text>
          <Text
            tx={isWinner ? "common:victory" : "common:defeat"}
            style={{
              color: isWinner ? theme.colors.palette.success500 : theme.colors.palette.failure500,
            }}
          />
        </View>
        {!isLeft && badge && <RankImage rank={badge} />}
      </View>
      <View style={themed(isLeft ? $leftTeamStats : $rightTeamStats)}>
        {kda}
        {netWorth}
        {playerDamage}
      </View>
    </View>
  );
}

const $teamContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  marginVertical: spacing.xxs,
});

const $teamContainerTop: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.xs,
});

const $teamContainerTopLeft: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "flex-start",
});

const $teamContainerTopRight: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "flex-end",
});

const $leftTeamNameContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-start",
  gap: spacing.xxs,
});

const $rightTeamNameContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-end",
  gap: spacing.xxs,
});

const $leftTeamName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  textAlign: "left",
});

const $rightTeamName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  textAlign: "right",
});

const $leftTeamStats: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
});

const $rightTeamStats: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  alignItems: "flex-end",
});
