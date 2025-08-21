import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getSkipWelcomePreference, hasSteamId, saveSteamId } from "../utils/steamAuth";

export default function Index() {
  const [hasStoredSteamId, setHasStoredSteamId] = useState<boolean | null>(null);

  if (!hasStoredSteamId && __DEV__) {
    saveSteamId(74963221);
    setHasStoredSteamId(true);
  }

  useEffect(() => {
    const checkSteamId = () => {
      const steamIdExists = hasSteamId();
      const skipWelcome = getSkipWelcomePreference();
      setHasStoredSteamId(steamIdExists || skipWelcome);
    };

    checkSteamId();
  }, []);

  if (hasStoredSteamId === null) {
    return null;
  }

  return <Redirect href={hasStoredSteamId ? "/(tabs)" : "/welcome"} />;
}
