import { type FC, useState } from "react";
import { ActivityIndicator, type TextStyle, View, type ViewStyle } from "react-native";
import { HeroAbilities } from "@/components/heroes/HeroAbilities";
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

  const { data: hero } = useAssetsHero(props.route.params.hero_id);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container} safeAreaEdges={["top"]}>
      {hero ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <HeroImage hero_id={hero.id} size={80} />
            <View>
              <HeroName hero_id={hero.id} fontSize={20} />
              <Text numberOfLines={2} style={{ flexWrap: "wrap", marginTop: theme.spacing.xs, maxWidth: 200 }}>
                {hero.description.role}
              </Text>
            </View>
          </View>
          <View style={themed($abilitiesContainer)}>
            <Text style={themed($heading)}>Abilities</Text>
            <HeroAbilities
              hero_id={hero.id}
              highlightedAbility={selectedAbility}
              onAbilityClick={(clickedAbility) =>
                setSelectedAbility(clickedAbility === selectedAbility ? null : clickedAbility)
              }
            />
            {selectedAbility && (
              <View style={themed($abilityDescriptionContainer)}>
                <Text style={themed($subheading)}>Description</Text>
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

const $heading: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
};

const $subheading: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  textAlign: "center",
};

const $abilityDescriptionContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
});
