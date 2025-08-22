// `@expo/metro-runtime` MUST be the first import to ensure Fast Refresh works on web.
import "@expo/metro-runtime";

import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "src/widgets/widget-task-handler";

registerWidgetTaskHandler(widgetTaskHandler);
renderRootComponent(App);
