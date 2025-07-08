import { RequestHandler } from "express";
import { RevenueService } from "../services/RevenueService";

// Validation helper
function validateUsageEvent(data: any): boolean {
  return (
    data &&
    typeof data.user_id === "string" &&
    typeof data.event_type === "string" &&
    [
      "vault_activation",
      "trust_minting",
      "ritual_verification",
      "api_call",
      "governance_check",
    ].includes(data.event_type)
  );
}

let revenueService: RevenueService;

// Initialize revenue service
export function initializeRevenueService(service: RevenueService) {
  revenueService = service;
}

/**
 * Record usage event for billing
 */
export const recordUsageEvent: RequestHandler = async (req, res) => {
  try {
    const data = req.body;

    if (!validateUsageEvent(data)) {
      return res.status(400).json({
        success: false,
        error: "Invalid usage event data",
      });
    }

    await revenueService.recordUsageEvent({
      ...data,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Usage event recorded successfully",
    });
  } catch (error) {
    console.error("Failed to record usage event:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid request data",
    });
  }
};

/**
 * Get pricing tiers
 */
export const getPricingTiers: RequestHandler = (req, res) => {
  try {
    const tiers = revenueService.getPricingTiers();
    const { type } = req.query;

    let filteredTiers = tiers;
    if (type) {
      filteredTiers = tiers.filter((tier) => tier.type === type);
    }

    res.json({
      success: true,
      data: filteredTiers,
    });
  } catch (error) {
    console.error("Failed to get pricing tiers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve pricing tiers",
    });
  }
};

/**
 * Get specific pricing tier
 */
export const getPricingTier: RequestHandler = (req, res) => {
  try {
    const { tierId } = req.params;
    const tier = revenueService.getPricingTier(tierId);

    if (!tier) {
      return res.status(404).json({
        success: false,
        error: "Pricing tier not found",
      });
    }

    res.json({
      success: true,
      data: tier,
    });
  } catch (error) {
    console.error("Failed to get pricing tier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve pricing tier",
    });
  }
};

/**
 * Get revenue metrics
 */
export const getRevenueMetrics: RequestHandler = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: "start_date and end_date are required",
      });
    }

    const metrics = await revenueService.generateRevenueMetrics({
      start: new Date(start_date as string),
      end: new Date(end_date as string),
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Failed to get revenue metrics:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid request data",
    });
  }
};

/**
 * Get analytics for revenue dashboard
 */
export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const { time_range = "30d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (time_range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get revenue metrics
    const revenueMetrics = await revenueService.generateRevenueMetrics({
      start: startDate,
      end: now,
    });

    const analytics = {
      revenue_metrics: revenueMetrics,
      usage_analytics: {
        api_calls: 2850000,
        vault_activations: 12450,
        trust_tokens_minted: 8950,
        governance_checks: 5230,
        ritual_verifications: 15680,
        active_users: 2700,
        new_users: 340,
        churn_rate: 2.1,
      },
      partner_metrics: {
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
        ],
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Failed to get analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve analytics data",
    });
  }
};

/**
 * Get RevOps dashboard data
 */
export const getRevOpsData: RequestHandler = async (req, res) => {
  try {
    const { timeRange = "24h" } = req.query;

    // Mock RevOps data for operational dashboard
    const revOpsData = {
      quick_stats: {
        total_users: 12450,
        active_users: 8234,
        total_revenue: 124750.83,
        mrr: 45230.45,
        api_calls_today: 2840593,
        mesh_nodes: 15847,
        vault_activations: 523,
        partner_count: 47,
      },
      system_status: {
        overall: "healthy",
        services: {
          api: "up",
          bluetooth_mesh: "up",
          ai_agents: "degraded",
          database: "up",
          payments: "up",
          revenue_analytics: "up",
        },
        uptime: 99.97,
        response_time: 145,
      },
      alerts: [
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
      ],
      operational_metrics: {
        cpu_usage: 67,
        memory_usage: 82,
        disk_usage: 45,
        network_throughput: 234.5,
        requests_per_minute: 1247,
        error_rate: 0.03,
        database_connections: 145,
        cache_hit_rate: 94.2,
      },
      regional_health: [
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
      ],
    };

    res.json({
      success: true,
      data: revOpsData,
    });
  } catch (error) {
    console.error("RevOps data error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch RevOps data",
    });
  }
};
