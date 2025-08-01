import type { ImageStyle } from "react-native";
import { AutoImage } from "@/components/ui/AutoImage";
import { useAssetsAbility } from "@/hooks/useAssetsitems";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface AbilityImageProps {
  ability_class_name: string;
}

export function AbilityImage(props: AbilityImageProps) {
  const { themed } = useAppTheme();

  const { data: ability } = useAssetsAbility(props.ability_class_name);
  return <AutoImage source={{ uri: ability?.image_webp }} style={themed($image)} />;
}

const $image: ThemedStyle<ImageStyle> = (theme) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: theme.colors.palette.neutral100,
});
