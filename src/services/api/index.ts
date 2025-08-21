import { type ApiResponse, type ApisauceInstance, create } from "apisauce";

import Config from "../../config";
import type { EnemyStats } from "./types/enemy_stats";
import type { HeroStats } from "./types/hero_stats";
import type { MateStats } from "./types/mate_stats";
import type { SteamProfile } from "./types/steam_profile";
import type { MatchHistory } from "./types/match_history";
import type { MatchMetadata } from "./types/match_metadata";

export interface ApiConfig {
  apiUrl: string;
  timeout: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  apiUrl: Config.API_URL,
  timeout: 5000,
};

export class Api {
  api: ApisauceInstance;
  config: ApiConfig;

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config;
    this.api = create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        UserAgent: "DeadlockStats/1.0.0",
      },
    });
  }

  async getSteamProfile(playerId: number): Promise<ApiResponse<SteamProfile>> {
    console.log("getSteamProfile", playerId);
    return await this.api.get(`v1/players/${playerId}/steam`);
  }

  async searchSteamProfile(search: string): Promise<ApiResponse<SteamProfile[]>> {
    console.log("searchSteamProfile", search);
    return await this.api.get(`v1/players/steam-search`, { search_query: search });
  }

  async getMatchHistory(playerId: number): Promise<ApiResponse<MatchHistory[]>> {
    console.log("getMatchHistory", playerId);
    return await this.api.get(`v1/players/${playerId}/match-history`);
  }

  async getHeroStats(playerId: number, minUnixTimestamp?: number | null): Promise<ApiResponse<HeroStats[]>> {
    console.log("getHeroStats", playerId, minUnixTimestamp);
    return await this.api.get(`v1/players/${playerId}/hero-stats`, {
      min_unix_timestamp: minUnixTimestamp,
    });
  }

  async getEnemyStats(
    playerId: number,
    query?: { min_unix_timestamp?: number; min_matches_played?: number },
  ): Promise<ApiResponse<EnemyStats[]>> {
    console.log("getEnemyStats", playerId, query);
    return await this.api.get(`v1/players/${playerId}/enemy-stats`, {
      min_unix_timestamp: query?.min_unix_timestamp,
      min_matches_played: query?.min_matches_played,
    });
  }

  async getMateStats(
    playerId: number,
    query?: { min_unix_timestamp?: number; same_party: boolean; min_matches_played?: number },
  ): Promise<ApiResponse<MateStats[]>> {
    console.log("getMateStats", playerId, query);
    return await this.api.get(`v1/players/${playerId}/mate-stats`, {
      min_unix_timestamp: query?.min_unix_timestamp,
      same_party: query?.same_party,
      min_matches_played: query?.min_matches_played,
    });
  }

  async getMatchMetadata(matchId: number): Promise<ApiResponse<MatchMetadata>> {
    console.log("getMatchMetadata", matchId);
    return await this.api.get(`v1/matches/${matchId}/metadata`);
  }
}

export const api = new Api();
