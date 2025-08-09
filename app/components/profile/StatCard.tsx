import React from "react";
import { Dimensions, type DimensionValue, type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

const { width: screenWidth } = Dimensions.get("window");

export interface StatCardProps {
  title: string | React.ReactNode;
  value: string | number | React.ReactNode;
  valueColor?: string;
  subtitle?: string;
  width?: DimensionValue;
  size?: number;
}

export const StatCard = ({ title, value, subtitle, valueColor, width, size }: StatCardProps) => {
  const { themed } = useAppTheme();
  return (
    <View style={[themed($statCard), { width: width ?? screenWidth / 2 - 32 }]}>
      <View style={themed($statCardHeader)}>
        {React.isValidElement(title) ? (
          title
        ) : (
          <Text style={themed($statTitle)} size="xs">
            {title}
          </Text>
        )}
      </View>
      {React.isValidElement(value) ? (
        value
      ) : (
        <Text style={[themed($statValue), valueColor && { color: valueColor }, { fontSize: size ?? 24 }]}>{value}</Text>
      )}
      {subtitle && (
        <Text size="xxs" style={themed($statSubtitleText)}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const $statCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 12,
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
});

const $statCardHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xxs,
});

const $statTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
});

export const $statValue: ThemedStyle<TextStyle> = (theme) => ({
  fontFamily: "Inter-Bold",
  color: theme.colors.text,
  marginBottom: 4,
});

const $statSubtitleText: ThemedStyle<TextStyle> = (theme) => ({
  fontFamily: "Inter-Regular",
  color: theme.colors.textDim,
});
