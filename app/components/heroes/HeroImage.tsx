import { AutoImage } from "@/components/ui/AutoImage";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import type { Hero } from "@/services/assets-api/types/hero";

const DEFAULT_SIZE = 70;

export interface HeroImageProps {
  hero_id: number;
  size?: number;
}

export function HeroImage(props: HeroImageProps) {
  const { data: hero } = useAssetsHero(props.hero_id) as { data: Hero | undefined };

  const getBackgroundColor = (hero: Hero | undefined) => {
    if (!hero) return "transparent";
    return `rgba(${hero.colors.ui.join(",")}, 0.3)`;
  };

  return (
    <AutoImage
      source={{ uri: hero?.images.icon_image_small_webp }}
      style={[
        {
          width: props.size ?? DEFAULT_SIZE,
          height: props.size ?? DEFAULT_SIZE,
          borderRadius: (props.size ?? DEFAULT_SIZE) / 2,
          backgroundColor: getBackgroundColor(hero),
        },
      ]}
    />
  );
}
