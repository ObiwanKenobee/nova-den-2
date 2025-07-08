import { createHash, randomBytes } from "crypto";
import { deflate, inflate } from "zlib";
import { promisify } from "util";

const deflateAsync = promisify(deflate);
const inflateAsync = promisify(inflate);

export interface Shard {
  id: string;
  index: number;
  totalShards: number;
  data: Buffer;
  checksum: string;
  timestamp: Date;
  originalSize: number;
  compressed: boolean;
}

export interface ShardMetadata {
  originalId: string;
  totalShards: number;
  originalSize: number;
  compressed: boolean;
  checksums: string[];
  created: Date;
}

export interface ReassemblyStatus {
  originalId: string;
  receivedShards: number;
  totalShards: number;
  completionPercentage: number;
  missingShards: number[];
  lastReceived: Date;
  isComplete: boolean;
}

export class MeshShard {
  private maxShardSize: number;
  private compressionThreshold: number;
  private pendingReassemblies = new Map<
    string,
    {
      metadata: ShardMetadata;
      shards: Map<number, Shard>;
      lastActivity: Date;
    }
  >();
  private cleanupTimer?: NodeJS.Timer;

  constructor(maxShardSize: number = 1024, compressionThreshold: number = 500) {
    this.maxShardSize = maxShardSize;
    this.compressionThreshold = compressionThreshold;

    // Start cleanup timer
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleReassemblies();
    }, 60000); // Clean every minute
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  async createShards(data: Buffer, originalId: string): Promise<Shard[]> {
    let processedData = data;
    let compressed = false;

    // Compress if data is large enough
    if (data.length > this.compressionThreshold) {
      try {
        processedData = await deflateAsync(data);
        compressed = true;
      } catch (error) {
        // Fall back to uncompressed if compression fails
        processedData = data;
        compressed = false;
      }
    }

    const totalShards = Math.ceil(processedData.length / this.maxShardSize);
    const shards: Shard[] = [];

    for (let i = 0; i < totalShards; i++) {
      const start = i * this.maxShardSize;
      const end = Math.min(start + this.maxShardSize, processedData.length);
      const shardData = processedData.slice(start, end);

      const shard: Shard = {
        id: `${originalId}_shard_${i}`,
        index: i,
        totalShards,
        data: shardData,
        checksum: this.calculateChecksum(shardData),
        timestamp: new Date(),
        originalSize: data.length,
        compressed,
      };

      shards.push(shard);
    }

    return shards;
  }

  receiveShard(shard: Shard): ReassemblyStatus {
    const originalId = this.extractOriginalId(shard.id);

    let reassembly = this.pendingReassemblies.get(originalId);

    if (!reassembly) {
      // Create new reassembly context
      const metadata: ShardMetadata = {
        originalId,
        totalShards: shard.totalShards,
        originalSize: shard.originalSize,
        compressed: shard.compressed,
        checksums: new Array(shard.totalShards).fill(""),
        created: new Date(),
      };

      reassembly = {
        metadata,
        shards: new Map(),
        lastActivity: new Date(),
      };

      this.pendingReassemblies.set(originalId, reassembly);
    }

    // Verify shard integrity
    const calculatedChecksum = this.calculateChecksum(shard.data);
    if (calculatedChecksum !== shard.checksum) {
      throw new Error(`Shard ${shard.id} failed integrity check`);
    }

    // Store shard
    reassembly.shards.set(shard.index, shard);
    reassembly.metadata.checksums[shard.index] = shard.checksum;
    reassembly.lastActivity = new Date();

    // Generate status
    const status = this.generateReassemblyStatus(originalId, reassembly);

    return status;
  }

  async tryReassemble(originalId: string): Promise<Buffer | null> {
    const reassembly = this.pendingReassemblies.get(originalId);

    if (!reassembly) {
      return null;
    }

    const { metadata, shards } = reassembly;

    // Check if all shards are present
    if (shards.size !== metadata.totalShards) {
      return null;
    }

    // Verify all shards are present and in order
    const orderedShards: Shard[] = [];
    for (let i = 0; i < metadata.totalShards; i++) {
      const shard = shards.get(i);
      if (!shard) {
        return null; // Missing shard
      }
      orderedShards.push(shard);
    }

    // Concatenate shard data
    const reassembledData = Buffer.concat(
      orderedShards.map((shard) => shard.data),
    );

    // Verify overall integrity
    const expectedSize = metadata.compressed
      ? reassembledData.length
      : metadata.originalSize;

    let finalData = reassembledData;

    // Decompress if necessary
    if (metadata.compressed) {
      try {
        finalData = await inflateAsync(reassembledData);
      } catch (error) {
        throw new Error(`Failed to decompress reassembled data: ${error}`);
      }
    }

    // Verify final size
    if (finalData.length !== metadata.originalSize) {
      throw new Error(
        `Reassembled data size mismatch. Expected: ${metadata.originalSize}, Got: ${finalData.length}`,
      );
    }

    // Clean up successful reassembly
    this.pendingReassemblies.delete(originalId);

    return finalData;
  }

  private generateReassemblyStatus(
    originalId: string,
    reassembly: any,
  ): ReassemblyStatus {
    const { metadata, shards } = reassembly;
    const receivedShards = shards.size;
    const totalShards = metadata.totalShards;

    const missingShards: number[] = [];
    for (let i = 0; i < totalShards; i++) {
      if (!shards.has(i)) {
        missingShards.push(i);
      }
    }

    return {
      originalId,
      receivedShards,
      totalShards,
      completionPercentage: (receivedShards / totalShards) * 100,
      missingShards,
      lastReceived: reassembly.lastActivity,
      isComplete: receivedShards === totalShards,
    };
  }

  private extractOriginalId(shardId: string): string {
    // Extract original ID from shard ID format: "originalId_shard_index"
    const parts = shardId.split("_shard_");
    return parts[0];
  }

  private calculateChecksum(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
  }

  private cleanupStaleReassemblies(): void {
    const now = Date.now();
    const maxAge = 600000; // 10 minutes

    for (const [originalId, reassembly] of this.pendingReassemblies) {
      if (now - reassembly.lastActivity.getTime() > maxAge) {
        this.pendingReassemblies.delete(originalId);
      }
    }
  }

  // Public status methods
  getReassemblyStatus(originalId: string): ReassemblyStatus | null {
    const reassembly = this.pendingReassemblies.get(originalId);
    if (!reassembly) {
      return null;
    }

    return this.generateReassemblyStatus(originalId, reassembly);
  }

  getAllReassemblyStatuses(): ReassemblyStatus[] {
    return Array.from(this.pendingReassemblies.keys())
      .map((originalId) => this.getReassemblyStatus(originalId))
      .filter((status) => status !== null) as ReassemblyStatus[];
  }

  getShardingStats() {
    return {
      maxShardSize: this.maxShardSize,
      compressionThreshold: this.compressionThreshold,
      pendingReassemblies: this.pendingReassemblies.size,
      completedReassemblies: Array.from(
        this.pendingReassemblies.values(),
      ).filter((r) => r.shards.size === r.metadata.totalShards).length,
    };
  }

  // Utility methods
  static calculateOptimalShardSize(
    dataSize: number,
    maxShards: number = 100,
  ): number {
    return Math.max(256, Math.ceil(dataSize / maxShards));
  }

  static estimateShardCount(
    dataSize: number,
    shardSize: number,
    compressed: boolean = true,
  ): number {
    let estimatedSize = dataSize;

    if (compressed && dataSize > 500) {
      // Estimate 30-60% compression ratio
      estimatedSize = Math.ceil(dataSize * 0.7);
    }

    return Math.ceil(estimatedSize / shardSize);
  }

  // Advanced sharding strategies
  async createAdaptiveShards(
    data: Buffer,
    originalId: string,
    networkConditions: {
      averageLatency: number;
      packetLossRate: number;
      maxPeers: number;
    },
  ): Promise<Shard[]> {
    // Adapt shard size based on network conditions
    let adaptiveShardSize = this.maxShardSize;

    // Reduce shard size in poor network conditions
    if (networkConditions.packetLossRate > 0.1) {
      adaptiveShardSize = Math.max(256, this.maxShardSize * 0.5);
    } else if (networkConditions.averageLatency > 5000) {
      adaptiveShardSize = Math.max(512, this.maxShardSize * 0.75);
    }

    // Use redundancy for critical data in poor conditions
    const useRedundancy = networkConditions.packetLossRate > 0.15;

    let processedData = data;
    let compressed = false;

    // Aggressive compression in poor networks
    if (
      data.length > this.compressionThreshold ||
      networkConditions.packetLossRate > 0.1
    ) {
      try {
        processedData = await deflateAsync(data);
        compressed = true;
      } catch (error) {
        processedData = data;
        compressed = false;
      }
    }

    const totalShards = Math.ceil(processedData.length / adaptiveShardSize);
    const shards: Shard[] = [];

    for (let i = 0; i < totalShards; i++) {
      const start = i * adaptiveShardSize;
      const end = Math.min(start + adaptiveShardSize, processedData.length);
      const shardData = processedData.slice(start, end);

      const shard: Shard = {
        id: `${originalId}_shard_${i}`,
        index: i,
        totalShards,
        data: shardData,
        checksum: this.calculateChecksum(shardData),
        timestamp: new Date(),
        originalSize: data.length,
        compressed,
      };

      shards.push(shard);

      // Add redundant shards for critical indices
      if (useRedundancy && (i === 0 || i === totalShards - 1 || i % 10 === 0)) {
        const redundantShard: Shard = {
          ...shard,
          id: `${originalId}_shard_${i}_redundant`,
        };
        shards.push(redundantShard);
      }
    }

    return shards;
  }

  destroy(): void {
    this.stopCleanup();
    this.pendingReassemblies.clear();
  }
}

// Export utility functions
export function createShardId(originalId: string, index: number): string {
  return `${originalId}_shard_${index}`;
}

export function parseShardId(shardId: string): {
  originalId: string;
  index: number;
} {
  const parts = shardId.split("_shard_");
  return {
    originalId: parts[0],
    index: parseInt(parts[1], 10),
  };
}

export function validateShardSequence(shards: Shard[]): boolean {
  if (shards.length === 0) return false;

  const totalShards = shards[0].totalShards;
  if (shards.length !== totalShards) return false;

  const indices = shards.map((s) => s.index).sort((a, b) => a - b);
  for (let i = 0; i < totalShards; i++) {
    if (indices[i] !== i) return false;
  }

  return true;
}
