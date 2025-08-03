import { useMemo } from "react";
import { type ImageStyle, TouchableOpacity, View } from "react-native";
import { AbilityImage } from "@/components/items/AbilityImage";
import { useAssetsAbilities } from "@/hooks/useAssetsitems";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { AbilityName } from "./AbilityName";

export interface HeroAbilityCardProps {
  ability_class_name: string;
  highlighted?: boolean;
  onPress?: () => void;
}

export function AbilityCard(props: HeroAbilityCardProps) {
  const { themed } = useAppTheme();

  const { data: abilities } = useAssetsAbilities();

  const ability = useMemo(
    () => abilities?.find((a) => a.class_name === props.ability_class_name),
    [abilities, props.ability_class_name],
  );

  if (!ability) {
    return null;
  }

  return (
    <TouchableOpacity onPress={() => props.onPress?.()}>
      <View style={[themed($container), { opacity: props.highlighted ? 1 : 0.5 }]}>
        <AbilityImage ability_class_name={props.ability_class_name} />
        <AbilityName ability_class_name={props.ability_class_name} fontSize={12} />
      </View>
    </TouchableOpacity>
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
  paddingBottom: 0,
  gap: spacing.xs,
});
