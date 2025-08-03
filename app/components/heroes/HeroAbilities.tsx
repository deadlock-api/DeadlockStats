import { useMemo } from "react";
import { SimpleGrid } from "react-native-super-grid";
import { AbilityCard } from "@/components/items/AbilityCard";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useAppTheme } from "@/theme/context";

export interface HeroAbilitiesProps {
  heroId: number;
  highlightedAbility?: string | null;
  onAbilityClick?: (ability_class_name: string) => void;
}

export function HeroAbilities(props: HeroAbilitiesProps) {
  const { theme } = useAppTheme();

  const { data: hero } = useAssetsHero(props.heroId);

  const abilities: string[] = useMemo(() => {
    const items = hero?.items;
    return [items?.signature1, items?.signature2, items?.signature3, items?.signature4].filter(
      (item) => item,
    ) as string[];
  }, [hero]);

  const renderAbility = ({ item }: { item: string }) => (
    <AbilityCard
      highlighted={!props.highlightedAbility || item === props.highlightedAbility}
      key={item}
      ability_class_name={item}
      onPress={() => props.onAbilityClick?.(item)}
    />
  );

  return (
    <SimpleGrid
      listKey={"abilities"}
      data={abilities}
      renderItem={renderAbility}
      keyExtractor={(item) => item}
      itemDimension={100}
      maxItemsPerRow={2}
      fixed
      spacing={theme.spacing.lg}
    />
  );
}
