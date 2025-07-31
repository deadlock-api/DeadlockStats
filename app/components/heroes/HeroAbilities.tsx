import { useMemo } from "react";
import { SimpleGrid } from "react-native-super-grid";
import { HeroAbilityCard } from "@/components/heroes/HeroAbilityCard";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useAppTheme } from "@/theme/context";

export interface HeroAbilitiesProps {
  hero_id: number;
}

export function HeroAbilities(props: HeroAbilitiesProps) {
  const { themed, theme } = useAppTheme();

  const { data: hero } = useAssetsHero(props.hero_id);

  const abilities: string[] = useMemo(() => {
    const items = hero?.items;
    return [items?.signature1, items?.signature2, items?.signature3, items?.signature4].filter(
      (item) => item,
    ) as string[];
  }, [hero]);

  return (
    <SimpleGrid
      listKey={"abilities"}
      data={abilities}
      renderItem={({ item }) => <HeroAbilityCard ability_class_name={item} />}
      keyExtractor={(item) => item}
      itemDimension={100}
      maxItemsPerRow={2}
      spacing={theme.spacing.lg}
    />
  );
}
