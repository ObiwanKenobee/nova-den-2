import { EventEmitter } from "events";

export interface PricingTier {
  id: string;
  name: string;
  type: "user" | "enterprise" | "partner";
  features: string[];
  price_monthly?: number;
  price_per_use?: number;
  currency: string;
  limits: {
    vaults?: number;
    transactions?: number;
    api_calls?: number;
    storage_gb?: number;
  };
}

export interface UsageEvent {
  user_id: string;
  event_type:
    | "vault_activation"
    | "trust_minting"
    | "ritual_verification"
    | "api_call"
    | "governance_check";
  metadata: any;
  amount?: number;
  currency?: string;
  timestamp: Date;
}

export interface RevenueMetrics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  average_revenue_per_user: number;
  user_tier_breakdown: Record<string, number>;
  api_usage_revenue: number;
  vault_activation_revenue: number;
  trust_minting_revenue: number;
  growth_rate: number;
}

export class RevenueService extends EventEmitter {
  private pricingTiers: Map<string, PricingTier> = new Map();

  constructor() {
    super();
    this.initializePricingTiers();
  }

  /**
   * Initialize pricing tiers based on the revenue model
   */
  private initializePricingTiers(): void {
    const tiers: PricingTier[] = [
      // User-facing tiers
      {
        id: "free",
        name: "Free",
        type: "user",
        features: ["Create basic vault", "Local-only transactions"],
        currency: "USD",
        limits: {
          vaults: 1,
          transactions: 10,
        },
      },
      {
        id: "ritual_vault",
        name: "Ritual Vault",
        type: "user",
        features: ["Elder proof required", "AI blessing"],
        price_per_use: 0.1,
        currency: "USD",
        limits: {
          vaults: 3,
          transactions: 100,
        },
      },
      {
        id: "diaspora_unlock",
        name: "Diaspora Unlock",
        type: "user",
        features: ["Verified through sync", "Voice story support"],
        price_per_use: 0.25,
        currency: "USD",
        limits: {
          vaults: 5,
          transactions: 500,
        },
      },
      {
        id: "multi_party_vault",
        name: "Multi-Party Vault",
        type: "user",
        features: ["Family vaults", "Community vaults"],
        price_monthly: 1.0,
        currency: "USD",
        limits: {
          vaults: 10,
          transactions: 1000,
        },
      },

      // Enterprise API tiers
      {
        id: "core_sdk",
        name: "VaultTap Core SDK",
        type: "enterprise",
        features: ["Deploy BLE mesh logic", "Basic API access"],
        price_monthly: 99,
        currency: "USD",
        limits: {
          api_calls: 10000,
          storage_gb: 5,
        },
      },
      {
        id: "ritual_ai_cluster",
        name: "RitualAI Agent Cluster",
        type: "enterprise",
        features: [
          "Claude/GPT agents",
          "Compliance checking",
          "Story analysis",
        ],
        price_monthly: 499,
        currency: "USD",
        limits: {
          api_calls: 50000,
          storage_gb: 25,
        },
      },

      // Premium partner tiers
      {
        id: "guardian_tier",
        name: "Guardian Tier",
        type: "partner",
        features: [
          "Multi-agent orchestration",
          "Mobile bundles",
          "Custom rituals",
        ],
        price_monthly: 2000,
        currency: "USD",
        limits: {
          api_calls: 1000000,
          storage_gb: 100,
        },
      },
    ];

    tiers.forEach((tier) => {
      this.pricingTiers.set(tier.id, tier);
    });

    console.log(`Initialized ${tiers.length} pricing tiers`);
  }

  /**
   * Record a usage event for billing
   */
  async recordUsageEvent(event: UsageEvent): Promise<void> {
    try {
      // Get user's tier and calculate charges
      const userTier = await this.getUserTier(event.user_id);
      const charges = await this.calculateCharges(event, userTier);

      // In a real implementation, this would store to database
      console.log(`Usage event recorded for user ${event.user_id}`, {
        event_type: event.event_type,
        amount: charges.amount,
      });

      this.emit("usageRecorded", { event, charges });
    } catch (error) {
      console.error("Failed to record usage event:", error);
      throw error;
    }
  }

  /**
   * Calculate charges for a usage event
   */
  private async calculateCharges(
    event: UsageEvent,
    userTier: string,
  ): Promise<{ amount: number; currency: string; description: string }> {
    const tier = this.pricingTiers.get(userTier);
    if (!tier) {
      return { amount: 0, currency: "USD", description: "No tier found" };
    }

    let amount = 0;
    let description = "";

    switch (event.event_type) {
      case "vault_activation":
        if (tier.price_per_use) {
          amount = tier.price_per_use;
          description = `Vault activation fee - ${tier.name}`;
        }
        break;

      case "trust_minting":
        amount = 0.05; // Fixed TrustMinting™ fee
        description = "Synthetic trust token minting fee";
        break;

      case "ritual_verification":
        if (userTier === "ritual_vault" || userTier === "diaspora_unlock") {
          amount = tier.price_per_use || 0.1;
          description = `AI Ritual verification - ${tier.name}`;
        }
        break;

      case "api_call":
        // Basic API call fee for enterprise tiers
        if (tier.type === "enterprise" || tier.type === "partner") {
          amount = 0.001; // $0.001 per API call
          description = "API call fee";
        }
        break;

      case "governance_check":
        if (tier.type === "enterprise" || tier.type === "partner") {
          amount = 0.02; // Per governance check for enterprise
          description = "Governance-as-a-Service fee";
        }
        break;
    }

    return {
      amount,
      currency: tier.currency,
      description,
    };
  }

  /**
   * Get user's current tier
   */
  private async getUserTier(userId: string): Promise<string> {
    // In a real implementation, this would query the database
    // For now, return a default tier
    return "diaspora_unlock";
  }

  /**
   * Generate revenue metrics
   */
  async generateRevenueMetrics(period: {
    start: Date;
    end: Date;
  }): Promise<RevenueMetrics> {
    try {
      // Mock data for demonstration
      return {
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
      };
    } catch (error) {
      console.error("Revenue metrics generation failed:", error);
      throw error;
    }
  }

  /**
   * Get all pricing tiers
   */
  getPricingTiers(): PricingTier[] {
    return Array.from(this.pricingTiers.values());
  }

  /**
   * Get pricing tier by ID
   */
  getPricingTier(tierId: string): PricingTier | undefined {
    return this.pricingTiers.get(tierId);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.removeAllListeners();
  }
}
