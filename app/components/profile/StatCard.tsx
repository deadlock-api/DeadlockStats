import React from "react";
import { Dimensions, type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

const { width } = Dimensions.get("window");

export interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  valueColor?: string;
  subtitle?: string;
}

export const StatCard = ({ title, value, subtitle, valueColor }: StatCardProps) => {
  const { themed } = useAppTheme();
  return (
    <View style={themed($statCard)}>
      <Text style={themed($statTitle)}>{title}</Text>
      {React.isValidElement(value) ? (
        value
      ) : (
        <Text style={[themed($statValue), valueColor && { color: valueColor }]}>{value}</Text>
      )}
      {subtitle && <Text style={themed($statSubtitleText)}>{subtitle}</Text>}
    </View>
  );
};

const $statCard: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.palette.neutral100,
  width: width / 2 - 32,
  padding: 16,
  borderRadius: 12,
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
});

const $statTitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  fontFamily: "Inter-Regular",
  color: theme.colors.textDim,
  marginBottom: 8,
});

export const $statValue: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 26,
  fontFamily: "Inter-Bold",
  color: theme.colors.text,
  marginBottom: 4,
});

const $statSubtitleText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 12,
  fontFamily: "Inter-Regular",
  color: theme.colors.textDim,
  lineHeight: 23,
});
