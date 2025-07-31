import type { ImageStyle } from "react-native";
import { AutoImage } from "@/components/ui/AutoImage";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

const DEFAULT_SIZE = 70;

export interface HeroImageProps {
  hero_id: number;
  size?: number;
}

export function HeroImage(props: HeroImageProps) {
  const { themed } = useAppTheme();

  const { data: hero } = useAssetsHero(props.hero_id);

  return (
    <AutoImage
      source={{ uri: hero?.images.icon_image_small_webp }}
      style={[
        themed($image),
        {
          width: props.size ?? DEFAULT_SIZE,
          height: props.size ?? DEFAULT_SIZE,
          borderRadius: (props.size ?? DEFAULT_SIZE) / 2,
        },
      ]}
    />
  );
}

const $image: ThemedStyle<ImageStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
});
