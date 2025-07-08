import {
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BluetoothStatusProps {
  status: "connected" | "searching" | "disconnected";
  peerCount?: number;
  className?: string;
}

export function BluetoothStatus({
  status,
  peerCount = 0,
  className,
}: BluetoothStatusProps) {
  const getIcon = () => {
    switch (status) {
      case "connected":
        return <BluetoothConnected className="w-5 h-5" />;
      case "searching":
        return <BluetoothSearching className="w-5 h-5 animate-pulse" />;
      default:
        return <Bluetooth className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-vault-green";
      case "searching":
        return "text-vault-orange";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return `${peerCount} peers connected`;
      case "searching":
        return "Scanning for peers...";
      default:
        return "Bluetooth off";
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("flex items-center justify-center", getStatusColor())}>
        {getIcon()}
      </div>
      <span className={cn("text-sm", getStatusColor())}>{getStatusText()}</span>
    </div>
  );
}
