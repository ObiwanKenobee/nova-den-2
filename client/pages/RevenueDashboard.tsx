import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Download,
  Calendar,
  Filter,
  Zap,
  Crown,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultTapLogo } from "@/components/VaultTapLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RevenueMetrics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  average_revenue_per_user: number;
  user_tier_breakdown: Record<string, number>;
  api_usage_revenue: number;
  vault_activation_revenue: number;
  trust_minting_revenue: number;
  growth_rate: number;
}

interface UsageAnalytics {
  api_calls: number;
  vault_activations: number;
  trust_tokens_minted: number;
  governance_checks: number;
  ritual_verifications: number;
  active_users: number;
  new_users: number;
  churn_rate: number;
}

interface PartnerMetrics {
  partner_count: number;
  enterprise_customers: number;
  total_partner_revenue: number;
  top_partners: Array<{
    name: string;
    plan: string;
    revenue: number;
    growth: number;
  }>;
}

export default function RevenueDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(
    null,
  );
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(
    null,
  );
  const [partnerMetrics, setPartnerMetrics] = useState<PartnerMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Simulate API calls - in production these would be real API requests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock revenue metrics
      setRevenueMetrics({
        total_revenue: 124750.83,
        monthly_recurring_revenue: 45230.45,
        average_revenue_per_user: 23.45,
        user_tier_breakdown: {
          free: 1250,
          ritual_vault: 850,
          diaspora_unlock: 420,
          multi_party_vault: 180,
        },
        api_usage_revenue: 12480.22,
        vault_activation_revenue: 8950.15,
        trust_minting_revenue: 3420.75,
        growth_rate: 23.5,
      });

      // Mock usage analytics
      setUsageAnalytics({
        api_calls: 2850000,
        vault_activations: 12450,
        trust_tokens_minted: 8950,
        governance_checks: 5230,
        ritual_verifications: 15680,
        active_users: 2700,
        new_users: 340,
        churn_rate: 2.1,
      });

      // Mock partner metrics
      setPartnerMetrics({
        partner_count: 28,
        enterprise_customers: 12,
        total_partner_revenue: 89450.0,
        top_partners: [
          {
            name: "UN World Food Programme",
            plan: "Guardian Tier",
            revenue: 24000,
            growth: 45.2,
          },
          {
            name: "Doctors Without Borders",
            plan: "Guardian Tier",
            revenue: 18000,
            growth: 32.1,
          },
          {
            name: "Grameen Foundation",
            plan: "Diaspora Vault Tier",
            revenue: 13500,
            growth: 28.7,
          },
          {
            name: "Climate Finance Lab",
            plan: "Regen Banking Tier",
            revenue: 15000,
            growth: 55.3,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 20) return "text-vault-green";
    if (growth > 0) return "text-vault-blue";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <VaultTapLogo showText={false} />
            <span className="text-xl font-semibold">Revenue Analytics</span>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(revenueMetrics?.total_revenue || 0)}
                </p>
                <p
                  className={cn(
                    "text-sm flex items-center gap-1",
                    getGrowthColor(revenueMetrics?.growth_rate || 0),
                  )}
                >
                  <TrendingUp className="w-3 h-3" />+
                  {revenueMetrics?.growth_rate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-vault-green/20 rounded-full">
                <DollarSign className="w-6 h-6 text-vault-green" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Monthly Recurring
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    revenueMetrics?.monthly_recurring_revenue || 0,
                  )}
                </p>
                <p className="text-sm text-vault-blue flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Stable growth
                </p>
              </div>
              <div className="p-3 bg-vault-blue/20 rounded-full">
                <BarChart3 className="w-6 h-6 text-vault-blue" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {formatNumber(usageAnalytics?.active_users || 0)}
                </p>
                <p className="text-sm text-vault-green flex items-center gap-1">
                  <Users className="w-3 h-3" />+{usageAnalytics?.new_users} new
                </p>
              </div>
              <div className="p-3 bg-vault-purple/20 rounded-full">
                <Users className="w-6 h-6 text-vault-purple" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">
                  {formatNumber(usageAnalytics?.api_calls || 0)}
                </p>
                <p className="text-sm text-vault-orange flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  This month
                </p>
              </div>
              <div className="p-3 bg-vault-orange/20 rounded-full">
                <Zap className="w-6 h-6 text-vault-orange" />
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="partners">Partner Revenue</TabsTrigger>
            <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue by Source */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Revenue by Source
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Usage</span>
                    <span className="font-semibold">
                      {formatCurrency(revenueMetrics?.api_usage_revenue || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-vault-blue h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vault Activations</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        revenueMetrics?.vault_activation_revenue || 0,
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-vault-green h-2 rounded-full"
                      style={{ width: "32%" }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trust Minting</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        revenueMetrics?.trust_minting_revenue || 0,
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-vault-purple h-2 rounded-full"
                      style={{ width: "12%" }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* User Tier Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  User Distribution
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    revenueMetrics?.user_tier_breakdown || {},
                  ).map(([tier, count]) => (
                    <div
                      key={tier}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-vault-blue"></div>
                        <span className="text-sm capitalize">
                          {tier.replace("_", " ")}
                        </span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-vault-green">
                      +{usageAnalytics?.new_users}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      New users this month
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {usageAnalytics?.churn_rate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Churn rate</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">ARPU</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-vault-blue">
                    {formatCurrency(
                      revenueMetrics?.average_revenue_per_user || 0,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average Revenue Per User
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Retention</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-vault-green">97.9%</p>
                  <p className="text-sm text-muted-foreground">
                    User retention
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Partner Overview */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Partner Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-vault-blue">
                      {partnerMetrics?.partner_count}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Partners
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-vault-green">
                      {formatCurrency(
                        partnerMetrics?.total_partner_revenue || 0,
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Partner Revenue
                    </p>
                  </div>
                </div>
              </Card>

              {/* Top Partners */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Partners</h3>
                <div className="space-y-3">
                  {partnerMetrics?.top_partners.map((partner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {partner.plan}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(partner.revenue)}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            getGrowthColor(partner.growth),
                          )}
                        >
                          +{partner.growth.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-vault-green/20 rounded-lg">
                    <Shield className="w-5 h-5 text-vault-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Vault Activations</h3>
                    <p className="text-2xl font-bold">
                      {formatNumber(usageAnalytics?.vault_activations || 0)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-vault-purple/20 rounded-lg">
                    <Crown className="w-5 h-5 text-vault-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Trust Tokens</h3>
                    <p className="text-2xl font-bold">
                      {formatNumber(usageAnalytics?.trust_tokens_minted || 0)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-vault-blue/20 rounded-lg">
                    <Globe className="w-5 h-5 text-vault-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ritual Verifications</h3>
                    <p className="text-2xl font-bold">
                      {formatNumber(usageAnalytics?.ritual_verifications || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
