import { type ApiResponse, type ApisauceInstance, create } from "apisauce";

import Config from "@/config";
import type { SteamProfile } from "@/services/api/types/steam_profile";
import type { MatchHistory } from "./types/match_history";

export interface ApiConfig {
  apiUrl: string;
  timeout: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  apiUrl: Config.API_URL,
  timeout: 5000,
};

export class AssetsApi {
  api: ApisauceInstance;
  config: ApiConfig;

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config;
    this.api = create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    });
  }

  async getSteamProfile(playerId: number): Promise<ApiResponse<SteamProfile>> {
    return await this.api.get(`v1/players/${playerId}/steam`);
  }

  async getMatchHistory(playerId: number): Promise<ApiResponse<MatchHistory[]>> {
    return await this.api.get(`v1/players/${playerId}/match-history`);
  }
}

export const api = new AssetsApi();
