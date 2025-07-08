import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  type: "sent" | "received" | "pending";
  amount: number;
  peer: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  ritual?: string;
  className?: string;
}

export function TransactionCard({
  type,
  amount,
  peer,
  timestamp,
  status,
  ritual,
  className,
}: TransactionCardProps) {
  const getIcon = () => {
    if (status === "pending") return <Clock className="w-5 h-5" />;
    if (status === "completed") return <CheckCircle className="w-5 h-5" />;
    return type === "sent" ? (
      <ArrowUpRight className="w-5 h-5" />
    ) : (
      <ArrowDownLeft className="w-5 h-5" />
    );
  };

  const getIconColor = () => {
    if (status === "pending") return "text-vault-orange";
    if (status === "failed") return "text-destructive";
    if (status === "completed") return "text-vault-green";
    return type === "sent" ? "text-vault-orange" : "text-vault-green";
  };

  const getAmountColor = () => {
    if (status === "failed") return "text-destructive";
    return type === "sent" ? "text-vault-orange" : "text-vault-green";
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors",
        className,
      )}
    >
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-secondary",
            getIconColor(),
          )}
        >
          {getIcon()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-foreground">{peer}</span>
            {ritual && (
              <span className="text-xs px-2 py-1 bg-vault-purple/20 text-vault-purple rounded-full">
                {ritual}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{timestamp}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-semibold", getAmountColor())}>
          {type === "sent" ? "-" : "+"}
          {amount.toFixed(2)} VT
        </p>
        <p className="text-xs text-muted-foreground capitalize">{status}</p>
      </div>
    </div>
  );
}
