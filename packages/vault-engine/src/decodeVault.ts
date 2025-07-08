import { decryptVault, VaultEncryption } from "./encryptVault";
import { VaultDNAEngine } from "./vaultDNA";

export interface VaultDecodeContext {
  vaultId: string;
  requesterKey: string;
  authorizationLevel: "view" | "unlock" | "manage" | "emergency";
  ritualProofs?: RitualProof[];
  consensusSignatures?: ConsensusSignature[];
  emergencyOverride?: EmergencyOverride;
}

export interface RitualProof {
  ritualId: string;
  type: "voice" | "gesture" | "proximity" | "object" | "story";
  proof: Buffer;
  timestamp: Date;
  verificationStatus: "pending" | "verified" | "failed";
  culturalContext?: string;
}

export interface ConsensusSignature {
  participantId: string;
  signature: Buffer;
  timestamp: Date;
  voteType: "approve" | "reject";
  weight: number;
}

export interface EmergencyOverride {
  contactId: string;
  overrideCode: string;
  justification: string;
  timestamp: Date;
  verified: boolean;
}

export interface VaultShardInfo {
  shardId: string;
  location: string;
  guardianId?: string;
  health: "available" | "degraded" | "missing";
  lastVerified: Date;
}

export interface DecodeResult {
  success: boolean;
  vault?: any; // Full vault object if successful
  partialData?: any; // Partial data if some shards available
  missingShards: string[];
  errors: string[];
  authorizationLevel: VaultDecodeContext["authorizationLevel"];
  decodeTimestamp: Date;
}

export interface VaultAccess {
  level: "denied" | "view" | "unlock" | "manage" | "emergency";
  permissions: string[];
  restrictions: string[];
  expiresAt?: Date;
}

export class VaultDecoder {
  private encryption: VaultEncryption;
  private dnaEngine: VaultDNAEngine;
  private shardLocations = new Map<string, VaultShardInfo[]>();
  private authorizationCache = new Map<string, VaultAccess>();

  constructor() {
    this.encryption = new VaultEncryption();
    this.dnaEngine = new VaultDNAEngine();
  }

  async decodeVault(
    vaultId: string,
    encryptedShards: Buffer[],
    context: VaultDecodeContext,
  ): Promise<DecodeResult> {
    const result: DecodeResult = {
      success: false,
      missingShards: [],
      errors: [],
      authorizationLevel: context.authorizationLevel,
      decodeTimestamp: new Date(),
    };

    try {
      // Verify authorization
      const access = await this.verifyAccess(vaultId, context);
      if (access.level === "denied") {
        result.errors.push("Access denied");
        return result;
      }

      // Collect and validate shards
      const { validShards, missingShards } = await this.validateShards(
        vaultId,
        encryptedShards,
      );

      result.missingShards = missingShards;

      if (validShards.length === 0) {
        result.errors.push("No valid shards available");
        return result;
      }

      // Attempt reconstruction
      const reconstructed = await this.reconstructVault(validShards, context);

      if (reconstructed.complete) {
        result.success = true;
        result.vault = reconstructed.vault;
      } else {
        result.partialData = reconstructed.partialData;
        result.errors.push("Incomplete vault reconstruction");
      }

      // Apply access level restrictions
      result.vault = this.applyAccessRestrictions(result.vault, access);

      return result;
    } catch (error) {
      result.errors.push(`Decode failed: ${error}`);
      return result;
    }
  }

  async decodeWithRituals(
    vaultId: string,
    encryptedShards: Buffer[],
    ritualProofs: RitualProof[],
    requesterKey: string,
  ): Promise<DecodeResult> {
    // Verify ritual proofs first
    const verifiedRituals = await this.verifyRitualProofs(
      vaultId,
      ritualProofs,
    );

    const context: VaultDecodeContext = {
      vaultId,
      requesterKey,
      authorizationLevel: "unlock",
      ritualProofs: verifiedRituals,
    };

    return await this.decodeVault(vaultId, encryptedShards, context);
  }

  async decodeWithConsensus(
    vaultId: string,
    encryptedShards: Buffer[],
    consensusSignatures: ConsensusSignature[],
    requesterKey: string,
  ): Promise<DecodeResult> {
    // Verify consensus
    const consensusValid = await this.verifyConsensus(
      vaultId,
      consensusSignatures,
    );

    if (!consensusValid) {
      return {
        success: false,
        missingShards: [],
        errors: ["Consensus verification failed"],
        authorizationLevel: "view",
        decodeTimestamp: new Date(),
      };
    }

    const context: VaultDecodeContext = {
      vaultId,
      requesterKey,
      authorizationLevel: "manage",
      consensusSignatures,
    };

    return await this.decodeVault(vaultId, encryptedShards, context);
  }

  async emergencyDecode(
    vaultId: string,
    encryptedShards: Buffer[],
    emergencyOverride: EmergencyOverride,
  ): Promise<DecodeResult> {
    // Verify emergency override
    const overrideValid = await this.verifyEmergencyOverride(
      vaultId,
      emergencyOverride,
    );

    if (!overrideValid) {
      return {
        success: false,
        missingShards: [],
        errors: ["Emergency override verification failed"],
        authorizationLevel: "view",
        decodeTimestamp: new Date(),
      };
    }

    const context: VaultDecodeContext = {
      vaultId,
      requesterKey: emergencyOverride.contactId,
      authorizationLevel: "emergency",
      emergencyOverride,
    };

    return await this.decodeVault(vaultId, encryptedShards, context);
  }

  private async validateShards(
    vaultId: string,
    encryptedShards: Buffer[],
  ): Promise<{
    validShards: Buffer[];
    missingShards: string[];
  }> {
    const validShards: Buffer[] = [];
    const missingShards: string[] = [];

    for (let i = 0; i < encryptedShards.length; i++) {
      const shard = encryptedShards[i];

      if (!shard || shard.length === 0) {
        missingShards.push(`shard_${i}`);
        continue;
      }

      // Verify shard integrity
      const integrity = await this.verifyShardIntegrity(shard);
      if (integrity.valid) {
        validShards.push(shard);
      } else {
        missingShards.push(`shard_${i}_corrupted`);
      }
    }

    return { validShards, missingShards };
  }

  private async verifyShardIntegrity(shard: Buffer): Promise<{
    valid: boolean;
    checksum?: string;
  }> {
    try {
      // Parse shard to get checksum
      const shardData = JSON.parse(shard.toString());
      const expectedChecksum = shardData.checksum;

      if (!expectedChecksum) {
        return { valid: false };
      }

      // Verify checksum
      const actualChecksum = this.calculateChecksum(
        Buffer.from(shardData.encryptedData),
      );

      return {
        valid: actualChecksum === expectedChecksum,
        checksum: actualChecksum,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  private calculateChecksum(data: Buffer): string {
    const { sha256 } = require("@noble/hashes/sha256");
    return Buffer.from(sha256(data)).toString("hex");
  }

  private async reconstructVault(
    validShards: Buffer[],
    context: VaultDecodeContext,
  ): Promise<{
    complete: boolean;
    vault?: any;
    partialData?: any;
  }> {
    // Determine minimum shards needed
    const minShardsNeeded = Math.ceil(validShards.length * 0.6); // 60% threshold

    if (validShards.length < minShardsNeeded) {
      return { complete: false };
    }

    try {
      // Decrypt shards
      const decryptedShards: Buffer[] = [];

      for (const shard of validShards) {
        const decrypted = await this.decryptShard(shard, context);
        decryptedShards.push(decrypted);
      }

      // Reconstruct vault data
      const combinedData = Buffer.concat(decryptedShards);
      const vaultData = JSON.parse(combinedData.toString());

      // Verify vault DNA if present
      if (vaultData.dna) {
        const dnaValid = await this.verifyVaultDNA(vaultData);
        if (!dnaValid) {
          throw new Error("Vault DNA verification failed");
        }
      }

      return {
        complete: true,
        vault: vaultData,
      };
    } catch (error) {
      // Try partial reconstruction
      const partialData = await this.attemptPartialReconstruction(validShards);

      return {
        complete: false,
        partialData,
      };
    }
  }

  private async decryptShard(
    encryptedShard: Buffer,
    context: VaultDecodeContext,
  ): Promise<Buffer> {
    // Derive decryption key from context
    const key = await this.deriveDecryptionKey(context);

    // Decrypt shard
    return await decryptVault(encryptedShard, key);
  }

  private async deriveDecryptionKey(
    context: VaultDecodeContext,
  ): Promise<string> {
    // Create composite key from available context
    const keyComponents: string[] = [context.requesterKey];

    if (context.ritualProofs) {
      const ritualKeys = context.ritualProofs
        .filter((r) => r.verificationStatus === "verified")
        .map((r) => r.proof.toString("hex"));
      keyComponents.push(...ritualKeys);
    }

    if (context.consensusSignatures) {
      const consensusKeys = context.consensusSignatures.map((s) =>
        s.signature.toString("hex"),
      );
      keyComponents.push(...consensusKeys);
    }

    // Hash combined components to create key
    const { sha256 } = require("@noble/hashes/sha256");
    const combined = keyComponents.join(":");
    return Buffer.from(sha256(combined)).toString("hex");
  }

  private async attemptPartialReconstruction(
    validShards: Buffer[],
  ): Promise<any> {
    // Try to extract whatever data we can from valid shards
    const partialData: any = {};

    for (const shard of validShards) {
      try {
        const shardData = JSON.parse(shard.toString());

        // Extract metadata if available
        if (shardData.metadata) {
          Object.assign(partialData, shardData.metadata);
        }

        // Extract partial state information
        if (shardData.partialState) {
          Object.assign(partialData, shardData.partialState);
        }
      } catch (error) {
        // Skip corrupted shards
        continue;
      }
    }

    return partialData;
  }

  private async verifyAccess(
    vaultId: string,
    context: VaultDecodeContext,
  ): Promise<VaultAccess> {
    // Check cache first
    const cacheKey = `${vaultId}_${context.requesterKey}_${context.authorizationLevel}`;
    const cached = this.authorizationCache.get(cacheKey);

    if (cached && cached.expiresAt && cached.expiresAt > new Date()) {
      return cached;
    }

    // Determine access level based on context
    let access: VaultAccess;

    switch (context.authorizationLevel) {
      case "emergency":
        access = await this.verifyEmergencyAccess(vaultId, context);
        break;

      case "manage":
        access = await this.verifyManagementAccess(vaultId, context);
        break;

      case "unlock":
        access = await this.verifyUnlockAccess(vaultId, context);
        break;

      case "view":
      default:
        access = await this.verifyViewAccess(vaultId, context);
        break;
    }

    // Cache result
    this.authorizationCache.set(cacheKey, access);

    return access;
  }

  private async verifyEmergencyAccess(
    vaultId: string,
    context: VaultDecodeContext,
  ): Promise<VaultAccess> {
    if (!context.emergencyOverride) {
      return { level: "denied", permissions: [], restrictions: [] };
    }

    const valid = await this.verifyEmergencyOverride(
      vaultId,
      context.emergencyOverride,
    );

    if (valid) {
      return {
        level: "emergency",
        permissions: ["view", "unlock", "transfer", "destroy"],
        restrictions: ["audit_logged"],
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }

    return { level: "denied", permissions: [], restrictions: [] };
  }

  private async verifyManagementAccess(
    vaultId: string,
    context: VaultDecodeContext,
  ): Promise<VaultAccess> {
    if (!context.consensusSignatures) {
      return { level: "denied", permissions: [], restrictions: [] };
    }

    const valid = await this.verifyConsensus(
      vaultId,
      context.consensusSignatures,
    );

    if (valid) {
      return {
        level: "manage",
        permissions: ["view", "unlock", "modify", "add_participants"],
        restrictions: [],
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      };
    }

    return { level: "denied", permissions: [], restrictions: [] };
  }

  private async verifyUnlockAccess(
    vaultId: string,
    context: VaultDecodeContext,
  ): Promise<VaultAccess> {
    if (!context.ritualProofs) {
      return { level: "denied", permissions: [], restrictions: [] };
    }

    const verifiedRituals = await this.verifyRitualProofs(
      vaultId,
      context.ritualProofs,
    );
    const requiredRituals = await this.getRequiredRituals(vaultId);

    const allRequired = requiredRituals.every((required) =>
      verifiedRituals.some(
        (verified) =>
          verified.ritualId === required.id &&
          verified.verificationStatus === "verified",
      ),
    );

    if (allRequired) {
      return {
        level: "unlock",
        permissions: ["view", "unlock", "transfer"],
        restrictions: ["rate_limited"],
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }

    return { level: "denied", permissions: [], restrictions: [] };
  }

  private async verifyViewAccess(
    vaultId: string,
    context: VaultDecodeContext,
  ): Promise<VaultAccess> {
    // Basic view access - check if requester is participant
    const isParticipant = await this.isVaultParticipant(
      vaultId,
      context.requesterKey,
    );

    if (isParticipant) {
      return {
        level: "view",
        permissions: ["view"],
        restrictions: ["metadata_only"],
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      };
    }

    return { level: "denied", permissions: [], restrictions: [] };
  }

  private async verifyRitualProofs(
    vaultId: string,
    ritualProofs: RitualProof[],
  ): Promise<RitualProof[]> {
    const verified: RitualProof[] = [];

    for (const proof of ritualProofs) {
      const isValid = await this.validateRitualProof(vaultId, proof);
      verified.push({
        ...proof,
        verificationStatus: isValid ? "verified" : "failed",
      });
    }

    return verified;
  }

  private async validateRitualProof(
    vaultId: string,
    proof: RitualProof,
  ): Promise<boolean> {
    // Mock ritual validation
    switch (proof.type) {
      case "voice":
        return await this.validateVoiceProof(proof);
      case "gesture":
        return await this.validateGestureProof(proof);
      case "proximity":
        return await this.validateProximityProof(proof);
      case "object":
        return await this.validateObjectProof(proof);
      case "story":
        return await this.validateStoryProof(proof);
      default:
        return false;
    }
  }

  private async validateVoiceProof(proof: RitualProof): Promise<boolean> {
    // Mock voice analysis - in production, use AI speech recognition
    return Math.random() > 0.2; // 80% success rate
  }

  private async validateGestureProof(proof: RitualProof): Promise<boolean> {
    // Mock gesture analysis - in production, use computer vision
    return Math.random() > 0.3; // 70% success rate
  }

  private async validateProximityProof(proof: RitualProof): Promise<boolean> {
    // Mock proximity verification
    return Math.random() > 0.1; // 90% success rate
  }

  private async validateObjectProof(proof: RitualProof): Promise<boolean> {
    // Mock object recognition
    return Math.random() > 0.25; // 75% success rate
  }

  private async validateStoryProof(proof: RitualProof): Promise<boolean> {
    // Mock story analysis - in production, use NLP
    return Math.random() > 0.4; // 60% success rate
  }

  private async verifyConsensus(
    vaultId: string,
    signatures: ConsensusSignature[],
  ): Promise<boolean> {
    // Get vault participants and their weights
    const participants = await this.getVaultParticipants(vaultId);
    const requiredWeight = 0.6; // 60% consensus required

    let totalWeight = 0;
    let approvalWeight = 0;

    for (const participant of participants) {
      const signature = signatures.find(
        (s) => s.participantId === participant.id,
      );

      if (signature && this.verifySignature(signature)) {
        totalWeight += participant.weight;
        if (signature.voteType === "approve") {
          approvalWeight += participant.weight;
        }
      }
    }

    return approvalWeight / totalWeight >= requiredWeight;
  }

  private verifySignature(signature: ConsensusSignature): boolean {
    // Mock signature verification
    return (
      signature.signature.length > 0 && signature.timestamp instanceof Date
    );
  }

  private async verifyEmergencyOverride(
    vaultId: string,
    override: EmergencyOverride,
  ): Promise<boolean> {
    // Verify emergency contact is authorized
    const emergencyContacts = await this.getEmergencyContacts(vaultId);
    const contact = emergencyContacts.find((c) => c.id === override.contactId);

    if (!contact) return false;

    // Verify override code
    const expectedCode = await this.generateEmergencyCode(vaultId, contact.id);
    return override.overrideCode === expectedCode;
  }

  private async verifyVaultDNA(vaultData: any): Promise<boolean> {
    try {
      const genome = await this.dnaEngine.analyzeVaultGenome(vaultData.dna);
      return genome.dna === vaultData.dna;
    } catch (error) {
      return false;
    }
  }

  private applyAccessRestrictions(vault: any, access: VaultAccess): any {
    if (!vault) return vault;

    const restricted = { ...vault };

    // Apply restrictions based on access level
    if (access.restrictions.includes("metadata_only")) {
      // Only return metadata, not sensitive data
      return {
        metadata: restricted.metadata,
        type: restricted.config?.vaultType,
        participants: restricted.metadata?.participants?.length,
      };
    }

    if (access.restrictions.includes("no_private_keys")) {
      delete restricted.encryption;
      delete restricted.shards;
    }

    return restricted;
  }

  // Mock helper methods - in production these would query actual vault data
  private async getRequiredRituals(vaultId: string): Promise<any[]> {
    return [
      { id: "ritual1", type: "voice", required: true },
      { id: "ritual2", type: "proximity", required: false },
    ];
  }

  private async isVaultParticipant(
    vaultId: string,
    participantKey: string,
  ): Promise<boolean> {
    return Math.random() > 0.3; // 70% chance of being participant
  }

  private async getVaultParticipants(
    vaultId: string,
  ): Promise<Array<{ id: string; weight: number }>> {
    return [
      { id: "participant1", weight: 0.4 },
      { id: "participant2", weight: 0.3 },
      { id: "participant3", weight: 0.3 },
    ];
  }

  private async getEmergencyContacts(
    vaultId: string,
  ): Promise<Array<{ id: string; permissions: string[] }>> {
    return [
      { id: "emergency1", permissions: ["unlock", "transfer"] },
      { id: "emergency2", permissions: ["view", "unlock"] },
    ];
  }

  private async generateEmergencyCode(
    vaultId: string,
    contactId: string,
  ): Promise<string> {
    // Generate time-based emergency code
    const seed = `${vaultId}_${contactId}_${Math.floor(Date.now() / 3600000)}`;
    const { sha256 } = require("@noble/hashes/sha256");
    return Buffer.from(sha256(seed)).toString("hex").slice(0, 12);
  }

  // Public query methods
  getShardLocations(vaultId: string): VaultShardInfo[] {
    return this.shardLocations.get(vaultId) || [];
  }

  getCachedAccess(
    vaultId: string,
    requesterKey: string,
  ): VaultAccess | undefined {
    const cacheKey = `${vaultId}_${requesterKey}`;
    return this.authorizationCache.get(cacheKey);
  }

  clearAuthorizationCache(vaultId?: string): void {
    if (vaultId) {
      // Clear specific vault's cache entries
      for (const key of this.authorizationCache.keys()) {
        if (key.startsWith(`${vaultId}_`)) {
          this.authorizationCache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.authorizationCache.clear();
    }
  }
}

// Convenience functions
export async function decodeVaultWithRituals(
  vaultId: string,
  encryptedShards: Buffer[],
  ritualProofs: RitualProof[],
  requesterKey: string,
): Promise<DecodeResult> {
  const decoder = new VaultDecoder();
  return await decoder.decodeWithRituals(
    vaultId,
    encryptedShards,
    ritualProofs,
    requesterKey,
  );
}

export async function emergencyVaultDecode(
  vaultId: string,
  encryptedShards: Buffer[],
  emergencyOverride: EmergencyOverride,
): Promise<DecodeResult> {
  const decoder = new VaultDecoder();
  return await decoder.emergencyDecode(
    vaultId,
    encryptedShards,
    emergencyOverride,
  );
}

export { VaultDecoder };
