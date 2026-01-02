import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

export type AppConfig = {
  appVersion: string;
  apiEndpoint: string;
  systemPrompt: string;
  features: {
    voiceAssistant: boolean;
    healthTracking: boolean;
    reminders: boolean;
    emergencyContacts: boolean;
    offlineMode: boolean;
  };
  accessibility: {
    minFontSize: number;
    allowFontScaling: boolean;
    minTouchSize: number;
    highContrast: boolean;
  };
  network: {
    retryAttempts: number;
    retryDelayMs: number;
    timeoutMs: number;
    allowCleartextTraffic: boolean;
  };
  ui: {
    theme: "light" | "dark";
    language: string;
  };
};

const CONFIG_STORAGE_KEY = "@asistente_senior_app_config";
const CONFIG_CACHE_KEY = "@asistente_senior_config_cache";

// Default configuration bundled with the app
const DEFAULT_CONFIG: AppConfig = {
  appVersion: "1.0.2",
  apiEndpoint: "https://api.manus.im",
  systemPrompt:
    "Eres un asistente útil y paciente, optimizado para usuarios mayores. Tus respuestas deben ser breves, claras y sin tecnicismos. Siempre sé empático y considera que el usuario puede tener limitaciones visuales o auditivas.",
  features: {
    voiceAssistant: true,
    healthTracking: true,
    reminders: true,
    emergencyContacts: true,
    offlineMode: true,
  },
  accessibility: {
    minFontSize: 16,
    allowFontScaling: true,
    minTouchSize: 60,
    highContrast: false,
  },
  network: {
    retryAttempts: 3,
    retryDelayMs: 2000,
    timeoutMs: 10000,
    allowCleartextTraffic: true,
  },
  ui: {
    theme: "light",
    language: "es",
  },
};

class ConfigService {
  private config: AppConfig | null = null;
  private isInitialized = false;
  private initPromise: Promise<AppConfig> | null = null;

  /**
   * Initialize the config service
   * Attempts to fetch remote config, falls back to local cache, then to defaults
   */
  async initialize(): Promise<AppConfig> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeInternal();
    return this.initPromise;
  }

  private async _initializeInternal(): Promise<AppConfig> {
    try {
      // Try to load from local cache first
      const cached = await this._loadFromCache();
      if (cached) {
        this.config = cached;
        this.isInitialized = true;
        console.log("[ConfigService] Loaded config from cache");

        // Try to fetch remote config in background
        this._fetchRemoteConfigInBackground();

        return cached;
      }

      // Try to fetch remote config
      const remote = await this._fetchRemoteConfig();
      if (remote) {
        this.config = remote;
        await this._saveToCache(remote);
        this.isInitialized = true;
        console.log("[ConfigService] Loaded config from remote");
        return remote;
      }

      // Fall back to default config
      this.config = DEFAULT_CONFIG;
      await this._saveToCache(DEFAULT_CONFIG);
      this.isInitialized = true;
      console.log("[ConfigService] Using default config (offline mode)");
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error("[ConfigService] Initialization error:", error);
      // Always return a valid config, even on error
      this.config = DEFAULT_CONFIG;
      this.isInitialized = true;
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Fetch remote config from API
   */
  private async _fetchRemoteConfig(): Promise<AppConfig | null> {
    try {
      const apiUrl = DEFAULT_CONFIG.apiEndpoint;
      const timeout = DEFAULT_CONFIG.network.timeoutMs;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${apiUrl}/api/config/app`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AsistenteSeniorApp/1.0.2",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[ConfigService] Remote config fetch failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return this._validateConfig(data) ? data : null;
    } catch (error) {
      console.warn("[ConfigService] Remote config fetch error:", error);
      return null;
    }
  }

  /**
   * Fetch remote config in background without blocking
   */
  private async _fetchRemoteConfigInBackground(): Promise<void> {
    try {
      const remote = await this._fetchRemoteConfig();
      if (remote) {
        this.config = remote;
        await this._saveToCache(remote);
        console.log("[ConfigService] Updated config from remote (background)");
      }
    } catch (error) {
      console.warn("[ConfigService] Background config update failed:", error);
    }
  }

  /**
   * Load config from local cache
   */
  private async _loadFromCache(): Promise<AppConfig | null> {
    try {
      const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.warn("[ConfigService] Cache load error:", error);
      return null;
    }
  }

  /**
   * Save config to local cache
   */
  private async _saveToCache(config: AppConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn("[ConfigService] Cache save error:", error);
    }
  }

  /**
   * Validate config structure
   */
  private _validateConfig(config: any): boolean {
    return (
      config &&
      typeof config === "object" &&
      config.appVersion &&
      config.apiEndpoint &&
      config.systemPrompt &&
      config.features &&
      config.accessibility &&
      config.network &&
      config.ui
    );
  }

  /**
   * Get current config (must call initialize first)
   */
  getConfig(): AppConfig {
    if (!this.config) {
      console.warn("[ConfigService] Config not initialized, returning defaults");
      return DEFAULT_CONFIG;
    }
    return this.config;
  }

  /**
   * Get system prompt for AI
   */
  getSystemPrompt(): string {
    return this.getConfig().systemPrompt;
  }

  /**
   * Get API endpoint
   */
  getApiEndpoint(): string {
    return this.getConfig().apiEndpoint;
  }

  /**
   * Get accessibility settings
   */
  getAccessibilitySettings() {
    return this.getConfig().accessibility;
  }

  /**
   * Get network settings
   */
  getNetworkSettings() {
    return this.getConfig().network;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof AppConfig["features"]): boolean {
    return this.getConfig().features[feature];
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Force refresh config from remote
   */
  async refreshConfig(): Promise<AppConfig> {
    try {
      const remote = await this._fetchRemoteConfig();
      if (remote) {
        this.config = remote;
        await this._saveToCache(remote);
        return remote;
      }
      return this.getConfig();
    } catch (error) {
      console.error("[ConfigService] Refresh error:", error);
      return this.getConfig();
    }
  }
}

// Singleton instance
export const configService = new ConfigService();
