import { type ApiResponse, type ApisauceInstance, create } from "apisauce";

import Config from "@/config";
import { deadlock_locale } from "@/i18n";
import type { Hero } from "@/services/assets-api/types/hero";
import type { Ability, Item, Upgrade, Weapon } from "@/services/assets-api/types/item";

export interface AssetsApiConfig {
  apiUrl: string;
  timeout: number;
}

export const DEFAULT_ASSETS_API_CONFIG: AssetsApiConfig = {
  apiUrl: Config.ASSETS_API_URL,
  timeout: 5000,
};

export class AssetsApi {
  api: ApisauceInstance;
  config: AssetsApiConfig;

  constructor(config: AssetsApiConfig = DEFAULT_ASSETS_API_CONFIG) {
    this.config = config;
    this.api = create({
      // baseURL: this.config.apiUrl,
      baseURL: "https://assets.deadlock-api.com/",
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    });
  }

  async getHeroes(): Promise<ApiResponse<Hero[]>> {
    return await this.api.get(`v2/heroes`, {
      only_active: "true",
      language: deadlock_locale,
    });
  }

  async getHero(heroId: number): Promise<ApiResponse<Hero>> {
    return await this.api.get(`v2/heroes/${heroId}`, {
      language: deadlock_locale,
    });
  }

  async getItems(): Promise<ApiResponse<Item[]>> {
    return await this.api.get(`v2/items`, {
      language: deadlock_locale,
    });
  }

  async getItem(itemId: number | string): Promise<ApiResponse<Item>> {
    return await this.api.get(`v2/items/${itemId}`, {
      language: deadlock_locale,
    });
  }

  async getUpgrades(): Promise<ApiResponse<Upgrade[]>> {
    return await this.api.get(`v2/items/by-type/upgrade`, {
      language: deadlock_locale,
    });
  }

  async getUpgrade(itemId: number | string): Promise<ApiResponse<Upgrade>> {
    return (await this.getItem(itemId)) as ApiResponse<Upgrade>;
  }

  async getAbilities(): Promise<ApiResponse<Ability[]>> {
    return await this.api.get(`v2/items/by-type/ability`, {
      language: deadlock_locale,
    });
  }

  async getAbility(itemId: number | string): Promise<ApiResponse<Ability>> {
    return (await this.getItem(itemId)) as ApiResponse<Ability>;
  }

  async getWeapons(): Promise<ApiResponse<Weapon[]>> {
    return await this.api.get(`v2/items/by-type/weapon`, {
      language: deadlock_locale,
    });
  }

  async getWeapon(itemId: number | string): Promise<ApiResponse<Weapon>> {
    return (await this.getItem(itemId)) as ApiResponse<Weapon>;
  }
}

export const assetsApi = new AssetsApi();
