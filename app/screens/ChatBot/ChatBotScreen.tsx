import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Markdown from "@ronradtke/react-native-markdown-display";
import { createRef, type FC, type Ref, useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  type TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import EventSource, { type ErrorEvent } from "react-native-sse";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import Config from "@/config";
import { useSteamProfile } from "@/hooks/useSteamProfile";
import { translate } from "@/i18n/translate";
import type { ChatBotStackScreenProps } from "@/navigators/ChatBotNavigator";
import { SettingsItem } from "@/screens/MainSettingsScreen";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { sample } from "@/utils/random";
import { getSteamId, removeSkipWelcomePreference } from "@/utils/steamAuth";

interface Message {
  role: "user" | "assistant";
  text: string;
  error?: boolean;
}

interface ActionStep {
  role: "assistant" | "tool-call" | "tool-response";
  content: { type: "text"; text: string }[];
}

interface ActionEvent {
  type: "action";
  data: ActionStep[];
}

interface FinalAnswerEvent {
  type: "final_answer";
  data: string;
}

interface FormattedResponseEvent {
  type: "formatted_response";
  data: string;
}

export type AgentStep = ActionEvent | FinalAnswerEvent | FormattedResponseEvent;

export const ChatBotScreen: FC<ChatBotStackScreenProps<"ChatBot">> = () => {
  const navigation = useNavigation();
  const { themed, theme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inflightMessage, setInflightMessage] = useState<Message | null>(null);
  const [prompt, setPrompt] = useState("");
  const [memoryId, setMemoryId] = useState<string | null>(null);
  const [lock, setLock] = useState<boolean>(false);
  const steamId = getSteamId();
  const { data: userProfile } = useSteamProfile(steamId);
  const flatListRef: Ref<FlatList<Message>> | undefined = createRef();

  const reset = useCallback(() => {
    setMessages([]);
    setInflightMessage(null);
    setPrompt("");
    setMemoryId(null);
  }, []);

  const handleSend = useCallback(() => {
    if (lock) return;
    setLock(true);
    if (prompt.length < 3) {
      setMessages((prev) => [
        ...prev,
        { text: prompt.trim(), role: "user" },
        { text: "Please enter a longer message", role: "assistant", error: true },
      ]);
      setLock(false);
      return;
    }

    const url = new URL(`${Config.AI_ASSISTANT_API_URL}/invoke`);
    url.searchParams.append("prompt", prompt);
    url.searchParams.append("markdown_syntax", "true");
    url.searchParams.append("sleep_time", "0.1");
    url.searchParams.append("api_key", "app");
    if (memoryId) {
      url.searchParams.append("memory_id", memoryId);
    }
    if (userProfile) {
      url.searchParams.append("steam_id", userProfile.account_id.toString());
    }

    setMessages((prev) => [...prev, { text: prompt.trim(), role: "user" }]);
    setPrompt("");

    const es: EventSource<string> = new EventSource(url);
    es.addEventListener("memoryId", (event) => {
      setMemoryId(event.data);
      es.close();
    });
    // @ts-ignore
    es.addEventListener("error", (event: ErrorEvent) => {
      setMessages((prev) => [...prev, { text: `Error: ${event.message}`, role: "assistant", error: true }]);
      es.close();
    });
    es.addEventListener("agentStep", (event) => {
      if (!event.data) return;
      const data: AgentStep = JSON.parse(event.data);
      switch (data.type) {
        case "action": {
          const actions = data.data
            .filter((step) => step.role === "assistant")
            .flatMap((step) => step.content)
            .map((c) => c.text);
          setInflightMessage({ role: "assistant", text: actions.join("\n\n").slice(0, 1000).trim() });
          break;
        }
        case "final_answer": {
          const answer = data.data;
          setInflightMessage(null);
          setMessages((prev) => [...prev, { text: answer.trim(), role: "assistant" }]);
          break;
        }
        case "formatted_response": {
          const formattedAnswer = data.data;
          setInflightMessage(null);
          setMessages((prev) => [...prev.slice(0, -1), { text: formattedAnswer.trim(), role: "assistant" }]);
          break;
        }
      }
    });
    es.addEventListener("open", () => {
      setInflightMessage({ role: "assistant", text: "Thinking..." });
    });
    es.addEventListener("close", () => {
      setInflightMessage(null);
      setLock(false);
      flatListRef?.current?.scrollToEnd({ animated: true });
      es.close();
    });
  }, [lock, prompt, memoryId, userProfile, flatListRef]);

  const handleLinkToSteam = useCallback(() => {
    removeSkipWelcomePreference();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  }, [navigation]);

  if (!userProfile) {
    return (
      <Screen preset="fixed" contentContainerStyle={[$styles.container, { flex: 1 }]}>
        <View style={{ flex: 1, gap: theme.spacing.md }}>
          <Text preset="heading" style={themed($heading)} text="AI Assistant" />
          <Text style={$styles.textCenter} text="Please link your Steam account to use the AI Assistant." />

          <View style={{ backgroundColor: theme.colors.palette.neutral100, borderRadius: 12 }}>
            <SettingsItem
              icon={<FontAwesome6 name="steam" solid color={theme.colors.text} size={20} />}
              title={translate("settingsScreen:linkToSteam")}
              subtitle={translate("settingsScreen:linkSteamAccount")}
              onPress={handleLinkToSteam}
              rightElement={<FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={20} />}
            />
          </View>
        </View>
      </Screen>
    );
  }

  const placeholder = sample(
    translate("chatBotScreen:chatPlaceholders", { returnObjects: true }) as unknown as string[],
  );
  return (
    <Screen preset="fixed" contentContainerStyle={[$styles.container, { flex: 1 }]}>
      <View style={{ flex: 1, gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text preset="heading" style={themed($heading)} text="AI Assistant" />
          <FlatList
            data={messages.concat(inflightMessage ? [inflightMessage] : [])}
            renderItem={({ item }) => <Message message={item} />}
            keyExtractor={(_, index) => index.toString()}
            ref={flatListRef}
            onContentSizeChange={() => flatListRef?.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ gap: theme.spacing.xxs }}
          />
        </View>
        {!lock ? (
          <View style={[themed($inputContainer)]}>
            <TouchableOpacity onPress={reset}>
              <FontAwesome6 name="rotate" solid color={theme.colors.text} size={20} />
            </TouchableOpacity>
            <TextInput
              autoCapitalize="sentences"
              autoCorrect={true}
              value={prompt}
              onChangeText={setPrompt}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textDim}
              onSubmitEditing={handleSend}
              submitBehavior="submit"
              style={themed($inputStyle)}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity onPress={handleSend}>
              <FontAwesome6 name="arrow-turn-up" solid color={theme.colors.text} size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator size="large" color={theme.colors.tint} />
        )}
      </View>
    </Screen>
  );
};

const Message = ({ message }: { message: Message }) => {
  const { themed, theme } = useAppTheme();
  const isUser = message.role === "user";
  return (
    <View style={[themed($messageContainer), { marginLeft: isUser ? "auto" : 0, marginRight: !isUser ? "auto" : 0 }]}>
      {isUser ? (
        <Text style={[{ textAlign: "right" }]} text={message.text.trim()} />
      ) : (
        <Markdown
          style={StyleSheet.create({ text: { color: theme.colors.text, fontFamily: theme.typography.primary.normal } })}
        >
          {message.text.trim()}
        </Markdown>
      )}
    </View>
  );
};

const $heading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.xs,
});

const $messageContainer: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  flexDirection: "column",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  maxWidth: "80%",
});

const $inputContainer: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  zIndex: 1,
  borderTopWidth: 1,
  borderTopColor: colors.tint,
  paddingTop: spacing.md,
});

const $inputStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  flex: 1,
  fontSize: 16,
  color: colors.text,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
});
