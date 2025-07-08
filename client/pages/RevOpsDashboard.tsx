import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AdminAuthGuard,
  useAdminAuthContext,
} from "@/components/auth/AdminAuthGuard";
import {
  ArrowLeft,
  Settings,
  Users,
  Shield,
  DollarSign,
  BarChart3,
  Globe,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VaultTapLogo } from "@/components/VaultTapLogo";
import { MetricsOverview } from "@/components/revops/MetricsOverview";
import { UserManagement } from "@/components/revops/UserManagement";
import { PartnerBilling } from "@/components/revops/PartnerBilling";
import { SystemHealth } from "@/components/revops/SystemHealth";
import { OperationalControls } from "@/components/revops/OperationalControls";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface SystemStatus {
  overall: "healthy" | "degraded" | "critical";
  services: {
    api: "up" | "down" | "degraded";
    bluetooth_mesh: "up" | "down" | "degraded";
    ai_agents: "up" | "down" | "degraded";
    database: "up" | "down" | "degraded";
    payments: "up" | "down" | "degraded";
  };
  uptime: number;
  response_time: number;
}

interface QuickStats {
  total_users: number;
  active_users: number;
  total_revenue: number;
  mrr: number;
  api_calls_today: number;
  mesh_nodes: number;
  vault_activations: number;
  partner_count: number;
}

function RevOpsDashboardContent() {
  const { admin, logout } = useAdminAuthContext();
  const [timeRange, setTimeRange] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadRevOpsData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRevOpsData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadRevOpsData = async () => {
    try {
      setLoading(true);

      // Call protected RevOps API endpoint
      const response = await fetch("/api/revops/dashboard", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication failed, redirect to login
          logout();
          return;
        }
        throw new Error("Failed to load RevOps data");
      }

      const data = await response.json();

      if (data.success) {
        // Use real data from API
        setAlerts(data.alerts || []);
        setSystemStatus(data.systemStatus || null);
        setQuickStats(data.quickStats || null);
      } else {
        throw new Error(data.message || "Failed to load data");
      }
    } catch (error) {
      console.error("Failed to load RevOps data:", error);

      // Fallback to mock data for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock alerts
      setAlerts([
        {
          id: "1",
          type: "warning",
          message: "High API usage in Nigeria region - approaching tier limits",
          timestamp: new Date(Date.now() - 300000),
          resolved: false,
        },
        {
          id: "2",
          type: "info",
          message: "New enterprise partner onboarded: UNHCR Kenya",
          timestamp: new Date(Date.now() - 1800000),
          resolved: false,
        },
        {
          id: "3",
          type: "critical",
          message:
            "Bluetooth mesh connectivity degraded in disaster zone deployment",
          timestamp: new Date(Date.now() - 3600000),
          resolved: true,
        },
      ]);

      // Mock system status
      setSystemStatus({
        overall: "healthy",
        services: {
          api: "up",
          bluetooth_mesh: "up",
          ai_agents: "degraded",
          database: "up",
          payments: "up",
        },
        uptime: 99.97,
        response_time: 145,
      });

      // Mock quick stats
      setQuickStats({
        total_users: 12450,
        active_users: 8234,
        total_revenue: 124750.83,
        mrr: 45230.45,
        api_calls_today: 2840593,
        mesh_nodes: 15847,
        vault_activations: 523,
        partner_count: 47,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "up":
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <VaultTapLogo />
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">
                  Revenue Operations
                </h1>
                <p className="text-sm text-muted-foreground">
                  Platform management & analytics
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users, partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRevOpsData}
                  disabled={loading}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading && "animate-spin")}
                  />
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                  <Badge className="ml-1 bg-red-500">
                    {alerts.filter((a) => !a.resolved).length}
                  </Badge>
                </Button>

                {/* Admin Info & Logout */}
                <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-border">
                  <div className="text-right text-xs">
                    <div className="font-medium">{admin?.name}</div>
                    <div className="text-muted-foreground">{admin?.role}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Status Bar */}
      {systemStatus && (
        <div className="border-b border-border/40 bg-card/50">
          <div className="container mx-auto px-4 lg:px-6 py-3">
            <div className="flex flex-wrap items-center gap-4 lg:gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    systemStatus.overall === "healthy"
                      ? "bg-green-500"
                      : systemStatus.overall === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500",
                  )}
                />
                <span className="font-medium">
                  System: {systemStatus.overall}
                </span>
              </div>
              <div>Uptime: {systemStatus.uptime}%</div>
              <div>Response: {systemStatus.response_time}ms</div>
              <div className="flex items-center space-x-4">
                {Object.entries(systemStatus.services).map(
                  ([service, status]) => (
                    <div key={service} className="flex items-center space-x-1">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          status === "up"
                            ? "bg-green-500"
                            : status === "degraded"
                              ? "bg-yellow-500"
                              : "bg-red-500",
                        )}
                      />
                      <span className="text-xs capitalize">
                        {service.replace("_", " ")}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Quick Stats Grid */}
        {quickStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    <p className="text-lg font-bold">
                      {formatNumber(quickStats.total_users)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Active Users
                    </p>
                    <p className="text-lg font-bold">
                      {formatNumber(quickStats.active_users)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(quickStats.total_revenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">MRR</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(quickStats.mrr)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">API Calls</p>
                    <p className="text-lg font-bold">
                      {formatNumber(quickStats.api_calls_today)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mesh Nodes</p>
                    <p className="text-lg font-bold">
                      {formatNumber(quickStats.mesh_nodes)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Activations</p>
                    <p className="text-lg font-bold">
                      {formatNumber(quickStats.vault_activations)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Partners</p>
                    <p className="text-lg font-bold">
                      {formatNumber(quickStats.partner_count)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>System Alerts</span>
                <Badge variant="secondary">
                  {alerts.filter((a) => !a.resolved).length} active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border",
                      alert.resolved ? "bg-muted/50 opacity-75" : "bg-card",
                    )}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {alert.resolved && (
                      <Badge variant="outline" className="text-xs">
                        Resolved
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MetricsOverview timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <PartnerBilling timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemHealth />
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <OperationalControls />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function RevOpsDashboard() {
  return (
    <AdminAuthGuard requiredPermissions={["revops:view"]}>
      <RevOpsDashboardContent />
    </AdminAuthGuard>
  );
}
