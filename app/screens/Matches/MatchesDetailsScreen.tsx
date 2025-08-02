import type { FC } from "react";
import { ActivityIndicator } from "react-native";
import { Screen } from "@/components/ui/Screen";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";

export const MatchesDetailsScreen: FC<MatchesStackScreenProps<"Details">> = (props) => {
  const { themed, theme } = useAppTheme();

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
      <ActivityIndicator />
    </Screen>
  );
};
