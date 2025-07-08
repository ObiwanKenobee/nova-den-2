import { cn } from "@/lib/utils";

interface VaultTapLogoProps {
  className?: string;
  showText?: boolean;
}

export function VaultTapLogo({
  className,
  showText = true,
}: VaultTapLogoProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-vault-blue to-vault-purple rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-br from-vault-blue to-vault-purple rounded-sm"></div>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-vault-green rounded-full animate-pulse"></div>
      </div>
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-vault-blue to-vault-purple bg-clip-text text-transparent">
          VaultTap
        </span>
      )}
    </div>
  );
}
