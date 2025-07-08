import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Send,
  QrCode,
  Settings,
  Eye,
  EyeOff,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultTapLogo } from "@/components/VaultTapLogo";
import { BluetoothStatus } from "@/components/BluetoothStatus";
import { TransactionCard } from "@/components/TransactionCard";
import { VaultCard } from "@/components/VaultCard";
import { api } from "@/lib/api";
import { DashboardResponse } from "@shared/api";

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <VaultTapLogo />
            </Link>
            <div className="hidden sm:flex items-center space-x-4">
              <BluetoothStatus
                status={dashboardData.bluetoothStatus.status}
                peerCount={dashboardData.bluetoothStatus.peerCount}
              />
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="sm:hidden mt-3 flex justify-center">
            <BluetoothStatus
              status={dashboardData.bluetoothStatus.status}
              peerCount={dashboardData.bluetoothStatus.peerCount}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vault-blue via-vault-purple to-vault-blue p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-lg">Total Balance</p>
                <div className="flex items-center space-x-4">
                  {showBalance ? (
                    <h1 className="text-4xl md:text-5xl font-bold">
                      {dashboardData.balance.totalBalance.toFixed(2)} VT
                    </h1>
                  ) : (
                    <h1 className="text-4xl md:text-5xl font-bold">••••••</h1>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white hover:bg-white/20"
                  >
                    {showBalance ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-white/80">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    +{dashboardData.stats.totalYieldEarned.toFixed(1)} VT earned
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/send" className="flex-1">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm">
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </Button>
              </Link>
              <Button className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm">
                <QrCode className="w-5 h-5 mr-2" />
                Receive
              </Button>
              <Link to="/vault" className="flex-1">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm">
                  <Plus className="w-5 h-5 mr-2" />
                  New Vault
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Vaults Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Vaults</h2>
            <Link to="/vault">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Vault
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.vaults.map((vault) => (
              <VaultCard
                key={vault.id}
                name={vault.name}
                balance={vault.balance}
                yieldRate={vault.yieldRate}
                participants={vault.participantCount}
                type={vault.type}
                isLocked={vault.isLocked}
                onOpen={() => console.log(`Opening ${vault.name}`)}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>

          <div className="space-y-4">
            {dashboardData.recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                type={transaction.type}
                amount={transaction.amount}
                peer={
                  transaction.type === "sent"
                    ? transaction.toPeer || "Unknown"
                    : transaction.fromPeer || "Unknown"
                }
                timestamp={formatTimestamp(transaction.timestamp)}
                status={transaction.status}
                ritual={transaction.ritual}
              />
            ))}
          </div>

          <Button variant="outline" className="w-full">
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
}
