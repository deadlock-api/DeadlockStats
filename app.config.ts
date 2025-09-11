import type { ExpoConfig } from "@expo/config";

/**
 * Use ts-node here so we can use TypeScript for our Config Plugins
 * and not have to compile them to JavaScript
 */
require("ts-node/register");

module.exports = (): ExpoConfig => {
  return {
    name: "DeadlockStats",
    slug: "DeadlockStats",
    scheme: "deadlockstats",
    version: "0.0.5",
    platforms: ["android"],
    // platforms: ["android", "ios"],
    userInterfaceStyle: "automatic",
    icon: "./assets/images/app-icon-all.png",
    updates: {
      fallbackToCacheTimeout: 0,
    },
    newArchEnabled: true,
    android: {
      icon: "./assets/images/app-icon-android-legacy.png",
      package: "com.deadlockapi.deadlockstats",
      edgeToEdgeEnabled: true,
      userInterfaceStyle: "automatic",
      versionCode: 2,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "deadlock-api.com",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      splash: {
        backgroundColor: "#0F172A",
        image: "./assets/images/splash-logo-android-universal.png",
        resizeMode: "contain",
      },
    },
    // ios: {
    //   icon: "./assets/images/app-icon-ios.png",
    //   supportsTablet: true,
    //   bundleIdentifier: "com.deadlockapi.deadlockstats",
    //   associatedDomains: ["applinks:deadlock-api.com"],
    //   privacyManifests: {
    //     NSPrivacyAccessedAPITypes: [
    //       {
    //         NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
    //         NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
    //       },
    //     ],
    //   },
    //   splash: {
    //     backgroundColor: "#0F172A",
    //     image: "./assets/images/splash-logo-ios-mobile.png",
    //     resizeMode: "contain",
    //   },
    // },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            extraProguardRules: `
            -keep class com.shopify.reactnative.skia.** { *; }
            -keep public class com.horcrux.svg.** {*;}
            -keep class com.swmansion.reanimated.** { *; }
            -keep class com.facebook.react.turbomodule.** { *; }
            # Fixes a crash in android Production channel due to missing classes. '@nandorojo/galeria' library
            -keep class nandorojo.modules.galeria.** { *; }
            -keep class com.zeego.imageviewer.** { *; }        # Galeria’s delegate library
            -keepclassmembers class * extends expo.modules.kotlin.views.ExpoView {
                public <init>(android.content.Context);
                public <init>(android.content.Context, expo.modules.kotlin.AppContext);
            }`,
          },
        },
      ],
      "expo-localization",
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/app-icon-android-adaptive-foreground.png",
          imageWidth: 200,
          resizeMode: "cover",
          backgroundColor: "#191015",
        },
      ],
      require("./plugins/withSplashScreen").withSplashScreen,
      ["react-native-android-widget", require("./plugins/withWidgets").widgetConfig],
    ],
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
    },
    extra: {
      ignite: {
        version: "11.0.1",
      },
      eas: {
        projectId: "74b94e72-decb-4b89-8618-29bfd9ff8362",
      },
      updates: {
        assetPatternsToBeBundled: ["**/*"],
      },
    },
  };
};
