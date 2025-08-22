import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import Widget, { type WIDGET_NAMES } from "src/widgets/widgets";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const widget = new Widget(widgetInfo.widgetName as (typeof WIDGET_NAMES)[number]);

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(await widget.render());
      break;

    case "WIDGET_DELETED":
      break;

    case "WIDGET_CLICK":
      break;

    default:
      break;
  }
}
