import { EventEmitter } from "events";
import { randomBytes } from "crypto";
import { PeerDiscovery } from "./peerDiscovery";
import { MessageRelayEngine } from "./messageRelayEngine";
import { MeshShard } from "./meshShard";

export interface MeshConfig {
  nodeId?: string;
  deviceName?: string;
  maxPeers?: number;
  routingTableSize?: number;
  packetTTL?: number;
  shardSize?: number;
  compressionEnabled?: boolean;
  encryptionKey?: Buffer;
}

export interface MeshNode {
  id: string;
  deviceName: string;
  lastSeen: Date;
  signalStrength: number;
  capabilities: string[];
  trustScore: number;
}

export interface MeshPacket {
  id: string;
  sourceId: string;
  targetId: string;
  payload: Buffer;
  timestamp: Date;
  ttl: number;
  routePath: string[];
  priority: "low" | "medium" | "high" | "critical";
  encrypted: boolean;
}

export class VaultTapMesh extends EventEmitter {
  private nodeId: string;
  private deviceName: string;
  private config: MeshConfig;
  private peerDiscovery: PeerDiscovery;
  private relayEngine: MessageRelayEngine;
  private meshShard: MeshShard;
  private connectedPeers: Map<string, MeshNode> = new Map();
  private routingTable: Map<string, string[]> = new Map();
  private packetBuffer: Map<string, MeshPacket> = new Map();
  private isInitialized = false;

  constructor(config: MeshConfig = {}) {
    super();

    this.config = {
      maxPeers: 50,
      routingTableSize: 1000,
      packetTTL: 24, // 24 hops
      shardSize: 1024, // 1KB shards
      compressionEnabled: true,
      encryptionKey: randomBytes(32),
      ...config,
    };

    this.nodeId = config.nodeId || this.generateNodeId();
    this.deviceName =
      config.deviceName || `VaultTap-${this.nodeId.slice(0, 8)}`;

    this.peerDiscovery = new PeerDiscovery(this.nodeId, this.deviceName);
    this.relayEngine = new MessageRelayEngine(this.nodeId, this.config);
    this.meshShard = new MeshShard(this.config.shardSize!);

    this.setupEventHandlers();
  }

  private generateNodeId(): string {
    return randomBytes(16).toString("hex");
  }

  private setupEventHandlers(): void {
    this.peerDiscovery.on("peerDiscovered", (peer: MeshNode) => {
      this.handlePeerDiscovered(peer);
    });

    this.peerDiscovery.on("peerLost", (peerId: string) => {
      this.handlePeerLost(peerId);
    });

    this.relayEngine.on("messageReceived", (packet: MeshPacket) => {
      this.handleMessageReceived(packet);
    });

    this.relayEngine.on(
      "routeUpdate",
      (route: { targetId: string; path: string[] }) => {
        this.updateRoutingTable(route.targetId, route.path);
      },
    );
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error("Mesh already initialized");
    }

    try {
      // Initialize BLE subsystems
      await this.peerDiscovery.start();
      await this.relayEngine.start();

      this.isInitialized = true;

      this.emit("meshInitialized", {
        nodeId: this.nodeId,
        deviceName: this.deviceName,
        capabilities: this.getCapabilities(),
      });

      console.log(`VaultTap Mesh initialized: ${this.nodeId}`);
    } catch (error) {
      this.emit("meshError", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    await this.peerDiscovery.stop();
    await this.relayEngine.stop();

    this.connectedPeers.clear();
    this.routingTable.clear();
    this.packetBuffer.clear();

    this.isInitialized = false;
    this.emit("meshShutdown");
  }

  async sendPacket(
    targetId: string,
    payload: Buffer,
    priority: MeshPacket["priority"] = "medium",
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("Mesh not initialized");
    }

    const packet: MeshPacket = {
      id: randomBytes(8).toString("hex"),
      sourceId: this.nodeId,
      targetId,
      payload,
      timestamp: new Date(),
      ttl: this.config.packetTTL!,
      routePath: [this.nodeId],
      priority,
      encrypted: true,
    };

    // Shard large packets
    if (payload.length > this.config.shardSize!) {
      return this.sendShardedPacket(packet);
    }

    // Find route to target
    const route = this.findRoute(targetId);
    if (!route || route.length === 0) {
      // No direct route, broadcast to all peers for discovery
      await this.broadcastPacket(packet);
    } else {
      // Send via optimal route
      await this.relayEngine.forwardPacket(packet, route[0]);
    }

    this.packetBuffer.set(packet.id, packet);

    // Clean up old packets
    setTimeout(() => {
      this.packetBuffer.delete(packet.id);
    }, 300000); // 5 minutes

    return packet.id;
  }

  private async sendShardedPacket(packet: MeshPacket): Promise<string> {
    const shards = this.meshShard.createShards(packet.payload, packet.id);

    for (const shard of shards) {
      const shardPacket: MeshPacket = {
        ...packet,
        id: `${packet.id}_shard_${shard.index}`,
        payload: shard.data,
      };

      const route = this.findRoute(packet.targetId);
      if (route && route.length > 0) {
        await this.relayEngine.forwardPacket(shardPacket, route[0]);
      } else {
        await this.broadcastPacket(shardPacket);
      }
    }

    return packet.id;
  }

  private async broadcastPacket(packet: MeshPacket): Promise<void> {
    const promises = Array.from(this.connectedPeers.keys()).map((peerId) =>
      this.relayEngine.forwardPacket(packet, peerId),
    );

    await Promise.allSettled(promises);
  }

  private findRoute(targetId: string): string[] | null {
    return this.routingTable.get(targetId) || null;
  }

  private updateRoutingTable(targetId: string, path: string[]): void {
    const existingPath = this.routingTable.get(targetId);

    // Update if new path is shorter or doesn't exist
    if (!existingPath || path.length < existingPath.length) {
      this.routingTable.set(targetId, path);

      // Limit routing table size
      if (this.routingTable.size > this.config.routingTableSize!) {
        const oldestEntry = this.routingTable.keys().next().value;
        this.routingTable.delete(oldestEntry);
      }
    }
  }

  private handlePeerDiscovered(peer: MeshNode): void {
    if (this.connectedPeers.size >= this.config.maxPeers!) {
      // Remove least trusted peer
      const leastTrusted = Array.from(this.connectedPeers.values()).sort(
        (a, b) => a.trustScore - b.trustScore,
      )[0];
      this.connectedPeers.delete(leastTrusted.id);
    }

    this.connectedPeers.set(peer.id, peer);
    this.updateRoutingTable(peer.id, [peer.id]);

    this.emit("peerConnected", peer);
  }

  private handlePeerLost(peerId: string): void {
    const peer = this.connectedPeers.get(peerId);
    if (peer) {
      this.connectedPeers.delete(peerId);
      this.routingTable.delete(peerId);
      this.emit("peerDisconnected", peer);
    }
  }

  private handleMessageReceived(packet: MeshPacket): void {
    // Check if packet is for us
    if (packet.targetId === this.nodeId) {
      this.emit("packetReceived", packet);
      return;
    }

    // Forward packet if TTL allows
    if (packet.ttl > 0 && !packet.routePath.includes(this.nodeId)) {
      packet.ttl--;
      packet.routePath.push(this.nodeId);

      const route = this.findRoute(packet.targetId);
      if (route && route.length > 0) {
        this.relayEngine.forwardPacket(packet, route[0]);
      }
    }
  }

  private getCapabilities(): string[] {
    return [
      "mesh-routing",
      "packet-sharding",
      "encryption",
      "vault-operations",
      "trust-scoring",
    ];
  }

  // Public getters
  get nodeInfo() {
    return {
      id: this.nodeId,
      deviceName: this.deviceName,
      peerCount: this.connectedPeers.size,
      routingTableSize: this.routingTable.size,
      packetBufferSize: this.packetBuffer.size,
      isInitialized: this.isInitialized,
    };
  }

  get peers() {
    return Array.from(this.connectedPeers.values());
  }

  get routes() {
    return Object.fromEntries(this.routingTable);
  }
}

export { PeerDiscovery, MessageRelayEngine, MeshShard };
