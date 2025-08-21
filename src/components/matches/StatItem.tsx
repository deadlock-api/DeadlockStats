import { type TextStyle, View } from "react-native";
import type { DimensionValue } from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import { Text } from "../ui/Text";
import { useAppTheme } from "../../theme/context";
import type { ThemedStyle } from "../../theme/types";

export interface StatItemProps {
  label: string;
  value: string | number;
  valueColor?: string;
  width?: DimensionValue;
  minWidth?: DimensionValue;
}

export function StatItem({ label, value, valueColor, minWidth, width }: StatItemProps) {
  const { themed, theme } = useAppTheme();
  return (
    <View style={{ minWidth: minWidth, width: width }}>
      <Text style={themed($statLabel)} size="xxs" text={label} numberOfLines={1} />
      <Text
        size="sm"
        weight="medium"
        text={value.toString()}
        style={{ textAlign: "center", color: valueColor ?? theme.colors.text }}
        numberOfLines={1}
      />
    </View>
  );
}

const $statLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
});
