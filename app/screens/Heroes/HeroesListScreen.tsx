import type { FC } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { SimpleGrid } from "react-native-super-grid";
import { HeroCard } from "@/components/heroes/HeroCard";
import { Screen } from "@/components/ui/Screen";
import { useAssetsHeroes } from "@/hooks/useAssetsHeroes";
import type { HeroesStackScreenProps } from "@/navigators/HeroesNavigator";
import type { Hero } from "@/services/assets-api/types/hero";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";

export const HeroesListScreen: FC<HeroesStackScreenProps<"List">> = (props) => {
  const { theme } = useAppTheme();

  const { data: heroes } = useAssetsHeroes();

  const renderHero = ({ item }: { item: Hero }) => (
    <TouchableOpacity onPress={() => props.navigation.navigate("Details", { heroId: item.id })}>
      <HeroCard key={item.id} heroId={item.id} fontSize={14} />
    </TouchableOpacity>
  );

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
      {heroes ? (
        <SimpleGrid
          itemDimension={80}
          data={heroes}
          renderItem={renderHero}
          maxItemsPerRow={4}
          keyExtractor={(hero) => hero.id.toString()}
          listKey={"heroes"}
          spacing={theme.spacing.sm}
        />
      ) : (
        <ActivityIndicator />
      )}
    </Screen>
  );
};
