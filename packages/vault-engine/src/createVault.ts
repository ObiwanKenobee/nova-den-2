import { randomBytes } from "crypto";
import { generateVaultDNA } from "./vaultDNA";
import { encryptVault } from "./encryptVault";

export interface VaultConfig {
  name: string;
  description?: string;
  vaultType:
    | "personal"
    | "family"
    | "community"
    | "ritual"
    | "diaspora"
    | "cooperative";
  initialBalance?: number;
  currency?: string;
  participants?: string[];
  unlockConditions?: UnlockCondition[];
  yieldConfiguration?: YieldConfig;
  governance?: GovernanceConfig;
  ritualRequirements?: RitualRequirement[];
  geographicRestrictions?: GeographicRestriction[];
  emergencyContacts?: EmergencyContact[];
}

export interface UnlockCondition {
  type:
    | "biometric"
    | "ritual"
    | "consensus"
    | "proximity"
    | "temporal"
    | "emergency";
  required: boolean;
  parameters: Record<string, any>;
  weight: number; // 0-1, for weighted consensus
}

export interface YieldConfig {
  enabled: boolean;
  rate: number; // Annual percentage rate
  compound: boolean;
  distributionMethod: "equal" | "weighted" | "needs_based";
  harvestSchedule?: "daily" | "weekly" | "monthly" | "seasonal";
}

export interface GovernanceConfig {
  votingThreshold: number; // Percentage required for decisions
  quorumSize: number; // Minimum participants for valid vote
  decisionTypes: {
    spending: number; // Threshold for spending decisions
    membership: number; // Threshold for adding/removing members
    emergency: number; // Threshold for emergency actions
  };
  elderOverride: boolean; // Allow elder consensus to override normal voting
}

export interface RitualRequirement {
  id: string;
  name: string;
  type: "voice" | "gesture" | "proximity" | "consensus" | "story" | "object";
  description: string;
  culturalContext?: string;
  verificationMethod:
    | "ai_analysis"
    | "elder_confirmation"
    | "community_witness";
  required: boolean;
  frequency?: "once" | "daily" | "weekly" | "monthly" | "per_transaction";
}

export interface GeographicRestriction {
  type: "include" | "exclude";
  regions: string[];
  radius?: number; // in kilometers
  coordinates?: { lat: number; lng: number };
  reason?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  contactMethod: "bluetooth" | "phone" | "mesh" | "physical";
  contactInfo: string;
  permissions: string[]; // 'view', 'unlock', 'transfer', 'destroy'
}

export interface VaultMetadata {
  id: string;
  name: string;
  description?: string;
  type: VaultConfig["vaultType"];
  created: Date;
  lastModified: Date;
  version: number;
  creator: string;
  participants: string[];
  status: "active" | "locked" | "suspended" | "archived";
  tags: string[];
}

export interface VaultShard {
  id: string;
  vaultId: string;
  shardIndex: number;
  totalShards: number;
  encryptedData: Buffer;
  checksum: string;
  guardianId?: string; // Assigned guardian for this shard
  backupLocations: string[]; // Mesh nodes storing backups
}

export interface Vault {
  metadata: VaultMetadata;
  config: VaultConfig;
  dna: string; // Genomic fingerprint
  shards: VaultShard[];
  state: VaultState;
  encryption: VaultEncryption;
}

export interface VaultState {
  balance: number;
  currency: string;
  lastTransaction: Date;
  transactionCount: number;
  yieldAccrued: number;
  unlockAttempts: number;
  lastUnlockAttempt?: Date;
  emergencyMode: boolean;
  suspendedUntil?: Date;
}

export interface VaultEncryption {
  algorithm: string;
  keyDerivation: string;
  shardingMethod: string;
  redundancy: number;
  integrityCheck: string;
}

export class VaultEngine {
  private defaultShardCount = 5;
  private defaultRedundancy = 2;

  async createVault(config: VaultConfig, creatorId: string): Promise<Vault> {
    // Generate unique vault ID
    const vaultId = this.generateVaultId();

    // Create metadata
    const metadata: VaultMetadata = {
      id: vaultId,
      name: config.name,
      description: config.description,
      type: config.vaultType,
      created: new Date(),
      lastModified: new Date(),
      version: 1,
      creator: creatorId,
      participants: [creatorId, ...(config.participants || [])],
      status: "active",
      tags: this.generateTags(config),
    };

    // Generate VaultDNA - genomic fingerprint based on behavior and memory
    const dna = await generateVaultDNA({
      vaultId,
      creatorId,
      vaultType: config.vaultType,
      participants: metadata.participants,
      unlockConditions: config.unlockConditions || [],
      ritualRequirements: config.ritualRequirements || [],
      geographicContext: config.geographicRestrictions || [],
    });

    // Initialize vault state
    const state: VaultState = {
      balance: config.initialBalance || 0,
      currency: config.currency || "VT",
      lastTransaction: new Date(),
      transactionCount: 0,
      yieldAccrued: 0,
      unlockAttempts: 0,
      emergencyMode: false,
    };

    // Create vault data for sharding
    const vaultData = this.serializeVaultData(metadata, config, state);

    // Create shards
    const shards = await this.createVaultShards(vaultId, vaultData);

    // Setup encryption parameters
    const encryption: VaultEncryption = {
      algorithm: "AES-256-GCM",
      keyDerivation: "PBKDF2-SHA256",
      shardingMethod: "Shamir-Secret-Sharing",
      redundancy: this.defaultRedundancy,
      integrityCheck: "SHA-256",
    };

    const vault: Vault = {
      metadata,
      config,
      dna,
      shards,
      state,
      encryption,
    };

    return vault;
  }

  async createCommunityVault(
    config: Omit<VaultConfig, "vaultType">,
    founders: string[],
    governance: GovernanceConfig,
  ): Promise<Vault> {
    const communityConfig: VaultConfig = {
      ...config,
      vaultType: "community",
      participants: founders,
      governance,
    };

    // Use first founder as creator, but all are participants
    const vault = await this.createVault(communityConfig, founders[0]);

    // Add community-specific DNA markers
    vault.dna = await this.enhanceWithCommunityDNA(
      vault.dna,
      founders,
      governance,
    );

    return vault;
  }

  async createRitualVault(
    config: Omit<VaultConfig, "vaultType">,
    creatorId: string,
    rituals: RitualRequirement[],
  ): Promise<Vault> {
    const ritualConfig: VaultConfig = {
      ...config,
      vaultType: "ritual",
      ritualRequirements: rituals,
      unlockConditions: [
        {
          type: "ritual",
          required: true,
          parameters: {
            requiredRituals: rituals.filter((r) => r.required).map((r) => r.id),
          },
          weight: 1.0,
        },
      ],
    };

    const vault = await this.createVault(ritualConfig, creatorId);

    // Add ritual-specific DNA markers
    vault.dna = await this.enhanceWithRitualDNA(vault.dna, rituals);

    return vault;
  }

  async createDiasporaVault(
    config: Omit<VaultConfig, "vaultType">,
    familyMembers: string[],
    homeRegion: GeographicRestriction,
  ): Promise<Vault> {
    const diasporaConfig: VaultConfig = {
      ...config,
      vaultType: "diaspora",
      participants: familyMembers,
      geographicRestrictions: [homeRegion],
      unlockConditions: [
        {
          type: "consensus",
          required: true,
          parameters: {
            requiredParticipants: Math.ceil(familyMembers.length * 0.6),
            timeWindow: 86400, // 24 hours
          },
          weight: 0.7,
        },
        {
          type: "proximity",
          required: false,
          parameters: {
            region: homeRegion.regions[0],
            radius: homeRegion.radius || 50,
          },
          weight: 0.3,
        },
      ],
    };

    const vault = await this.createVault(diasporaConfig, familyMembers[0]);

    // Add diaspora-specific DNA markers
    vault.dna = await this.enhanceWithDiasporaDNA(
      vault.dna,
      familyMembers,
      homeRegion,
    );

    return vault;
  }

  private generateVaultId(): string {
    return `vault_${Date.now()}_${randomBytes(8).toString("hex")}`;
  }

  private generateTags(config: VaultConfig): string[] {
    const tags = [config.vaultType];

    if (config.yieldConfiguration?.enabled) {
      tags.push("yield-bearing");
    }

    if (config.ritualRequirements?.length) {
      tags.push("ritual-protected");
    }

    if (config.governance) {
      tags.push("governed");
    }

    if (config.participants && config.participants.length > 1) {
      tags.push("multi-party");
    }

    return tags;
  }

  private serializeVaultData(
    metadata: VaultMetadata,
    config: VaultConfig,
    state: VaultState,
  ): Buffer {
    const vaultObject = {
      metadata,
      config,
      state,
      timestamp: new Date().toISOString(),
    };

    return Buffer.from(JSON.stringify(vaultObject), "utf-8");
  }

  private async createVaultShards(
    vaultId: string,
    data: Buffer,
  ): Promise<VaultShard[]> {
    const shards: VaultShard[] = [];
    const shardSize = Math.ceil(data.length / this.defaultShardCount);

    for (let i = 0; i < this.defaultShardCount; i++) {
      const start = i * shardSize;
      const end = Math.min(start + shardSize, data.length);
      const shardData = data.slice(start, end);

      // Encrypt shard
      const encryptedData = await encryptVault(
        shardData,
        `${vaultId}_shard_${i}`,
      );

      const shard: VaultShard = {
        id: `${vaultId}_shard_${i}`,
        vaultId,
        shardIndex: i,
        totalShards: this.defaultShardCount,
        encryptedData,
        checksum: this.calculateChecksum(encryptedData),
        backupLocations: [],
      };

      shards.push(shard);
    }

    return shards;
  }

  private calculateChecksum(data: Buffer): string {
    const { sha256 } = require("@noble/hashes/sha256");
    return Buffer.from(sha256(data)).toString("hex");
  }

  private async enhanceWithCommunityDNA(
    baseDNA: string,
    founders: string[],
    governance: GovernanceConfig,
  ): Promise<string> {
    // Add community governance patterns to DNA
    const communityMarkers = {
      founderCount: founders.length,
      votingThreshold: governance.votingThreshold,
      elderOverride: governance.elderOverride,
      decisionComplexity: Object.keys(governance.decisionTypes).length,
    };

    return `${baseDNA}_community_${Buffer.from(JSON.stringify(communityMarkers)).toString("hex").slice(0, 16)}`;
  }

  private async enhanceWithRitualDNA(
    baseDNA: string,
    rituals: RitualRequirement[],
  ): Promise<string> {
    // Add ritual complexity patterns to DNA
    const ritualMarkers = {
      ritualCount: rituals.length,
      requiredRituals: rituals.filter((r) => r.required).length,
      culturalContexts: [
        ...new Set(rituals.map((r) => r.culturalContext).filter(Boolean)),
      ].length,
      verificationMethods: [
        ...new Set(rituals.map((r) => r.verificationMethod)),
      ].length,
    };

    return `${baseDNA}_ritual_${Buffer.from(JSON.stringify(ritualMarkers)).toString("hex").slice(0, 16)}`;
  }

  private async enhanceWithDiasporaDNA(
    baseDNA: string,
    family: string[],
    homeRegion: GeographicRestriction,
  ): Promise<string> {
    // Add diaspora family patterns to DNA
    const diasporaMarkers = {
      familySize: family.length,
      homeRegion: homeRegion.regions[0],
      hasRadius: !!homeRegion.radius,
      hasCoordinates: !!homeRegion.coordinates,
    };

    return `${baseDNA}_diaspora_${Buffer.from(JSON.stringify(diasporaMarkers)).toString("hex").slice(0, 16)}`;
  }

  // Vault analysis methods
  analyzeVaultGenome(vault: Vault): VaultGenomeAnalysis {
    return {
      dna: vault.dna,
      type: vault.config.vaultType,
      complexity: this.calculateComplexity(vault),
      securityScore: this.calculateSecurityScore(vault),
      resilience: this.calculateResilience(vault),
      adaptability: this.calculateAdaptability(vault),
      patterns: this.extractBehaviorPatterns(vault),
    };
  }

  private calculateComplexity(vault: Vault): number {
    let score = 0;

    // Base complexity by type
    const typeComplexity = {
      personal: 1,
      family: 2,
      community: 4,
      ritual: 3,
      diaspora: 3,
      cooperative: 5,
    };

    score += typeComplexity[vault.config.vaultType] || 1;

    // Add complexity from unlock conditions
    score += (vault.config.unlockConditions?.length || 0) * 0.5;

    // Add complexity from rituals
    score += (vault.config.ritualRequirements?.length || 0) * 0.3;

    // Add complexity from governance
    if (vault.config.governance) {
      score += 2;
    }

    return Math.min(10, score);
  }

  private calculateSecurityScore(vault: Vault): number {
    let score = 5; // Base score

    // Encryption strength
    score += vault.shards.length > 3 ? 2 : 1;

    // Multi-factor unlock conditions
    const conditions = vault.config.unlockConditions || [];
    score += Math.min(3, conditions.filter((c) => c.required).length);

    // Ritual requirements
    if (vault.config.ritualRequirements?.length) {
      score += 1;
    }

    // Emergency contacts
    if (vault.config.emergencyContacts?.length) {
      score += 1;
    }

    return Math.min(10, score);
  }

  private calculateResilience(vault: Vault): number {
    let score = 5; // Base score

    // Shard distribution
    score += vault.shards.length >= 5 ? 2 : 1;

    // Backup locations
    const totalBackups = vault.shards.reduce(
      (sum, shard) => sum + shard.backupLocations.length,
      0,
    );
    score += Math.min(2, totalBackups / vault.shards.length);

    // Geographic distribution
    if (vault.config.geographicRestrictions?.length) {
      score += 1;
    }

    // Participant diversity
    const participants = vault.metadata.participants.length;
    score += participants > 5 ? 2 : participants > 1 ? 1 : 0;

    return Math.min(10, score);
  }

  private calculateAdaptability(vault: Vault): number {
    let score = 5; // Base score

    // Governance structure allows changes
    if (vault.config.governance) {
      score += 2;
    }

    // Yield configuration allows optimization
    if (vault.config.yieldConfiguration?.enabled) {
      score += 1;
    }

    // Multiple unlock conditions provide flexibility
    const conditions = vault.config.unlockConditions || [];
    score += Math.min(2, conditions.filter((c) => !c.required).length);

    return Math.min(10, score);
  }

  private extractBehaviorPatterns(vault: Vault): string[] {
    const patterns: string[] = [];

    // Transaction frequency patterns would be analyzed from vault.state
    if (vault.state.transactionCount > 100) {
      patterns.push("high-activity");
    } else if (vault.state.transactionCount < 10) {
      patterns.push("low-activity");
    }

    // Yield patterns
    if (vault.config.yieldConfiguration?.enabled) {
      patterns.push("yield-optimized");
    }

    // Security patterns
    if (vault.config.unlockConditions?.some((c) => c.type === "biometric")) {
      patterns.push("biometric-secured");
    }

    if (vault.config.ritualRequirements?.length) {
      patterns.push("ritual-bound");
    }

    return patterns;
  }
}

export interface VaultGenomeAnalysis {
  dna: string;
  type: VaultConfig["vaultType"];
  complexity: number; // 1-10
  securityScore: number; // 1-10
  resilience: number; // 1-10
  adaptability: number; // 1-10
  patterns: string[];
}

// Utility functions
export function validateVaultConfig(config: VaultConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.name || config.name.length < 3) {
    errors.push("Vault name must be at least 3 characters");
  }

  if (config.initialBalance && config.initialBalance < 0) {
    errors.push("Initial balance cannot be negative");
  }

  if (config.participants && config.participants.length === 0) {
    errors.push("At least one participant is required");
  }

  if (config.governance) {
    if (
      config.governance.votingThreshold < 0 ||
      config.governance.votingThreshold > 100
    ) {
      errors.push("Voting threshold must be between 0 and 100");
    }

    if (config.governance.quorumSize < 1) {
      errors.push("Quorum size must be at least 1");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
