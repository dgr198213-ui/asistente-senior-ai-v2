import { useEffect, useState } from "react";
import { configService, AppConfig } from "@/lib/config-service";
import { networkService, NetworkStatus } from "@/lib/network-service";

export type AppInitStatus = "initializing" | "ready" | "error";

export function useAppInit() {
  const [status, setStatus] = useState<AppInitStatus>("initializing");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("online");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize network service
        await networkService.initialize();

        // Initialize config service
        const appConfig = await configService.initialize();
        setConfig(appConfig);

        setStatus("ready");
        setError(null);
        console.log("[useAppInit] App initialized successfully");
      } catch (err) {
        console.error("[useAppInit] Initialization error:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    initializeApp();
  }, []);

  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      setNetworkStatus(status);
    });

    return unsubscribe;
  }, []);

  return {
    status,
    config,
    networkStatus,
    error,
    isReady: status === "ready",
    isOnline: networkStatus === "online",
  };
}
