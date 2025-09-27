import { FontAwesome6 } from "@expo/vector-icons";
import { Link, type LinkProps, Tabs } from "expo-router";
import { Pressable, type StyleProp, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "src/app/_layout";
import { SteamImage } from "src/components/profile/SteamImage";
import { SteamName } from "src/components/profile/SteamName";
import { Text } from "src/components/ui/Text";
import { useSteamProfiles } from "src/hooks/useSteamProfiles";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import { getSteamId } from "src/utils/steamAuth";

export default function TabLayout() {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme();

  const steamId = getSteamId();
  const { data: userProfiles } = useSteamProfiles({ accountIds: [steamId ?? 0] });
  const [player, setPlayer] = usePlayerSelected();

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: 90 }]),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
        popToTopOnBlur: true,
        headerShown: true,
        headerStyle: themed($headerStyle),
        headerBackButtonDisplayMode: "default",
        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            {player?.avatar && (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.palette.neutral300,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SteamImage profile={player ?? undefined} size={48} />
              </View>
            )}
            <Text numberOfLines={1} preset="subheading" style={{ maxWidth: 160 }}>
              {player ? <SteamName profile={player} /> : translate("common:noSteamAccount")}
            </Text>
            {player && player.account_id !== steamId && (
              <TouchableOpacity onPress={() => userProfiles && setPlayer(userProfiles[0] ?? null)}>
                <FontAwesome6 name="reply" solid color={colors.error} size={20} />
              </TouchableOpacity>
            )}
          </View>
        ),
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
              marginRight: spacing.md,
            }}
          >
            <Link href="/player-search" asChild>
              <FontAwesome6 name="magnifying-glass" solid color={colors.text} size={24} />
            </Link>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: translate("mainNavigator:dashboardTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="house" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="performance"
        options={{
          title: translate("mainNavigator:performanceTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="chart-line" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
          tabBarButton: (props) => {
            return (
              <Link
                {...(props as LinkProps)}
                disabled={player == null}
                style={[
                  { display: "flex" },
                  player == null ? { opacity: 0.5 } : {},
                  props.style as StyleProp<TextStyle>,
                ]}
                asChild
              >
                <Pressable>{props.children}</Pressable>
              </Link>
            );
          },
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          href: null,
          title: translate("mainNavigator:matchesTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="bar-chart" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="heroes"
        options={{
          title: translate("mainNavigator:heroesTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="trophy" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
          tabBarButton: (props) => {
            return (
              <Link
                {...(props as LinkProps)}
                disabled={player == null}
                style={[
                  { display: "flex" },
                  player == null ? { opacity: 0.5 } : {},
                  props.style as StyleProp<TextStyle>,
                ]}
                asChild
              >
                <Pressable>{props.children}</Pressable>
              </Link>
            );
          },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: translate("mainNavigator:chatBotTab"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="comments" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: translate("mainNavigator:settingsTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="gear" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />
    </Tabs>
  );
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
});

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
});

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 18,
  color: colors.text,
});

const $headerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderBottomColor: colors.transparent,
});
