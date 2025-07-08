export { VaultEngine } from "./createVault";
export { VaultEncryption, encryptVault, decryptVault } from "./encryptVault";
export { VaultDNAEngine, generateVaultDNA, analyzeVaultDNA } from "./vaultDNA";
export {
  VaultDecoder,
  decodeVaultWithRituals,
  emergencyVaultDecode,
} from "./decodeVault";
export {
  YieldEngine,
  createBasicYieldConfig,
  createCommunityYieldConfig,
} from "./yieldUnlock";

// Type exports
export type {
  VaultConfig,
  UnlockCondition,
  YieldConfig,
  GovernanceConfig,
  RitualRequirement,
  GeographicRestriction,
  EmergencyContact,
  VaultMetadata,
  VaultShard,
  Vault,
  VaultState,
  VaultEncryption as VaultEncryptionType,
  VaultGenomeAnalysis,
} from "./createVault";

export type {
  EncryptionConfig,
  EncryptedVault,
  SecretSharing,
  SecretShare,
} from "./encryptVault";

export type {
  VaultGenotype,
  BehaviorPattern,
  MemoryFragment,
  DNASequence,
  VaultGenome,
  VaultTrait,
  VaultAdaptation,
  VaultMutation,
} from "./vaultDNA";

export type {
  VaultDecodeContext,
  RitualProof,
  ConsensusSignature,
  EmergencyOverride,
  VaultShardInfo,
  DecodeResult,
  VaultAccess,
} from "./decodeVault";

export type {
  YieldSource,
  YieldCondition,
  YieldCalculation,
  YieldBreakdown,
  YieldDistribution,
  YieldRecipient,
  RegenerativeYield,
} from "./yieldUnlock";

// Utility functions
export { validateVaultConfig } from "./createVault";
