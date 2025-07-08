import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Wifi,
  Brain,
  CreditCard,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  response_time: number;
  last_incident: Date | null;
  incidents_24h: number;
}

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_throughput: number;
  requests_per_minute: number;
  error_rate: number;
  database_connections: number;
  cache_hit_rate: number;
}

interface RegionalHealth {
  region: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  mesh_nodes: number;
  active_connections: number;
  api_success_rate: number;
}

interface SecurityMetrics {
  blocked_requests: number;
  failed_auth_attempts: number;
  active_sessions: number;
  vault_encryptions: number;
  governance_checks: number;
  compliance_score: number;
}

export function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(
    null,
  );
  const [regionalHealth, setRegionalHealth] = useState<RegionalHealth[]>([]);
  const [securityMetrics, setSecurityMetrics] =
    useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadSystemHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock service status
      setServices([
        {
          name: "API Gateway",
          status: "healthy",
          uptime: 99.98,
          response_time: 145,
          last_incident: null,
          incidents_24h: 0,
        },
        {
          name: "Bluetooth Mesh",
          status: "healthy",
          uptime: 99.95,
          response_time: 89,
          last_incident: new Date(Date.now() - 7200000),
          incidents_24h: 1,
        },
        {
          name: "AI Agents",
          status: "degraded",
          uptime: 97.8,
          response_time: 2340,
          last_incident: new Date(Date.now() - 1800000),
          incidents_24h: 3,
        },
        {
          name: "Database",
          status: "healthy",
          uptime: 99.99,
          response_time: 23,
          last_incident: null,
          incidents_24h: 0,
        },
        {
          name: "Payment Processing",
          status: "healthy",
          uptime: 99.92,
          response_time: 456,
          last_incident: new Date(Date.now() - 86400000),
          incidents_24h: 0,
        },
        {
          name: "Revenue Analytics",
          status: "healthy",
          uptime: 99.85,
          response_time: 234,
          last_incident: null,
          incidents_24h: 0,
        },
      ]);

      // Mock performance metrics
      setPerformance({
        cpu_usage: 67,
        memory_usage: 82,
        disk_usage: 45,
        network_throughput: 234.5,
        requests_per_minute: 1247,
        error_rate: 0.03,
        database_connections: 145,
        cache_hit_rate: 94.2,
      });

      // Mock regional health
      setRegionalHealth([
        {
          region: "East Africa",
          status: "healthy",
          latency: 89,
          mesh_nodes: 5847,
          active_connections: 12340,
          api_success_rate: 99.7,
        },
        {
          region: "West Africa",
          status: "healthy",
          latency: 134,
          mesh_nodes: 8932,
          active_connections: 18450,
          api_success_rate: 99.5,
        },
        {
          region: "Central Africa",
          status: "degraded",
          latency: 267,
          mesh_nodes: 2134,
          active_connections: 4567,
          api_success_rate: 97.2,
        },
        {
          region: "Southern Africa",
          status: "healthy",
          latency: 112,
          mesh_nodes: 3456,
          active_connections: 7890,
          api_success_rate: 99.1,
        },
      ]);

      // Mock security metrics
      setSecurityMetrics({
        blocked_requests: 1247,
        failed_auth_attempts: 89,
        active_sessions: 12450,
        vault_encryptions: 5678,
        governance_checks: 892,
        compliance_score: 97.8,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load system health:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "down":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "text-red-500";
    if (usage >= 75) return "text-yellow-500";
    return "text-green-500";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "None";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">System Health Overview</h3>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of VaultTap platform
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
          <Button variant="outline" size="sm" onClick={loadSystemHealth}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-500" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{service.name}</h4>
                  {getStatusIcon(service.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{service.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response</span>
                    <span className="font-medium">
                      {service.response_time}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Incident</span>
                    <span className="font-medium">
                      {formatTimeAgo(service.last_incident)}
                    </span>
                  </div>
                  {service.incidents_24h > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Issues</span>
                      <Badge variant="secondary" className="text-xs">
                        {service.incidents_24h}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className={getUsageColor(performance.cpu_usage)}>
                    {performance.cpu_usage}%
                  </span>
                </div>
                <Progress value={performance.cpu_usage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className={getUsageColor(performance.memory_usage)}>
                    {performance.memory_usage}%
                  </span>
                </div>
                <Progress value={performance.memory_usage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disk Usage</span>
                  <span className={getUsageColor(performance.disk_usage)}>
                    {performance.disk_usage}%
                  </span>
                </div>
                <Progress value={performance.disk_usage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <span className="text-green-500">
                    {performance.cache_hit_rate}%
                  </span>
                </div>
                <Progress value={performance.cache_hit_rate} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {formatNumber(performance.requests_per_minute)}
                </p>
                <p className="text-sm text-muted-foreground">Requests/min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {performance.error_rate}%
                </p>
                <p className="text-sm text-muted-foreground">Error Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {performance.database_connections}
                </p>
                <p className="text-sm text-muted-foreground">DB Connections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {performance.network_throughput} MB/s
                </p>
                <p className="text-sm text-muted-foreground">Network</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-500" />
            Regional Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regionalHealth.map((region) => (
              <div
                key={region.region}
                className="p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{region.region}</h4>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(region.status)}
                    <span
                      className={cn("text-sm", getStatusColor(region.status))}
                    >
                      {region.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latency</p>
                    <p className="font-medium">{region.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{region.api_success_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mesh Nodes</p>
                    <p className="font-medium">
                      {formatNumber(region.mesh_nodes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Connections</p>
                    <p className="font-medium">
                      {formatNumber(region.active_connections)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      {securityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-500" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-lg font-bold">
                  {formatNumber(securityMetrics.blocked_requests)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Blocked Requests
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-lg font-bold">
                  {formatNumber(securityMetrics.failed_auth_attempts)}
                </p>
                <p className="text-xs text-muted-foreground">Failed Auth</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-lg font-bold">
                  {formatNumber(securityMetrics.active_sessions)}
                </p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-lg font-bold">
                  {formatNumber(securityMetrics.vault_encryptions)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Vault Encryptions
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-lg font-bold">
                  {formatNumber(securityMetrics.governance_checks)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Governance Checks
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Badge
                    variant={
                      securityMetrics.compliance_score >= 95
                        ? "default"
                        : "secondary"
                    }
                    className="px-2 py-1"
                  >
                    {securityMetrics.compliance_score}%
                  </Badge>
                </div>
                <p className="text-lg font-bold">Compliance</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
