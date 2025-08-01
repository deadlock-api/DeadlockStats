import { useMemo } from "react";
import { ActivityIndicator, type ImageStyle, View } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface HeroCardProps {
  hero_id: number;
  fontSize?: number;
}

export function HeroCard(props: HeroCardProps) {
  const { themed } = useAppTheme();

  const { data: hero } = useAssetsHero(props.hero_id);

  const backgroundColor = useMemo(() => {
    return `rgba(${hero?.colors.ui.join(",")}, 0.1)`;
  }, [hero]);

  if (!hero) {
    return <ActivityIndicator />;
  }

  return (
    <View style={[themed($container), { backgroundColor }]}>
      <HeroImage hero_id={hero.id} size={70} />
      <HeroName hero_id={hero.id} fontSize={props.fontSize} />
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
