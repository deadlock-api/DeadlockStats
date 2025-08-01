import type { FC } from "react";
import { type TextStyle, View, type ViewStyle } from "react-native";
import { SteamName } from "@/components/profile/SteamName";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import type { ProfileStackScreenProps } from "@/navigators/ProfileNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { getSteamId } from "@/utils/steamAuth";

export const ProfileOverviewScreen: FC<ProfileStackScreenProps<"Overview">> = (_props) => {
  const { themed, theme } = useAppTheme();

  const steamId = getSteamId();

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
      <View style={themed($profileContainer)}>
        <Text style={[themed($highlight), $styles.textCenter]} preset="subheading">
          <SteamName steamId={steamId} />
        </Text>
      </View>
    </Screen>
  );
};

const $profileContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  marginHorizontal: "auto",
  marginVertical: 0,
});

const $highlight: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary500,
});
