import { Text } from "@/components/ui/Text";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";

export interface HeroNameProps {
  hero_id: number;
  fontSize?: number;
}

export function HeroName(props: HeroNameProps) {
  const { data: hero } = useAssetsHero(props.hero_id);

  return (
    <Text numberOfLines={1} style={{ fontSize: props.fontSize }}>
      {hero?.name}
    </Text>
  );
}
