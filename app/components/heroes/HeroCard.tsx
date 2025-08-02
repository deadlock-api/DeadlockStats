import { useMemo } from "react";
import { ActivityIndicator, type ImageStyle, View } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { Text } from "@/components/ui/Text";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface HeroCardProps {
  heroId: number;
  fontSize?: number;
}

export function HeroCard(props: HeroCardProps) {
  const { themed } = useAppTheme();

  const { data: hero } = useAssetsHero(props.heroId);

  const backgroundColor = useMemo(() => {
    return `rgba(${hero?.colors.ui.join(",")}, 0.1)`;
  }, [hero]);

  if (!hero) {
    return <ActivityIndicator />;
  }

  return (
    <View style={[themed($container), { backgroundColor }]}>
      <HeroImage heroId={hero.id} size={70} />
      <Text numberOfLines={1} style={{ fontSize: props.fontSize }}>
        <HeroName heroId={hero.id} />
      </Text>
    </View>
  );
}

const $container: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxxs,
  borderRadius: spacing.md,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  marginHorizontal: "auto",
});
