import { type FC, useState } from "react";
import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { HeroAbilities } from "@/components/heroes/HeroAbilities";
import { HeroDescriptionRole } from "@/components/heroes/HeroDescriptionRole";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { AbilityDescription } from "@/components/items/AbilityDescription";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import type { HeroesStackScreenProps } from "@/navigators/HeroesNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

export const HeroesDetailsScreen: FC<HeroesStackScreenProps<"Details">> = (props) => {
  const { themed, theme } = useAppTheme();

  const { data: hero } = useAssetsHero(props.route.params.heroId);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
      {hero ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <HeroImage heroId={hero.id} size={80} />
            <View>
              <Text numberOfLines={1} style={{ fontSize: 20 }}>
                <HeroName heroId={hero.id} />
              </Text>
              <Text numberOfLines={2} style={{ flexWrap: "wrap", marginTop: theme.spacing.xs, maxWidth: 200 }}>
                <HeroDescriptionRole heroId={hero.id} />
              </Text>
            </View>
          </View>
          <View style={themed($abilitiesContainer)}>
            <Text preset="subheading" style={$styles.textCenter}>
              Abilities
            </Text>
            <HeroAbilities
              heroId={hero.id}
              highlightedAbility={selectedAbility}
              onAbilityClick={(clickedAbility) =>
                setSelectedAbility(clickedAbility === selectedAbility ? null : clickedAbility)
              }
            />
            {selectedAbility && (
              <View style={themed($abilityDescriptionContainer)}>
                <Text preset="subsubheading" style={$styles.textCenter}>
                  Description
                </Text>
                <AbilityDescription ability_class_name={selectedAbility} />
              </View>
            )}
          </View>
        </>
      ) : (
        <ActivityIndicator />
      )}
    </Screen>
  );
};

const $abilitiesContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginVertical: spacing.xl,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  paddingTop: spacing.lg,
});

const $abilityDescriptionContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
});
