import { type ImageStyle, type TextStyle, View } from "react-native";
import { AutoImage } from "@/components/ui/AutoImage";
import { Text } from "@/components/ui/Text";
import { useAssetsAbility } from "@/hooks/useAssetsitems";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface HeroAbilityCardProps {
  ability_class_name: string;
}

export function HeroAbilityCard(props: HeroAbilityCardProps) {
  const { themed } = useAppTheme();

  const { data: ability } = useAssetsAbility(props.ability_class_name);
  return (
    <View style={[themed($container), ability?.ability_type === "ultimate" && themed($ultimate)]}>
      <AutoImage source={{ uri: ability?.image_webp }} style={themed($image)} />
      <Text style={themed($text)}>{ability?.name}</Text>
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
});

const $ultimate: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral300,
  borderRadius: spacing.md,
});

const $text: TextStyle = {
  fontSize: 12,
  textAlign: "center",
};

const $image: ThemedStyle<ImageStyle> = (theme) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: theme.colors.palette.neutral100,
});
