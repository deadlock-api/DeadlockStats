import { loadString, remove, saveString } from "./storage";

export const STEAM_ID_STORAGE_KEY = "steamId";

/**
 * Converts a Steam64 ID to SteamID3 format
 * @param steam64 - The Steam64 ID string
 * @returns The SteamID3 format string
 */
export function convertToSteamID3(steam64: string): number {
  return Number(BigInt(steam64) - BigInt("76561197960265728"));
}

/**
 * Extracts Steam ID from the OpenID response URL
 * @param url - The callback URL from Steam OpenID
 * @returns The Steam64 ID or null if not found
 */
export function extractSteamIdFromUrl(url: string): string | null {
  // Decode the URL first to handle URL-encoded parameters
  const decodedUrl = decodeURIComponent(url);
  const match = decodedUrl.match(/openid\.claimed_id=.*\/id\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Gets the stored Steam ID
 * @returns The stored Steam ID or null if not found
 */
export function getSteamId(): number | null {
  return Number(loadString(STEAM_ID_STORAGE_KEY));
}

/**
 * Saves the Steam ID to storage
 * @param steamId - The Steam ID to save
 * @returns True if saved successfully, false otherwise
 */
export function saveSteamId(steamId: number): boolean {
  return saveString(STEAM_ID_STORAGE_KEY, steamId.toString());
}

/**
 * Removes the Steam ID from storage
 */
export function removeSteamId(): void {
  remove(STEAM_ID_STORAGE_KEY);
}

/**
 * Checks if a Steam ID is stored
 * @returns True if a Steam ID is stored, false otherwise
 */
export function hasSteamId(): boolean {
  return !!getSteamId();
}
