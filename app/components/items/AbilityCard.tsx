import { ActivityIndicator, type ImageStyle, View } from "react-native";
import { AbilityImage } from "@/components/items/AbilityImage";
import { useAssetsAbility } from "@/hooks/useAssetsitems";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { AbilityName } from "./AbilityName";

export interface HeroAbilityCardProps {
  ability_class_name: string;
}

export function AbilityCard(props: HeroAbilityCardProps) {
  const { themed } = useAppTheme();

  const { data: ability } = useAssetsAbility(props.ability_class_name);

  if (!ability) {
    return <ActivityIndicator />;
  }

  return (
    <View style={[themed($container), ability.ability_type === "ultimate" && themed($ultimate)]}>
      <AbilityImage ability_class_name={props.ability_class_name} />
      <AbilityName ability_class_name={props.ability_class_name} fontSize={11} />
    </View>
  );
}

const $container: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: spacing.md,
  padding: spacing.xxs,
  paddingTop: spacing.xs,
});

const $ultimate: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral300,
  borderRadius: spacing.md,
});
