import { FontAwesome6 } from "@expo/vector-icons";
import { Galeria } from "@nandorojo/galeria";
import Clipboard from "@react-native-clipboard/clipboard";
import { useRouter } from "expo-router";
import { createRef, type Ref, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  type TextStyle,
  TouchableOpacity,
  View,
  type ViewStyle
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Markdown from "react-native-marked";
import EventSource, { type ErrorEvent } from "react-native-sse";
import { SettingsItem } from "src/app/(tabs)/settings";
import { Turnstile } from "src/components/captcha";
import { AutoImage } from "src/components/ui/AutoImage";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import Config from "src/config";
import { useSteamProfile } from "src/hooks/useSteamProfile";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { sample } from "src/utils/random";
import { getSteamId, removeSkipWelcomePreference } from "src/utils/steamAuth";
import { loadString, remove, saveString } from "src/utils/storage";

interface Message {
  role: "user" | "assistant";
  text: string;
  error?: boolean;
  plots?: Set<string>;
}

interface ActionStep {
  role: "assistant" | "tool-call" | "tool-response";
  content: { type: "text"; text: string }[];
}

interface ActionEvent {
  type: "action";
  data: ActionStep[];
  plots?: string[];
}

interface FinalAnswerEvent {
  type: "final_answer";
  data: string;
  plots?: string[];
}

interface FormattedResponseEvent {
  type: "formatted_response";
  data: string;
}

export type AgentStep = ActionEvent | FinalAnswerEvent | FormattedResponseEvent;

export default function Chat() {
  const tokenWithExpire = loadString("captchaTokenWithExpire");
  let captchaToken: string | null = null;
  if (tokenWithExpire) {
    const [token, expire] = tokenWithExpire.split(" ");
    if (token && expire && Number(expire) > Date.now()) {
      captchaToken = token;
    } else {
      remove("captchaTokenWithExpire");
    }
  }

  const router = useRouter();
  const { themed, theme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState<string | null>(captchaToken);
  const [inflightMessage, setInflightMessage] = useState<Message | null>(null);
  const [prompt, setPrompt] = useState("");
  const [memoryId, setMemoryId] = useState<string | null>(null);
  const [lock, setLock] = useState<boolean>(false);
  const steamId = getSteamId();
  const { data: userProfile } = useSteamProfile(steamId);
  const flatListRef: Ref<FlatList<Message>> | undefined = createRef();

  const handleToken = useCallback((newToken: string) => {
    const expire = Date.now() + 6 * 24 * 60 * 60 * 1000;
    saveString("captchaTokenWithExpire", `${newToken} ${expire}`);
    setToken(newToken);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setInflightMessage(null);
    setPrompt("");
    setMemoryId(null);
  }, []);

  const handleSend = useCallback(() => {
    if (lock) return;

    if (!token) {
      setMessages((prev) => [
        ...prev,
        { text: prompt.trim(), role: "user" },
        { text: "Please validate the captcha", role: "assistant", error: true },
      ]);
      return;
    }
    if (prompt.length < 3) {
      setMessages((prev) => [
        ...prev,
        { text: prompt.trim(), role: "user" },
        { text: "Please enter a longer message", role: "assistant", error: true },
      ]);
      return;
    }

    setLock(true);

    const url = new URL(`${Config.AI_ASSISTANT_API_URL}/invoke`);
    url.searchParams.append("prompt", prompt);
    url.searchParams.append("markdown_syntax", "true");
    url.searchParams.append("sleep_time", "0.1");
    url.searchParams.append("captcha_token", token);
    if (memoryId) {
      url.searchParams.append("memory_id", memoryId);
    }
    if (userProfile) {
      url.searchParams.append("steam_id", userProfile.account_id.toString());
    }

    setMessages((prev) => [...prev, { text: prompt.trim(), role: "user" }]);
    setPrompt("");

    let plots = new Set<string>();

    const es: EventSource<string> = new EventSource(url);
    es.addEventListener("memoryId", (event) => {
      setMemoryId(event.data);
      es.close();
    });
    // @ts-expect-error
    es.addEventListener("error", (event: ErrorEvent) => {
      setMessages((prev) => [...prev, { text: `Error: ${event.message}`, role: "assistant", error: true }]);
      remove("captchaTokenWithExpire");
      setToken(null);
      es.close();
    });
    es.addEventListener("agentStep", (event) => {
      if (!event.data) return;
      const data: AgentStep = JSON.parse(event.data);
      switch (data.type) {
        case "action": {
          const firstStep = data.data.filter((step) => step.role === "assistant")[0].content[0].text;
          plots = new Set([...plots, ...(data.plots ?? [])]);
          setInflightMessage({
            role: "assistant",
            text: firstStep.slice(0, 1000).trim(),
            plots,
          });
          break;
        }
        case "final_answer": {
          const answer = data.data;
          plots = new Set([...plots, ...(data.plots ?? [])]);
          setInflightMessage(null);
          setMessages((prev) => [
            ...prev,
            {
              text: answer.trim(),
              role: "assistant",
              plots,
            },
          ]);
          break;
        }
        case "formatted_response": {
          const formattedAnswer = data.data;
          setInflightMessage(null);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { text: formattedAnswer.trim(), role: "assistant", plots: prev[prev.length - 1].plots },
          ]);
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
  }, [token, lock, prompt, memoryId, userProfile, flatListRef]);

  const handleLinkToSteam = useCallback(() => {
    removeSkipWelcomePreference();
    router.replace("/welcome");
  }, [router.replace]);

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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text preset="heading" style={themed($heading)} text="AI Assistant" />
            <Pressable onPress={reset}>
              <View style={{ flexDirection: "column", alignItems: "center" }}>
                <FontAwesome6 name="rotate" solid color={theme.colors.error} size={20} />
                <Text style={{ color: theme.colors.error }} size="xxs">
                  Reset
                </Text>
              </View>
            </Pressable>
          </View>
          <FlatList
            data={messages.concat(inflightMessage ? [inflightMessage] : [])}
            renderItem={({ item }) => <Message message={item} />}
            keyExtractor={(_, index) => index.toString()}
            ref={flatListRef}
            onContentSizeChange={() => flatListRef?.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ gap: theme.spacing.xs, justifyContent: "space-between" }}
          />
        </View>
        {!lock ? (
          token ? (
            <View style={[themed($inputContainer)]}>
              <TextInput
                autoCapitalize="sentences"
                value={prompt}
                onChangeText={setPrompt}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textDim}
                onSubmitEditing={handleSend}
                submitBehavior="submit"
                style={themed($inputStyle)}
                multiline
                autoCorrect
                numberOfLines={3}
              />
              <TouchableOpacity onPress={handleSend}>
                <FontAwesome6 name="circle-arrow-right" color={theme.colors.tint} size={24} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: "center", justifyContent: "center", gap: theme.spacing.md }}>
              <ActivityIndicator size="large" color={theme.colors.tint} />
              <Text tx="chatBotScreen:pleaseWaitValidatingCaptcha" />
              <Turnstile onToken={handleToken} />
            </View>
          )
        ) : (
          <ActivityIndicator size="large" color={theme.colors.tint} />
        )}
      </View>
    </Screen>
  );
}

const Message = ({ message }: { message: Message }) => {
  const { themed, theme } = useAppTheme();
  const isUser = message.role === "user";

  const uris = useMemo(() => {
    if (!message.plots) return [];
    return [...message.plots].map((p) => `data:image/png;base64,${p}`).slice(0, 5);
  }, [message.plots]);

  const copy = useCallback(() => {
    Clipboard.setString(message.text);
  }, [message.text]);

  return (
    <View
      style={[
        themed($messageContainer),
        {
          marginLeft: isUser ? "auto" : 0,
          marginRight: !isUser ? "auto" : 0,
          backgroundColor: isUser ? theme.colors.tint : theme.colors.palette.neutral100,
        },
      ]}
    >
      {isUser ? (
        <Pressable onLongPress={copy}>
          <Text
            style={[{ textAlign: "right", fontFamily: theme.typography.primary.normal }]}
            text={message.text.trim()}
            selectable
            selectionColor={theme.colors.tint}
          />
        </Pressable>
      ) : (
        <View>
          <Pressable onLongPress={copy}>
            <Markdown
              value={message.text.trim()}
              flatListProps={{ style: { backgroundColor: "transparent" } }}
              styles={{ text: { color: theme.colors.text, fontFamily: theme.typography.primary.normal } }}
            />
          </Pressable>
          {message.plots && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
              <Galeria urls={uris}>
                {uris.map((uri) => (
                  <Galeria.Image key={uri}>
                    <AutoImage source={{ uri: uri }} style={{ width: 100, height: 100 }} />
                  </Galeria.Image>
                ))}
              </Galeria>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const $heading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.xs,
});

const $messageContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "column",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  maxWidth: "80%",
});

const $inputContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.md,
  paddingBottom: spacing.sm,
  zIndex: 1,
});

const $inputStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  flex: 1,
  fontSize: 16,
  color: colors.text,
  borderRadius: spacing.md,
  padding: spacing.sm,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.tint,
  borderWidth: 1,
});
