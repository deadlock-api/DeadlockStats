import { useMemo } from "react";
import { Text } from "@/components/ui/Text";
import { useAssetsAbilities } from "@/hooks/useAssetsitems";

export interface AbilityNameProps {
  ability_class_name: string;
  fontSize?: number;
}

export function AbilityName(props: AbilityNameProps) {
  const { data: abilities } = useAssetsAbilities();
  const ability = useMemo(
    () => abilities?.find((a) => a.class_name === props.ability_class_name),
    [abilities, props.ability_class_name],
  );
  return (
    <Text numberOfLines={1} style={{ fontSize: props.fontSize }}>
      {ability?.name}
    </Text>
  );
}
