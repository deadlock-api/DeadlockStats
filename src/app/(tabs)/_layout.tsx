import { FontAwesome6 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { TextStyle, ViewStyle } from "react-native";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";

export default function TabLayout() {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: 70 }]),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
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
        name="matches"
        options={{
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
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: translate("mainNavigator:chatBotTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="comments" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
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
