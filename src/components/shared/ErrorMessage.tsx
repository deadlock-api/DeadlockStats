import React from "react";
import { type StyleProp, type TextStyle, View, type ViewStyle } from "react-native";
import { Button, type ButtonProps } from "src/components/ui/Button";
import { Text, type TextProps } from "src/components/ui/Text";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";

export interface ErrorMessageProps {
  /**
   * Error message to display
   */
  message?: string;
  /**
   * Error message translation key
   */
  messageTx?: TextProps["tx"];
  /**
   * Translation options for the message
   */
  messageTxOptions?: TextProps["txOptions"];
  /**
   * Title for the error
   */
  title?: string;
  /**
   * Title translation key
   */
  titleTx?: TextProps["tx"];
  /**
   * Translation options for the title
   */
  titleTxOptions?: TextProps["txOptions"];
  /**
   * Retry button text
   */
  retryText?: string;
  /**
   * Retry button translation key
   */
  retryTx?: ButtonProps["tx"];
  /**
   * Translation options for retry button
   */
  retryTxOptions?: ButtonProps["txOptions"];
  /**
   * Callback for retry action
   */
  onRetry?: () => void;
  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Whether to show the error in a centered container
   */
  centered?: boolean;
}

/**
 * A reusable error message component with optional retry functionality
 * @param props - The props for the ErrorMessage component
 * @returns JSX.Element - The rendered ErrorMessage component
 */
export const ErrorMessage = React.memo<ErrorMessageProps>(function ErrorMessage(props) {
  const {
    message,
    messageTx,
    messageTxOptions,
    title,
    titleTx,
    titleTxOptions,
    retryText,
    retryTx,
    retryTxOptions,
    onRetry,
    style: $styleOverride,
    centered = true,
  } = props;

  const { themed } = useAppTheme();

  const $containerStyles = [centered && themed($centeredContainer), $styleOverride];

  const hasTitle = title || titleTx;
  const hasMessage = message || messageTx;
  const hasRetry = onRetry && (retryText || retryTx);

  return (
    <View style={$containerStyles}>
      {hasTitle && (
        <Text preset="subheading" text={title} tx={titleTx} txOptions={titleTxOptions} style={themed($title)} />
      )}

      {hasMessage && <Text text={message} tx={messageTx} txOptions={messageTxOptions} style={themed($message)} />}

      {hasRetry && (
        <Button
          text={retryText}
          tx={retryTx}
          txOptions={retryTxOptions}
          onPress={onRetry}
          style={themed($retryButton)}
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

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.sm,
});

const $message: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.md,
});

const $retryButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
});
