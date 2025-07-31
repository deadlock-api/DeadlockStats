import { useMemo } from "react";
import { ActivityIndicator, type ImageStyle, type TextStyle, View } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { Text } from "@/components/ui/Text";
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

  return (
    <View style={[themed($container), { backgroundColor }]}>
      {hero ? (
        <>
          <HeroImage hero_id={hero.id} size={70} />
          <Text numberOfLines={1} style={[themed($text), { fontSize: props.fontSize }]}>
            {hero?.name}
          </Text>
        </>
      ) : (
        <ActivityIndicator />
      )}
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

const $text: TextStyle = {
  fontSize: 20,
  textAlign: "center",
};
