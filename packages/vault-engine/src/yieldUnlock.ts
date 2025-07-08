import { EventEmitter } from "events";

export interface YieldConfig {
  enabled: boolean;
  baseRate: number; // Annual percentage rate
  compoundFrequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  distributionMethod: "equal" | "weighted" | "needs_based" | "performance";
  lockupPeriod?: number; // Days before yield can be withdrawn
  maxYieldRatio?: number; // Maximum yield as ratio of principal
  yieldSources: YieldSource[];
  conditions: YieldCondition[];
}

export interface YieldSource {
  id: string;
  name: string;
  type:
    | "staking"
    | "liquidity_provision"
    | "lending"
    | "community_contribution"
    | "regenerative_activity"
    | "cultural_preservation";
  rate: number;
  weight: number; // 0-1, how much this source contributes
  minimumContribution?: number;
  requirements?: string[];
}

export interface YieldCondition {
  id: string;
  type:
    | "ritual_completion"
    | "community_consensus"
    | "geographic_presence"
    | "contribution_threshold"
    | "time_based"
    | "performance_metric";
  description: string;
  required: boolean;
  parameters: Record<string, any>;
  status: "pending" | "satisfied" | "failed";
  lastEvaluated?: Date;
}

export interface YieldCalculation {
  principal: number;
  accruedYield: number;
  projectedYield: number;
  effectiveRate: number;
  compoundPeriods: number;
  nextDistribution: Date;
  breakdown: YieldBreakdown[];
}

export interface YieldBreakdown {
  sourceId: string;
  sourceName: string;
  contribution: number;
  rate: number;
  weight: number;
}

export interface YieldDistribution {
  id: string;
  vaultId: string;
  totalAmount: number;
  distributionDate: Date;
  method: YieldConfig["distributionMethod"];
  recipients: YieldRecipient[];
  conditions: YieldCondition[];
  status: "pending" | "distributed" | "failed";
}

export interface YieldRecipient {
  participantId: string;
  amount: number;
  percentage: number;
  reason: string;
  conditions?: YieldCondition[];
}

export interface RegenerativeYield {
  type:
    | "carbon_sequestration"
    | "biodiversity_conservation"
    | "community_development"
    | "cultural_preservation"
    | "education_support";
  impactMetrics: Record<string, number>;
  verificationSource: string;
  yieldMultiplier: number; // Bonus multiplier for positive impact
}

export class YieldEngine extends EventEmitter {
  private yieldCalculations = new Map<string, YieldCalculation>();
  private distributionHistory = new Map<string, YieldDistribution[]>();
  private conditionCheckers = new Map<string, Function>();

  constructor() {
    super();
    this.setupDefaultConditionCheckers();
  }

  async calculateYield(
    vaultId: string,
    principal: number,
    config: YieldConfig,
    timeElapsed: number, // in days
  ): Promise<YieldCalculation> {
    if (!config.enabled || principal <= 0) {
      return this.createEmptyCalculation(principal);
    }

    // Check yield conditions
    const satisfiedConditions = await this.evaluateYieldConditions(
      vaultId,
      config.conditions,
    );

    if (!this.areRequiredConditionsSatisfied(satisfiedConditions)) {
      return this.createEmptyCalculation(principal);
    }

    // Calculate base yield
    const baseYield = this.calculateBaseYield(
      principal,
      config.baseRate,
      timeElapsed,
      config.compoundFrequency,
    );

    // Apply yield source multipliers
    const sourceMultiplier = await this.calculateSourceMultiplier(
      vaultId,
      config.yieldSources,
    );

    // Apply regenerative bonuses
    const regenerativeBonus = await this.calculateRegenerativeBonus(vaultId);

    // Calculate effective yield
    const effectiveYield = baseYield * sourceMultiplier * regenerativeBonus;

    // Apply yield cap if configured
    const cappedYield = config.maxYieldRatio
      ? Math.min(effectiveYield, principal * config.maxYieldRatio)
      : effectiveYield;

    const calculation: YieldCalculation = {
      principal,
      accruedYield: cappedYield,
      projectedYield: this.projectFutureYield(principal, config, 365), // 1 year projection
      effectiveRate: (cappedYield / principal) * (365 / timeElapsed),
      compoundPeriods: this.calculateCompoundPeriods(
        timeElapsed,
        config.compoundFrequency,
      ),
      nextDistribution: this.calculateNextDistribution(config),
      breakdown: this.createYieldBreakdown(config.yieldSources, cappedYield),
    };

    this.yieldCalculations.set(vaultId, calculation);
    this.emit("yieldCalculated", { vaultId, calculation });

    return calculation;
  }

  async distributeYield(
    vaultId: string,
    participants: string[],
    config: YieldConfig,
    calculation: YieldCalculation,
  ): Promise<YieldDistribution> {
    const distributionId = `dist_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Calculate individual distributions based on method
    const recipients = await this.calculateRecipientDistributions(
      vaultId,
      participants,
      calculation.accruedYield,
      config.distributionMethod,
    );

    // Verify distribution conditions
    const conditionsToCheck = config.conditions.filter((c) => c.required);
    const verifiedConditions = await this.evaluateYieldConditions(
      vaultId,
      conditionsToCheck,
    );

    const distribution: YieldDistribution = {
      id: distributionId,
      vaultId,
      totalAmount: calculation.accruedYield,
      distributionDate: new Date(),
      method: config.distributionMethod,
      recipients,
      conditions: verifiedConditions,
      status: this.areRequiredConditionsSatisfied(verifiedConditions)
        ? "distributed"
        : "pending",
    };

    // Store distribution
    const history = this.distributionHistory.get(vaultId) || [];
    history.push(distribution);
    this.distributionHistory.set(vaultId, history);

    this.emit("yieldDistributed", distribution);

    return distribution;
  }

  async createRitualYieldCondition(
    vaultId: string,
    ritualId: string,
    description: string,
    required: boolean = true,
  ): Promise<YieldCondition> {
    return {
      id: `ritual_${ritualId}`,
      type: "ritual_completion",
      description,
      required,
      parameters: {
        ritualId,
        requiredParticipants: 1,
        verificationMethod: "ai_analysis",
      },
      status: "pending",
    };
  }

  async createCommunityConsensusCondition(
    vaultId: string,
    threshold: number,
    description: string,
  ): Promise<YieldCondition> {
    return {
      id: `consensus_${Date.now()}`,
      type: "community_consensus",
      description,
      required: true,
      parameters: {
        threshold, // percentage of participants who must agree
        votingWindow: 86400000, // 24 hours in milliseconds
        quorumRequired: true,
      },
      status: "pending",
    };
  }

  async createRegenerativeYieldSource(
    type: RegenerativeYield["type"],
    impactMetrics: Record<string, number>,
    verificationSource: string,
  ): Promise<YieldSource> {
    // Calculate yield rate based on impact metrics
    const baseRate = 0.05; // 5% base rate
    const impactMultiplier = this.calculateImpactMultiplier(impactMetrics);

    return {
      id: `regen_${type}_${Date.now()}`,
      name: `Regenerative ${type.replace("_", " ")}`,
      type: "regenerative_activity",
      rate: baseRate * impactMultiplier,
      weight: 0.3, // 30% weight for regenerative activities
      requirements: [
        "verified_impact",
        "community_validation",
        "measurement_protocol",
      ],
    };
  }

  private calculateBaseYield(
    principal: number,
    annualRate: number,
    days: number,
    frequency: YieldConfig["compoundFrequency"],
  ): number {
    const periodsPerYear = this.getPeriodsPerYear(frequency);
    const ratePerPeriod = annualRate / periodsPerYear;
    const periods = (days / 365) * periodsPerYear;

    // Compound interest formula: A = P(1 + r/n)^(nt) - P
    return principal * Math.pow(1 + ratePerPeriod, periods) - principal;
  }

  private getPeriodsPerYear(
    frequency: YieldConfig["compoundFrequency"],
  ): number {
    switch (frequency) {
      case "daily":
        return 365;
      case "weekly":
        return 52;
      case "monthly":
        return 12;
      case "quarterly":
        return 4;
      case "annually":
        return 1;
      default:
        return 12;
    }
  }

  private calculateCompoundPeriods(
    days: number,
    frequency: YieldConfig["compoundFrequency"],
  ): number {
    const periodsPerYear = this.getPeriodsPerYear(frequency);
    return Math.floor((days / 365) * periodsPerYear);
  }

  private async calculateSourceMultiplier(
    vaultId: string,
    sources: YieldSource[],
  ): Promise<number> {
    let totalMultiplier = 1.0;

    for (const source of sources) {
      const sourceActive = await this.isYieldSourceActive(vaultId, source);

      if (sourceActive) {
        const sourceContribution = source.rate * source.weight;
        totalMultiplier += sourceContribution;
      }
    }

    return totalMultiplier;
  }

  private async isYieldSourceActive(
    vaultId: string,
    source: YieldSource,
  ): Promise<boolean> {
    // Mock implementation - in production, check actual conditions
    switch (source.type) {
      case "community_contribution":
        return Math.random() > 0.3; // 70% chance active

      case "regenerative_activity":
        return Math.random() > 0.5; // 50% chance active

      case "cultural_preservation":
        return Math.random() > 0.4; // 60% chance active

      default:
        return true; // Other sources always active
    }
  }

  private async calculateRegenerativeBonus(vaultId: string): Promise<number> {
    // Mock regenerative impact calculation
    const impacts = await this.getRegenerativeImpacts(vaultId);

    let bonus = 1.0;
    for (const impact of impacts) {
      bonus += impact.yieldMultiplier * 0.1; // 10% bonus per impact type
    }

    return Math.min(2.0, bonus); // Cap at 100% bonus
  }

  private async getRegenerativeImpacts(
    vaultId: string,
  ): Promise<RegenerativeYield[]> {
    // Mock implementation - return some sample impacts
    return [
      {
        type: "carbon_sequestration",
        impactMetrics: { tons_co2: 5.2 },
        verificationSource: "carbon_registry",
        yieldMultiplier: 1.2,
      },
      {
        type: "community_development",
        impactMetrics: { beneficiaries: 150 },
        verificationSource: "community_validator",
        yieldMultiplier: 1.1,
      },
    ];
  }

  private calculateImpactMultiplier(metrics: Record<string, number>): number {
    // Calculate multiplier based on impact metrics
    let multiplier = 1.0;

    Object.entries(metrics).forEach(([metric, value]) => {
      switch (metric) {
        case "tons_co2":
          multiplier += Math.min(0.5, value * 0.1); // Up to 50% bonus for carbon
          break;
        case "beneficiaries":
          multiplier += Math.min(0.3, value * 0.002); // Up to 30% bonus for beneficiaries
          break;
        case "biodiversity_score":
          multiplier += Math.min(0.4, value * 0.05); // Up to 40% bonus for biodiversity
          break;
      }
    });

    return multiplier;
  }

  private projectFutureYield(
    principal: number,
    config: YieldConfig,
    days: number,
  ): number {
    // Project yield for specified number of days
    return this.calculateBaseYield(
      principal,
      config.baseRate,
      days,
      config.compoundFrequency,
    );
  }

  private calculateNextDistribution(config: YieldConfig): Date {
    const now = new Date();
    const periods = this.getPeriodsPerYear(config.compoundFrequency);
    const daysUntilNext = 365 / periods;

    return new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
  }

  private createYieldBreakdown(
    sources: YieldSource[],
    totalYield: number,
  ): YieldBreakdown[] {
    return sources.map((source) => ({
      sourceId: source.id,
      sourceName: source.name,
      contribution: totalYield * source.weight,
      rate: source.rate,
      weight: source.weight,
    }));
  }

  private async calculateRecipientDistributions(
    vaultId: string,
    participants: string[],
    totalYield: number,
    method: YieldConfig["distributionMethod"],
  ): Promise<YieldRecipient[]> {
    switch (method) {
      case "equal":
        return this.distributeEqually(participants, totalYield);

      case "weighted":
        return await this.distributeWeighted(vaultId, participants, totalYield);

      case "needs_based":
        return await this.distributeNeedsBased(
          vaultId,
          participants,
          totalYield,
        );

      case "performance":
        return await this.distributePerformanceBased(
          vaultId,
          participants,
          totalYield,
        );

      default:
        return this.distributeEqually(participants, totalYield);
    }
  }

  private distributeEqually(
    participants: string[],
    totalYield: number,
  ): YieldRecipient[] {
    const amountPerParticipant = totalYield / participants.length;
    const percentage = 100 / participants.length;

    return participants.map((id) => ({
      participantId: id,
      amount: amountPerParticipant,
      percentage,
      reason: "Equal distribution",
    }));
  }

  private async distributeWeighted(
    vaultId: string,
    participants: string[],
    totalYield: number,
  ): Promise<YieldRecipient[]> {
    // Mock weighted distribution based on contribution/stake
    const weights = await this.getParticipantWeights(vaultId, participants);
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

    return participants.map((id, index) => {
      const weight = weights[index]?.weight || 1;
      const percentage = (weight / totalWeight) * 100;
      const amount = (weight / totalWeight) * totalYield;

      return {
        participantId: id,
        amount,
        percentage,
        reason: `Weighted by contribution (${weight.toFixed(1)} weight)`,
      };
    });
  }

  private async distributeNeedsBased(
    vaultId: string,
    participants: string[],
    totalYield: number,
  ): Promise<YieldRecipient[]> {
    // Mock needs-based distribution
    const needsScores = await this.getNeedsScores(vaultId, participants);
    const totalNeed = needsScores.reduce((sum, s) => sum + s.score, 0);

    return participants.map((id, index) => {
      const needScore = needsScores[index]?.score || 1;
      const percentage = (needScore / totalNeed) * 100;
      const amount = (needScore / totalNeed) * totalYield;

      return {
        participantId: id,
        amount,
        percentage,
        reason: `Needs-based allocation (${needScore.toFixed(1)} need score)`,
      };
    });
  }

  private async distributePerformanceBased(
    vaultId: string,
    participants: string[],
    totalYield: number,
  ): Promise<YieldRecipient[]> {
    // Mock performance-based distribution
    const performanceScores = await this.getPerformanceScores(
      vaultId,
      participants,
    );
    const totalPerformance = performanceScores.reduce(
      (sum, s) => sum + s.score,
      0,
    );

    return participants.map((id, index) => {
      const performance = performanceScores[index]?.score || 1;
      const percentage = (performance / totalPerformance) * 100;
      const amount = (performance / totalPerformance) * totalYield;

      return {
        participantId: id,
        amount,
        percentage,
        reason: `Performance-based (${performance.toFixed(1)} score)`,
      };
    });
  }

  private async getParticipantWeights(
    vaultId: string,
    participants: string[],
  ): Promise<Array<{ participantId: string; weight: number }>> {
    // Mock implementation
    return participants.map((id) => ({
      participantId: id,
      weight: Math.random() * 5 + 1, // Random weight between 1-6
    }));
  }

  private async getNeedsScores(
    vaultId: string,
    participants: string[],
  ): Promise<Array<{ participantId: string; score: number }>> {
    // Mock implementation
    return participants.map((id) => ({
      participantId: id,
      score: Math.random() * 10 + 1, // Random need score 1-11
    }));
  }

  private async getPerformanceScores(
    vaultId: string,
    participants: string[],
  ): Promise<Array<{ participantId: string; score: number }>> {
    // Mock implementation
    return participants.map((id) => ({
      participantId: id,
      score: Math.random() * 100, // Random performance score 0-100
    }));
  }

  private async evaluateYieldConditions(
    vaultId: string,
    conditions: YieldCondition[],
  ): Promise<YieldCondition[]> {
    const evaluated: YieldCondition[] = [];

    for (const condition of conditions) {
      const checker = this.conditionCheckers.get(condition.type);

      if (checker) {
        const status = await checker(vaultId, condition);
        evaluated.push({
          ...condition,
          status,
          lastEvaluated: new Date(),
        });
      } else {
        evaluated.push({
          ...condition,
          status: "failed",
          lastEvaluated: new Date(),
        });
      }
    }

    return evaluated;
  }

  private areRequiredConditionsSatisfied(
    conditions: YieldCondition[],
  ): boolean {
    return conditions
      .filter((c) => c.required)
      .every((c) => c.status === "satisfied");
  }

  private setupDefaultConditionCheckers(): void {
    this.conditionCheckers.set(
      "ritual_completion",
      async (vaultId, condition) => {
        // Mock ritual completion check
        return Math.random() > 0.3 ? "satisfied" : "pending";
      },
    );

    this.conditionCheckers.set(
      "community_consensus",
      async (vaultId, condition) => {
        // Mock consensus check
        return Math.random() > 0.2 ? "satisfied" : "pending";
      },
    );

    this.conditionCheckers.set(
      "geographic_presence",
      async (vaultId, condition) => {
        // Mock geographic check
        return Math.random() > 0.4 ? "satisfied" : "failed";
      },
    );

    this.conditionCheckers.set("time_based", async (vaultId, condition) => {
      // Mock time-based check
      return "satisfied";
    });
  }

  private createEmptyCalculation(principal: number): YieldCalculation {
    return {
      principal,
      accruedYield: 0,
      projectedYield: 0,
      effectiveRate: 0,
      compoundPeriods: 0,
      nextDistribution: new Date(),
      breakdown: [],
    };
  }

  // Public query methods
  getYieldCalculation(vaultId: string): YieldCalculation | undefined {
    return this.yieldCalculations.get(vaultId);
  }

  getDistributionHistory(vaultId: string): YieldDistribution[] {
    return this.distributionHistory.get(vaultId) || [];
  }

  getTotalYieldDistributed(vaultId: string): number {
    const history = this.getDistributionHistory(vaultId);
    return history
      .filter((d) => d.status === "distributed")
      .reduce((sum, d) => sum + d.totalAmount, 0);
  }

  addCustomConditionChecker(
    conditionType: string,
    checker: (
      vaultId: string,
      condition: YieldCondition,
    ) => Promise<YieldCondition["status"]>,
  ): void {
    this.conditionCheckers.set(conditionType, checker);
  }
}

// Utility functions
export function createBasicYieldConfig(
  rate: number,
  frequency: YieldConfig["compoundFrequency"] = "monthly",
): YieldConfig {
  return {
    enabled: true,
    baseRate: rate,
    compoundFrequency: frequency,
    distributionMethod: "equal",
    yieldSources: [
      {
        id: "base_staking",
        name: "Base Staking",
        type: "staking",
        rate,
        weight: 1.0,
      },
    ],
    conditions: [],
  };
}

export function createCommunityYieldConfig(
  baseRate: number,
  consensusThreshold: number = 0.6,
): YieldConfig {
  return {
    enabled: true,
    baseRate,
    compoundFrequency: "monthly",
    distributionMethod: "weighted",
    lockupPeriod: 7, // 7 days
    yieldSources: [
      {
        id: "community_contribution",
        name: "Community Contribution",
        type: "community_contribution",
        rate: baseRate,
        weight: 0.7,
      },
      {
        id: "cultural_preservation",
        name: "Cultural Preservation",
        type: "cultural_preservation",
        rate: baseRate * 0.5,
        weight: 0.3,
      },
    ],
    conditions: [
      {
        id: "community_consensus",
        type: "community_consensus",
        description: "Community must reach consensus for yield distribution",
        required: true,
        parameters: { threshold: consensusThreshold },
        status: "pending",
      },
    ],
  };
}
