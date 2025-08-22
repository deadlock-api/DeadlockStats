import { TextWidget } from "react-native-android-widget";
import { api } from "src/services/api";
import { assetsApi } from "src/services/assets-api";
import { getSteamId } from "src/utils/steamAuth";
import { MatchHistoryWidget } from "./MatchHistoryWidget";

export const WIDGET_NAMES = ["MatchHistory"] as const;

export default class {
  private readonly name: (typeof WIDGET_NAMES)[number];

  public constructor(name: (typeof WIDGET_NAMES)[number]) {
    this.name = name;
  }

  public async render() {
    switch (this.name) {
      case "MatchHistory": {
        const accountId = getSteamId() ?? undefined;
        const matchHistory = accountId ? ((await api.getMatchHistory(accountId)).data ?? []) : [];
        const assetsHeroes = (await assetsApi.getHeroes()).data ?? [];
        return <MatchHistoryWidget accountId={accountId} matchHistory={matchHistory} heroes={assetsHeroes} />;
      }
      default:
        return <TextWidget text="Unknown Widget" />;
    }
  }
}
