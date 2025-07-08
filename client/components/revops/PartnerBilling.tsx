import React, { useState, useEffect } from "react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Users,
  Shield,
  Globe,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Partner {
  id: string;
  name: string;
  type: "ngo" | "government" | "enterprise" | "humanitarian";
  plan: "guardian" | "diaspora_vault" | "regen_banking";
  status: "active" | "pending" | "suspended";
  monthly_revenue: number;
  annual_revenue: number;
  users_count: number;
  api_usage: number;
  contract_start: Date;
  contract_end: Date;
  billing_cycle: "monthly" | "quarterly" | "annual";
  last_payment: Date;
  next_payment: Date;
  payment_status: "paid" | "pending" | "overdue";
  usage_overage: number;
  geographic_focus: string[];
}

interface BillingMetrics {
  total_partner_revenue: number;
  growth_rate: number;
  average_contract_value: number;
  churn_rate: number;
  overdue_amount: number;
  upcoming_renewals: number;
}

interface PartnerBillingProps {
  timeRange: string;
}

export function PartnerBilling({ timeRange }: PartnerBillingProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("all");

  useEffect(() => {
    loadPartnerData();
  }, [timeRange, selectedPlan]);

  const loadPartnerData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock partner data
      const mockPartners: Partner[] = [
        {
          id: "partner1",
          name: "UNHCR Kenya",
          type: "humanitarian",
          plan: "guardian",
          status: "active",
          monthly_revenue: 2000,
          annual_revenue: 24000,
          users_count: 1250,
          api_usage: 89,
          contract_start: new Date("2024-01-01"),
          contract_end: new Date("2024-12-31"),
          billing_cycle: "monthly",
          last_payment: new Date("2024-03-01"),
          next_payment: new Date("2024-04-01"),
          payment_status: "paid",
          usage_overage: 0,
          geographic_focus: ["Kenya", "Uganda", "Tanzania"],
        },
        {
          id: "partner2",
          name: "Red Cross Nigeria",
          type: "humanitarian",
          plan: "diaspora_vault",
          status: "active",
          monthly_revenue: 1500,
          annual_revenue: 18000,
          users_count: 2340,
          api_usage: 76,
          contract_start: new Date("2023-11-15"),
          contract_end: new Date("2024-11-15"),
          billing_cycle: "quarterly",
          last_payment: new Date("2024-01-01"),
          next_payment: new Date("2024-04-01"),
          payment_status: "paid",
          usage_overage: 450,
          geographic_focus: ["Nigeria", "Niger", "Chad"],
        },
        {
          id: "partner3",
          name: "Ghana Ministry of Finance",
          type: "government",
          plan: "regen_banking",
          status: "active",
          monthly_revenue: 5000,
          annual_revenue: 60000,
          users_count: 15000,
          api_usage: 94,
          contract_start: new Date("2024-02-01"),
          contract_end: new Date("2026-02-01"),
          billing_cycle: "annual",
          last_payment: new Date("2024-02-01"),
          next_payment: new Date("2025-02-01"),
          payment_status: "paid",
          usage_overage: 0,
          geographic_focus: ["Ghana"],
        },
        {
          id: "partner4",
          name: "Oxfam International",
          type: "ngo",
          plan: "guardian",
          status: "active",
          monthly_revenue: 2000,
          annual_revenue: 24000,
          users_count: 890,
          api_usage: 67,
          contract_start: new Date("2024-01-15"),
          contract_end: new Date("2024-12-31"),
          billing_cycle: "monthly",
          last_payment: new Date("2024-02-15"),
          next_payment: new Date("2024-03-20"),
          payment_status: "overdue",
          usage_overage: 120,
          geographic_focus: ["Sudan", "Ethiopia", "Somalia"],
        },
        {
          id: "partner5",
          name: "Safaricom Ltd",
          type: "enterprise",
          plan: "regen_banking",
          status: "pending",
          monthly_revenue: 0,
          annual_revenue: 0,
          users_count: 0,
          api_usage: 0,
          contract_start: new Date("2024-04-01"),
          contract_end: new Date("2025-04-01"),
          billing_cycle: "monthly",
          last_payment: new Date(),
          next_payment: new Date("2024-04-01"),
          payment_status: "pending",
          usage_overage: 0,
          geographic_focus: ["Kenya", "Tanzania"],
        },
      ];

      // Filter by plan if selected
      let filteredPartners = mockPartners;
      if (selectedPlan !== "all") {
        filteredPartners = mockPartners.filter((p) => p.plan === selectedPlan);
      }

      setPartners(filteredPartners);

      // Mock billing metrics
      setMetrics({
        total_partner_revenue: mockPartners.reduce(
          (sum, p) => sum + p.monthly_revenue,
          0,
        ),
        growth_rate: 28.5,
        average_contract_value: 32400,
        churn_rate: 2.1,
        overdue_amount: 2120,
        upcoming_renewals: 3,
      });
    } catch (error) {
      console.error("Failed to load partner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "guardian":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "diaspora_vault":
        return <Globe className="w-4 h-4 text-purple-500" />;
      case "regen_banking":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Building2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "guardian":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "diaspora_vault":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "regen_banking":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "humanitarian":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "government":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ngo":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "enterprise":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      {/* Partner Billing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Partner Revenue
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.total_partner_revenue)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    +{metrics.growth_rate}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Contract Value
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.average_contract_value)}
                </p>
                <p className="text-sm text-muted-foreground">Annual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.overdue_amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    partners.filter((p) => p.payment_status === "overdue")
                      .length
                  }{" "}
                  accounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Upcoming Renewals
                </p>
                <p className="text-2xl font-bold">
                  {metrics.upcoming_renewals}
                </p>
                <p className="text-sm text-muted-foreground">Next 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Plan Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Partner Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage partner billing and contracts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex space-x-2">
                <Button
                  variant={selectedPlan === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlan("all")}
                >
                  All Plans
                </Button>
                <Button
                  variant={selectedPlan === "guardian" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlan("guardian")}
                >
                  Guardian
                </Button>
                <Button
                  variant={
                    selectedPlan === "diaspora_vault" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPlan("diaspora_vault")}
                >
                  Diaspora
                </Button>
                <Button
                  variant={
                    selectedPlan === "regen_banking" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPlan("regen_banking")}
                >
                  Regen Banking
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{partner.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={cn(
                              "text-xs",
                              getTypeColor(partner.type),
                            )}
                          >
                            {partner.type}
                          </Badge>
                          <Badge
                            variant={
                              partner.status === "active"
                                ? "default"
                                : partner.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {partner.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {partner.geographic_focus.join(", ")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn("text-xs", getPlanColor(partner.plan))}
                      >
                        <div className="flex items-center space-x-1">
                          {getPlanIcon(partner.plan)}
                          <span className="capitalize">
                            {partner.plan.replace("_", " ")}
                          </span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {formatCurrency(partner.monthly_revenue)}
                          <span className="text-xs text-muted-foreground">
                            /mo
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(partner.annual_revenue)} annual
                        </p>
                        {partner.usage_overage > 0 && (
                          <p className="text-xs text-orange-600">
                            +{formatCurrency(partner.usage_overage)} overage
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {partner.users_count.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>API Usage</span>
                          <span className="font-medium">
                            {partner.api_usage}%
                          </span>
                        </div>
                        <Progress value={partner.api_usage} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getPaymentStatusIcon(partner.payment_status)}
                          <span className="text-sm font-medium capitalize">
                            {partner.payment_status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Next: {formatDate(partner.next_payment)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {formatDate(partner.contract_start)} -{" "}
                          {formatDate(partner.contract_end)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {partner.billing_cycle} billing
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Call
                          </DropdownMenuItem>
                          {partner.payment_status === "overdue" && (
                            <DropdownMenuItem className="text-red-600">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
