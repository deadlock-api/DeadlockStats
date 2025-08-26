import React from "react";
import { ActivityIndicator, type StyleProp, type TextStyle, View, type ViewStyle } from "react-native";
import { Text, type TextProps } from "src/components/ui/Text";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";

export interface LoadingIndicatorProps {
  /**
   * Loading message to display
   */
  message?: string;
  /**
   * Loading message translation key
   */
  messageTx?: TextProps["tx"];
  /**
   * Translation options for the message
   */
  messageTxOptions?: TextProps["txOptions"];
  /**
   * Size of the activity indicator
   */
  size?: "small" | "large";
  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom style for the text
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Whether to show the loading indicator in a centered container
   */
  centered?: boolean;
}

/**
 * A reusable loading indicator component with optional message
 * @param props - The props for the LoadingIndicator component
 * @returns JSX.Element - The rendered LoadingIndicator component
 */
export const LoadingIndicator = React.memo<LoadingIndicatorProps>(function LoadingIndicator(props) {
  const {
    message,
    messageTx = "common:loading",
    messageTxOptions,
    size = "large",
    style: $styleOverride,
    textStyle: $textStyleOverride,
    centered = true,
  } = props;

  const { theme, themed } = useAppTheme();

  return (
    <View style={[centered && themed($centeredContainer), { marginVertical: theme.spacing.xl }, $styleOverride]}>
      <ActivityIndicator size={size} color={theme.colors.tint} />
      {(message || messageTx) && (
        <Text
          text={message}
          tx={messageTx}
          txOptions={messageTxOptions}
          style={themed([themed($text), $textStyleOverride])}
        />
      )}
    </View>
  );
});

const $centeredContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $text: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  textAlign: "center",
});
