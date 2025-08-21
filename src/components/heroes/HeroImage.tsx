import { AutoImage } from "../ui/AutoImage";
import { useAssetsHero } from "../../hooks/useAssetsHeroes";
import type { Hero } from "../../services/assets-api/types/hero";

const DEFAULT_SIZE = 70;

export const HERO_IMAGES = {
  1: require("@assets/heroes/1.webp"),
  2: require("@assets/heroes/2.webp"),
  3: require("@assets/heroes/3.webp"),
  4: require("@assets/heroes/4.webp"),
  6: require("@assets/heroes/6.webp"),
  7: require("@assets/heroes/7.webp"),
  8: require("@assets/heroes/8.webp"),
  10: require("@assets/heroes/10.webp"),
  11: require("@assets/heroes/11.webp"),
  12: require("@assets/heroes/12.webp"),
  13: require("@assets/heroes/13.webp"),
  14: require("@assets/heroes/14.webp"),
  15: require("@assets/heroes/15.webp"),
  16: require("@assets/heroes/16.webp"),
  17: require("@assets/heroes/17.webp"),
  18: require("@assets/heroes/18.webp"),
  19: require("@assets/heroes/19.webp"),
  20: require("@assets/heroes/20.webp"),
  21: require("@assets/heroes/21.webp"),
  25: require("@assets/heroes/25.webp"),
  27: require("@assets/heroes/27.webp"),
  31: require("@assets/heroes/31.webp"),
  35: require("@assets/heroes/35.webp"),
  38: require("@assets/heroes/38.webp"),
  39: require("@assets/heroes/39.webp"),
  47: require("@assets/heroes/47.webp"),
  48: require("@assets/heroes/48.webp"),
  49: require("@assets/heroes/49.webp"),
  50: require("@assets/heroes/50.webp"),
  51: require("@assets/heroes/51.webp"),
  52: require("@assets/heroes/52.webp"),
  53: require("@assets/heroes/53.webp"),
  54: require("@assets/heroes/54.webp"),
  58: require("@assets/heroes/58.webp"),
  59: require("@assets/heroes/59.webp"),
  60: require("@assets/heroes/60.webp"),
  61: require("@assets/heroes/61.webp"),
  62: require("@assets/heroes/62.webp"),
  63: require("@assets/heroes/63.webp"),
  64: require("@assets/heroes/64.webp"),
  66: require("@assets/heroes/66.webp"),
  67: require("@assets/heroes/67.webp"),
  68: require("@assets/heroes/68.webp"),
  69: require("@assets/heroes/69.webp"),
  70: require("@assets/heroes/70.webp"),
  71: require("@assets/heroes/71.webp"),
  72: require("@assets/heroes/72.webp"),
  73: require("@assets/heroes/73.webp"),
  74: require("@assets/heroes/74.webp"),
  75: require("@assets/heroes/75.webp"),
} as Record<number, unknown>;

export interface HeroImageProps {
  heroId: number;
  size?: number;
}

export function HeroImage(props: HeroImageProps) {
  const { data: hero } = useAssetsHero(props.heroId) as { data: Hero | undefined };

  const getBackgroundColor = (hero: Hero | undefined) => {
    if (!hero) return "transparent";
    return `rgba(${hero.colors.ui.join(",")}, 0.3)`;
  };

  return (
    <AutoImage
      source={HERO_IMAGES[props.heroId] ?? { uri: hero?.images.icon_image_small_webp }}
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
