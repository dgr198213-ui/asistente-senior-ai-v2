import { Platform } from "react-native";
import * as Network from "expo-network";

export type NetworkStatus = "online" | "offline" | "connecting";

export type NetworkError = {
  type: "timeout" | "no_connection" | "server_error" | "parse_error" | "unknown";
  message: string;
  originalError?: Error;
  statusCode?: number;
};

type NetworkStatusListener = (status: NetworkStatus) => void;

class NetworkService {
  private status: NetworkStatus = "online";
  private listeners: Set<NetworkStatusListener> = new Set();
  private isMonitoring = false;
  private retryCount = 0;
  private maxRetries = 3;

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Check initial status
    await this._checkNetworkStatus();

    // Set up periodic checks
    setInterval(() => this._checkNetworkStatus(), 5000);

    console.log("[NetworkService] Initialized");
  }

  /**
   * Check current network status
   */
  private async _checkNetworkStatus(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // For web, use navigator.onLine
        const isOnline = typeof navigator !== "undefined" && navigator.onLine;
        this._setStatus(isOnline ? "online" : "offline");
      } else {
        // For native, use expo-network
        const state = await Network.getNetworkStateAsync();
        this._setStatus(state.isConnected ? "online" : "offline");
      }
    } catch (error) {
      console.warn("[NetworkService] Status check error:", error);
    }
  }

  /**
   * Set network status and notify listeners
   */
  private _setStatus(newStatus: NetworkStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      console.log(`[NetworkService] Status changed to: ${newStatus}`);
      this.listeners.forEach((listener) => listener(newStatus));
    }
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    // Call immediately with current status
    listener(this.status);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return this.status;
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.status === "online";
  }

  /**
   * Fetch with retry logic and timeout
   */
  async fetchWithRetry(
    url: string,
    options: RequestInit & { timeout?: number; retries?: number } = {}
  ): Promise<Response> {
    const { timeout = 10000, retries = 3, ...fetchOptions } = options;
    let lastError: NetworkError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Check if online
        if (!this.isOnline()) {
          throw {
            type: "no_connection",
            message: "Sin conexión a internet",
          } as NetworkError;
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw {
              type: "server_error",
              message: `Error del servidor: ${response.status}`,
              statusCode: response.status,
            } as NetworkError;
          }

          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        lastError = this._parseNetworkError(error);

        // If it's a connection error and we have retries left, wait and retry
        if (attempt < retries && (lastError.type === "no_connection" || lastError.type === "timeout")) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.warn(`[NetworkService] Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Otherwise throw the error
        throw lastError;
      }
    }

    throw lastError || { type: "unknown", message: "Error desconocido" };
  }

  /**
   * Parse network errors
   */
  private _parseNetworkError(error: any): NetworkError {
    if (error instanceof TypeError) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
        return {
          type: "no_connection",
          message: "No hay conexión a internet",
          originalError: error,
        };
      }
      if (error.message.includes("aborted")) {
        return {
          type: "timeout",
          message: "La solicitud tardó demasiado tiempo",
          originalError: error,
        };
      }
    }

    if (error.type === "no_connection") {
      return error;
    }

    if (error.type === "server_error") {
      return error;
    }

    if (error instanceof SyntaxError) {
      return {
        type: "parse_error",
        message: "Error al procesar la respuesta",
        originalError: error,
      };
    }

    return {
      type: "unknown",
      message: error?.message || "Error desconocido",
      originalError: error,
    };
  }

  /**
   * Get human-readable error message
   */
  getErrorMessage(error: NetworkError): string {
    switch (error.type) {
      case "no_connection":
        return "Sin conexión. Intentando reconectar...";
      case "timeout":
        return "La conexión tardó demasiado. Por favor, intenta de nuevo.";
      case "server_error":
        return `Error del servidor (${error.statusCode}). Por favor, intenta más tarde.`;
      case "parse_error":
        return "Error al procesar la respuesta. Por favor, intenta de nuevo.";
      default:
        return "Error de conexión. Por favor, intenta de nuevo.";
    }
  }
}

// Singleton instance
export const networkService = new NetworkService();
