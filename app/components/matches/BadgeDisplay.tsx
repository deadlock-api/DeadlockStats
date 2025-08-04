import { useMemo } from "react";
import { type ImageStyle, type TextStyle, View, type ViewStyle } from "react-native";
import { AutoImage } from "@/components/ui/AutoImage";
import { Text } from "@/components/ui/Text";
import { useAssetsRanks } from "@/hooks/useAssetsRanks";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { parseBadgeNumber } from "@/utils/badgeCalculations";

export interface BadgeDisplayProps {
  badge?: number;
  size?: number;
  showName?: boolean;
}

export function BadgeDisplay(props: BadgeDisplayProps) {
  const { badge, size = 40, showName = false } = props;
  const { themed } = useAppTheme();
  const { data: ranks } = useAssetsRanks();

  const badgeInfo = useMemo(() => {
    if (!badge || !ranks) return null;
    return parseBadgeNumber(badge, ranks);
  }, [badge, ranks]);

  if (!badgeInfo) {
    return (
      <View style={themed($container)}>
        <View style={[themed($placeholder), { width: size, height: size }]}>
          <Text style={themed($placeholderText)}>?</Text>
        </View>
        {showName && <Text style={themed($rankName)} numberOfLines={1} tx="matchDetailsScreen:unranked" />}
      </View>
    );
  }

  const imageUri =
    badgeInfo.subtier > 0
      ? badgeInfo.rank.images[`small_subrank${badgeInfo.subtier}_webp` as keyof typeof badgeInfo.rank.images]
      : badgeInfo.rank.images.small_webp;

  return (
    <View style={themed($container)}>
      <AutoImage
        source={{ uri: imageUri }}
        style={[
          themed($badgeImage),
          {
            width: size,
            height: size,
          },
        ]}
      />
      {showName && (
        <Text style={themed($rankName)} numberOfLines={1}>
          {badgeInfo.rank.name}
          {badgeInfo.subtier > 0 && ` ${badgeInfo.subtier}`}
        </Text>
      )}
    </View>
  );
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xxs,
});

const $badgeImage: ThemedStyle<ImageStyle> = () => ({
  borderRadius: 4,
});

const $placeholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
});

const $placeholderText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  fontWeight: "bold",
});

const $rankName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
});
