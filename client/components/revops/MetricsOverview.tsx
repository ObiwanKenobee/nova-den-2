import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MetricsData {
  revenue: {
    total: number;
    growth: number;
    mrr: number;
    arpu: number;
    breakdown: {
      user_fees: number;
      enterprise_apis: number;
      partner_subscriptions: number;
      usage_overages: number;
    };
  };
  users: {
    total: number;
    active: number;
    growth: number;
    churn_rate: number;
    tier_distribution: {
      free: number;
      ritual_vault: number;
      diaspora_unlock: number;
      multi_party_vault: number;
    };
  };
  usage: {
    api_calls: number;
    vault_activations: number;
    trust_tokens: number;
    governance_checks: number;
    mesh_transactions: number;
    geographic_distribution: {
      africa: number;
      asia: number;
      americas: number;
      europe: number;
    };
  };
  growth_targets: {
    revenue_target: number;
    revenue_actual: number;
    user_target: number;
    user_actual: number;
    partner_target: number;
    partner_actual: number;
  };
}

interface MetricsOverviewProps {
  timeRange: string;
}

export function MetricsOverview({ timeRange }: MetricsOverviewProps) {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetricsData();
  }, [timeRange]);

  const loadMetricsData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock metrics data
      setMetricsData({
        revenue: {
          total: 124750.83,
          growth: 23.5,
          mrr: 45230.45,
          arpu: 23.45,
          breakdown: {
            user_fees: 45230.45,
            enterprise_apis: 52400.0,
            partner_subscriptions: 24120.38,
            usage_overages: 3000.0,
          },
        },
        users: {
          total: 12450,
          active: 8234,
          growth: 15.2,
          churn_rate: 3.1,
          tier_distribution: {
            free: 1250,
            ritual_vault: 850,
            diaspora_unlock: 420,
            multi_party_vault: 180,
          },
        },
        usage: {
          api_calls: 2840593,
          vault_activations: 523,
          trust_tokens: 1247,
          governance_checks: 892,
          mesh_transactions: 15847,
          geographic_distribution: {
            africa: 45,
            asia: 25,
            americas: 15,
            europe: 15,
          },
        },
        growth_targets: {
          revenue_target: 150000,
          revenue_actual: 124750.83,
          user_target: 15000,
          user_actual: 12450,
          partner_target: 60,
          partner_actual: 47,
        },
      });
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading || !metricsData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-500" />
          Revenue Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(metricsData.revenue.total)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {formatPercentage(metricsData.revenue.growth)}
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(metricsData.revenue.mrr)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+18.2%</span>
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ARPU</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(metricsData.revenue.arpu)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+5.1%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Revenue Breakdown
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enterprise APIs</span>
                    <span className="font-medium">
                      {formatCurrency(
                        metricsData.revenue.breakdown.enterprise_apis,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>User Fees</span>
                    <span className="font-medium">
                      {formatCurrency(metricsData.revenue.breakdown.user_fees)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partners</span>
                    <span className="font-medium">
                      {formatCurrency(
                        metricsData.revenue.breakdown.partner_subscriptions,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          User Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(metricsData.users.total)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {formatPercentage(metricsData.users.growth)}
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(metricsData.users.active)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(
                      (metricsData.users.active / metricsData.users.total) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">
                    {metricsData.users.churn_rate}%
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">-0.3%</span>
                  </div>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">User Tiers</p>
                <div className="space-y-2">
                  {Object.entries(metricsData.users.tier_distribution).map(
                    ([tier, count]) => (
                      <div key={tier} className="flex justify-between text-sm">
                        <span className="capitalize">
                          {tier.replace("_", " ")}
                        </span>
                        <span className="font-medium">
                          {formatNumber(count)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage & Geographic Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Platform Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-500">
                  {formatNumber(metricsData.usage.api_calls)}
                </p>
                <p className="text-sm text-muted-foreground">API Calls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {formatNumber(metricsData.usage.vault_activations)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vault Activations
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {formatNumber(metricsData.usage.trust_tokens)}
                </p>
                <p className="text-sm text-muted-foreground">Trust Tokens</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {formatNumber(metricsData.usage.mesh_transactions)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Mesh Transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-500" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metricsData.usage.geographic_distribution).map(
                ([region, percentage]) => (
                  <div key={region} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{region}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Growth Targets vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Revenue Target</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(metricsData.growth_targets.revenue_target)}
                </span>
              </div>
              <Progress
                value={
                  (metricsData.growth_targets.revenue_actual /
                    metricsData.growth_targets.revenue_target) *
                  100
                }
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Actual:{" "}
                  {formatCurrency(metricsData.growth_targets.revenue_actual)}
                </span>
                <span>
                  {(
                    (metricsData.growth_targets.revenue_actual /
                      metricsData.growth_targets.revenue_target) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">User Target</span>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(metricsData.growth_targets.user_target)}
                </span>
              </div>
              <Progress
                value={
                  (metricsData.growth_targets.user_actual /
                    metricsData.growth_targets.user_target) *
                  100
                }
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Actual: {formatNumber(metricsData.growth_targets.user_actual)}
                </span>
                <span>
                  {(
                    (metricsData.growth_targets.user_actual /
                      metricsData.growth_targets.user_target) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Partner Target</span>
                <span className="text-sm text-muted-foreground">
                  {metricsData.growth_targets.partner_target}
                </span>
              </div>
              <Progress
                value={
                  (metricsData.growth_targets.partner_actual /
                    metricsData.growth_targets.partner_target) *
                  100
                }
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Actual: {metricsData.growth_targets.partner_actual}</span>
                <span>
                  {(
                    (metricsData.growth_targets.partner_actual /
                      metricsData.growth_targets.partner_target) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
