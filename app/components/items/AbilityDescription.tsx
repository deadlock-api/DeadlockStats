import type { MixedStyleDeclaration } from "@native-html/transient-render-engine";
import RenderHtml from "react-native-render-html";
import { useAssetsAbility } from "@/hooks/useAssetsitems";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface AbilityDescriptionProps {
  ability_class_name: string;
  fontSize?: number;
}

export function AbilityDescription(props: AbilityDescriptionProps) {
  const { themed } = useAppTheme();
  const { data: ability } = useAssetsAbility(props.ability_class_name);
  const description = ability?.description?.desc || "";

  // const svgRenderer = ({ ...props }) => {
  //   console.log(props);
  //   return <SvgXml xml={props.xml} style={themed($svg)} />;
  // };

  return (
    <RenderHtml
      // renderers={{
      //   svg: svgRenderer,
      // }}
      ignoredDomTags={["svg", "img"]} // Ignore IMG and SVG tags for now, until properly implemented
      source={{ html: description }}
      contentWidth={300}
      baseStyle={themed($baseStyle)}
      enableCSSInlineProcessing={true}
    />
  );
}

const $baseStyle: ThemedStyle<MixedStyleDeclaration> = (theme) => ({
  color: theme.colors.text,
});
