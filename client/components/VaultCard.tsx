import { Lock, Unlock, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VaultCardProps {
  name: string;
  balance: number;
  yieldRate: number;
  participants?: number;
  type: "personal" | "cooperative" | "community";
  isLocked: boolean;
  className?: string;
  onOpen?: () => void;
}

export function VaultCard({
  name,
  balance,
  yieldRate,
  participants = 1,
  type,
  isLocked,
  className,
  onOpen,
}: VaultCardProps) {
  const getTypeColor = () => {
    switch (type) {
      case "personal":
        return "from-vault-blue to-vault-purple";
      case "cooperative":
        return "from-vault-green to-vault-blue";
      case "community":
        return "from-vault-orange to-vault-purple";
      default:
        return "from-vault-blue to-vault-purple";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "cooperative":
        return <Users className="w-5 h-5" />;
      case "community":
        return <Users className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={cn(
        "relative p-6 rounded-2xl border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5",
          getTypeColor(),
        )}
      ></div>

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn("p-2 rounded-xl bg-gradient-to-br", getTypeColor())}
            >
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {type} vault
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <Lock className="w-5 h-5 text-vault-orange" />
            ) : (
              <Unlock className="w-5 h-5 text-vault-green" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-bold text-xl text-foreground">
              {balance.toFixed(2)} VT
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Yield Rate</span>
            <span className="text-sm font-medium text-vault-green">
              +{yieldRate}% APY
            </span>
          </div>

          {type !== "personal" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Participants
              </span>
              <span className="text-sm font-medium text-foreground">
                {participants}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={onOpen}
          className="w-full"
          variant={isLocked ? "secondary" : "default"}
        >
          {isLocked ? "Unlock Vault" : "Manage Vault"}
        </Button>
      </div>
    </div>
  );
}
