import { FontAwesome6 } from "@expo/vector-icons";
import { type BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { TextStyle, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { translate } from "@/i18n/translate";
import { DashboardNavigator } from "@/navigators/DashboardNavigator";
import { HeroesNavigator } from "@/navigators/HeroesNavigator";
import { MatchesNavigator } from "@/navigators/MatchesNavigator";
import { MainSettingsScreen } from "@/screens/MainSettingsScreen";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { AppStackParamList, AppStackScreenProps } from "./AppNavigator";

export type MainTabParamList = {
  MainDashboard: undefined;
  MainMatches: undefined;
  MainHeroes: undefined;
  Settings: undefined;
};

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>;

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `MainNavigator`.
 */
export function MainNavigator() {
  const { bottom } = useSafeAreaInsets();
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      <Tab.Screen
        name="MainDashboard"
        component={DashboardNavigator}
        options={{
          tabBarLabel: translate("mainNavigator:dashboardTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="house" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />

      <Tab.Screen
        name="MainMatches"
        component={MatchesNavigator}
        options={{
          tabBarLabel: translate("mainNavigator:matchesTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="bar-chart" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate(route.name, { screen: "List" });
          },
        })}
      />

      <Tab.Screen
        name="MainHeroes"
        component={HeroesNavigator}
        options={{
          tabBarLabel: translate("mainNavigator:heroesTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="trophy" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate(route.name, { screen: "Stats" });
          },
        })}
      />

      <Tab.Screen
        name="Settings"
        component={MainSettingsScreen}
        options={{
          tabBarLabel: translate("mainNavigator:settingsTab"),
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="gear" solid color={focused ? colors.tint : colors.tintInactive} size={25} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
  marginTop: spacing.sm,
});

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
});

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
});
