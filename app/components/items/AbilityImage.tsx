import { type ImageStyle, View } from "react-native";
import { SvgUri } from "react-native-svg";
import { AutoImage } from "@/components/ui/AutoImage";
import { useAssetsAbility } from "@/hooks/useAssetsitems";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface AbilityImageProps {
  ability_class_name: string;
}

export function AbilityImage(props: AbilityImageProps) {
  const { themed, theme } = useAppTheme();

  const { data: ability } = useAssetsAbility(props.ability_class_name);
  return (
    <>
      <View
        style={{
          position: "absolute",
          zIndex: -1,
          top: -25,
        }}
      >
        <SvgUri
          uri="https://assets-bucket.deadlock-api.com/assets-api-res/icons/ability_frame_standard.svg"
          width={120}
          height={120}
          filter={theme.isDark ? "" : "invert(100%)"}
        />
      </View>
      <AutoImage source={{ uri: ability?.image_webp }} style={themed($image)} />
    </>
  );
}

const $image: ThemedStyle<ImageStyle> = (theme) => ({
  width: 55,
  height: 55,
  tintColor: theme.colors.background,
  marginBottom: 10,
});
