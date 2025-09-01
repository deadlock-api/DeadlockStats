import type { HashMapValue } from "deadlock-api-client/api";
import { useCallback } from "react";
import { usePlayerStatsMetrics } from "./usePlayerStatsMetrics";

/**
 * Names mapping for metric display
 */

/**
 * Performance metrics state interface
 */
export interface PerformanceMetricsState {
  isLoading: boolean;
  hasError: boolean;
  error: Error | null;
  communityStatsMetrics?: { [key: string]: HashMapValue };
  playerStatsMetrics?: { [key: string]: HashMapValue };
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing performance metrics data with error handling
 * @param accountId - Player account ID
 * @param minUnixTimestamp - Minimum Unix timestamp for data filtering
 * @returns Performance metrics state and handlers
 */
export function usePerformanceMetrics(accountId?: number, minUnixTimestamp?: number | null): PerformanceMetricsState {
  // Fetch community metrics
  const {
    data: communityStatsMetrics,
    isLoading: isLoadingCommunity,
    error: communityError,
    refetch: refetchCommunity,
  } = usePlayerStatsMetrics({ minUnixTimestamp });

  // Fetch player metrics
  const {
    data: playerStatsMetrics,
    isLoading: isLoadingPlayer,
    error: playerError,
    refetch: refetchPlayer,
  } = usePlayerStatsMetrics({ minUnixTimestamp, accountIds: accountId ? [accountId] : undefined });

  // Combine loading states
  const isLoading = isLoadingCommunity || isLoadingPlayer;

  // Combine error states
  const hasError = !!(communityError || playerError);
  const error = communityError || playerError || null;

  // Memoize refetch function
  const refetch = useCallback(async () => {
    try {
      await Promise.all([refetchCommunity(), refetchPlayer()]);
    } catch (error) {
      console.error("Failed to refetch performance metrics:", error);
      throw error;
    }
  }, [refetchCommunity, refetchPlayer]);

  return {
    isLoading,
    hasError,
    error,
    communityStatsMetrics,
    playerStatsMetrics,
    refetch,
  };
}
