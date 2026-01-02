import { useState, useCallback } from "react";
import { networkService, NetworkError } from "@/lib/network-service";

export interface NetworkErrorState {
  error: NetworkError | null;
  isRetrying: boolean;
  retryCount: number;
}

/**
 * Hook for handling network errors with retry logic
 */
export function useNetworkError() {
  const [state, setState] = useState<NetworkErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const setError = useCallback((error: NetworkError | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const retry = useCallback(async (callback: () => Promise<void>) => {
    setState((prev) => ({
      ...prev,
      isRetrying: true,
    }));

    try {
      await callback();
      setState((prev) => ({
        ...prev,
        error: null,
        isRetrying: false,
        retryCount: 0,
      }));
    } catch (error) {
      const networkError = error as NetworkError;
      setState((prev) => ({
        ...prev,
        error: networkError,
        isRetrying: false,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, []);

  const getErrorMessage = useCallback((): string => {
    if (!state.error) return "";
    return networkService.getErrorMessage(state.error);
  }, [state.error]);

  return {
    ...state,
    setError,
    clearError,
    retry,
    getErrorMessage,
  };
}
