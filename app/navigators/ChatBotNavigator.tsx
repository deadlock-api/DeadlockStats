import type { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import Config from "@/config";
import { ChatBotScreen } from "@/screens/ChatBot/ChatBotScreen";
import { useAppTheme } from "@/theme/context";
import { useBackButtonHandler } from "./navigationUtilities";

const exitRoutes = Config.exitRoutes;

export type ChatBotStackParamList = {
  ChatBot: undefined;
};
export type ChatBotStackScreenProps<T extends keyof ChatBotStackParamList> = NativeStackScreenProps<
  ChatBotStackParamList,
  T
>;

const Stack = createNativeStackNavigator<ChatBotStackParamList>();

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer<ChatBotStackParamList>>> {}

export const ChatBotNavigator = (_props: NavigationProps) => {
  const { theme } = useAppTheme();

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="ChatBot" component={ChatBotScreen} />
    </Stack.Navigator>
  );
};
