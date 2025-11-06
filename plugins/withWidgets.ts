import type { WithAndroidWidgetsParams } from "react-native-android-widget";

export const widgetConfig: WithAndroidWidgetsParams = {
  // Paths to all custom fonts used in all widgets
  widgets: [
    {
      name: "MatchHistory",
      minHeight: "20dp",
      minWidth: "180dp",
      targetCellHeight: 2,
      targetCellWidth: 3,
      description: "Check your match history",
      previewImage: "./assets/widgets/match-history-preview.webp",
      resizeMode: "horizontal|vertical",
      updatePeriodMillis: 30 * 60 * 1000, // 30 minutes
    },
  ],
};
