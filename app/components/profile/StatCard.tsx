import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Dimensions, type DimensionValue, type TextStyle, View, type ViewStyle } from "react-native";
import { Card } from "@/components/ui/Card";
import { Text, type TextProps } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

const { width: screenWidth } = Dimensions.get("window");

export interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  unit?: string;
  valueChange?: number;
  valueColor?: string;
  subtitle?: string;
  width?: DimensionValue;
  size?: TextProps["size"];
  onPress?: () => void;
}

export const StatCard = ({
  title,
  value,
  unit,
  subtitle,
  valueChange,
  valueColor,
  width,
  size,
  onPress,
}: StatCardProps) => {
  const { themed, theme } = useAppTheme();
  return (
    <Card
      style={[
        themed($statCard),
        {
          width: width ?? screenWidth / 2 - 32,
          minWidth: width ?? screenWidth / 2 - 32,
        },
      ]}
      onPress={onPress}
    >
      <View style={themed($statCardHeader)}>
        <Text size="xs" text={title} />
        {onPress && <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={14} />}
      </View>
      {React.isValidElement(value) ? (
        <View>{value}</View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs }}>
          <Text
            style={[valueColor && { color: valueColor }]}
            size={size ?? "lg"}
            weight="bold"
            numberOfLines={1}
            text={value?.toString()}
          />
          {unit && <Text size="xs" text={`/${unit}`} />}
          {valueChange && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs }}>
              <FontAwesome6
                style={{ color: valueChange > 0 ? theme.colors.palette.success500 : theme.colors.palette.failure500 }}
                name={valueChange > 0 ? "caret-up" : "caret-down"}
                solid
                size={18}
              />
              <Text
                size="sm"
                style={{ color: valueChange > 0 ? theme.colors.palette.success500 : theme.colors.palette.failure500 }}
                numberOfLines={1}
                text={`${Math.abs(valueChange)}`}
              />
            </View>
          )}
        </View>
      )}
      <Text size="xxs" style={themed($statSubtitleText)} text={subtitle} />
    </Card>
  );
};

const $statCard: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  justifyContent: "space-between",
  flexGrow: 1,
});

const $statCardHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xxs,
  flex: 1,
});

const $statSubtitleText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
});
