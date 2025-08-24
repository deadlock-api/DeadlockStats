import type { WithAndroidWidgetsParams } from "react-native-android-widget";

export const widgetConfig: WithAndroidWidgetsParams = {
  // Paths to all custom fonts used in all widgets
  widgets: [
    {
      name: "MatchHistory",
      minHeight: "100dp",
      minWidth: "180dp",
      description: "Check your music in different formats",
      previewImage: "./assets/widgets/match-history-preview.webp",
      resizeMode: "horizontal|vertical",
      updatePeriodMillis: 30 * 60 * 1000, // 30 minutes
    },
  ],
};
