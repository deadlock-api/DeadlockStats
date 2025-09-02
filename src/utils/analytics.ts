import { loadString, remove, saveString } from "./storage";

export const ANALYTICS_OPT_OUT_STORAGE_KEY = "analyticsOptOut";

/**
 * Gets the analytics opt-out preference
 * @returns True if user has opted out of analytics, false otherwise
 */
export function getAnalyticsOptOut(): boolean {
  const preference = loadString(ANALYTICS_OPT_OUT_STORAGE_KEY);
  return preference === "true";
}

/**
 * Saves the analytics opt-out preference
 * @param optOut - Whether to opt out of analytics
 * @returns True if saved successfully, false otherwise
 */
export function saveAnalyticsOptOut(optOut: boolean): boolean {
  return saveString(ANALYTICS_OPT_OUT_STORAGE_KEY, optOut.toString());
}

/**
 * Removes the analytics opt-out preference
 */
export function removeAnalyticsOptOut(): void {
  remove(ANALYTICS_OPT_OUT_STORAGE_KEY);
}

/**
 * Checks if analytics is enabled (user has not opted out)
 * @returns True if analytics is enabled, false if user has opted out
 */
export function isAnalyticsEnabled(): boolean {
  return !getAnalyticsOptOut();
}
