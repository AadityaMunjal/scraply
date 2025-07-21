import { useEffect, useState } from "react";
import { useServerHealth } from "./useApi";
import { useSocket } from "./useSocket";

export type ServerStatus = "online" | "offline" | "connecting" | "checking";

export const useServerStatus = () => {
  const [serverHealthStatus, setServerHealthStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const serverHealthMutation = useServerHealth();
  const { isConnected: isSocketConnected } = useSocket();

  const checkHealth = async () => {
    setServerHealthStatus("checking");
    try {
      await serverHealthMutation.mutateAsync();
      setServerHealthStatus("online");
    } catch (error) {
      setServerHealthStatus("offline");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getUnifiedStatus = (): ServerStatus => {
    if (serverHealthStatus === "offline") return "offline";
    if (serverHealthStatus === "checking") return "checking";
    if (serverHealthStatus === "online" && !isSocketConnected)
      return "connecting";
    return "online"; // Both server and socket are ready
  };

  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "connecting":
      case "checking":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: ServerStatus) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Server Offline";
      case "connecting":
        return "Connecting...";
      case "checking":
        return "Checking...";
      default:
        return "Unknown";
    }
  };

  const status = getUnifiedStatus();

  return {
    status,
    statusColor: getStatusColor(status),
    statusText: getStatusText(status),
    checkHealth,
    isServerOnline: serverHealthStatus === "online",
    isSocketConnected,
  };
};
