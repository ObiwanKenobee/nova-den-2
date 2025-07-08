import { EventEmitter } from "events";
import { createHash, randomBytes } from "crypto";

export interface RelayConfig {
  maxHops?: number;
  routingAlgorithm?: "flooding" | "distance-vector" | "link-state";
  queueSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

export interface RouteMetrics {
  hopCount: number;
  latency: number;
  reliability: number;
  bandwidth: number;
  lastUpdated: Date;
}

export interface RoutingEntry {
  targetId: string;
  nextHop: string;
  metrics: RouteMetrics;
  cost: number;
}

export interface MessagePacket {
  id: string;
  sourceId: string;
  targetId: string;
  payload: Buffer;
  timestamp: Date;
  ttl: number;
  routePath: string[];
  priority: "low" | "medium" | "high" | "critical";
  encrypted: boolean;
  compressed: boolean;
  sequenceNumber: number;
  acknowledgmentRequired: boolean;
}

export interface QueuedMessage {
  packet: MessagePacket;
  retryCount: number;
  nextRetry: Date;
  targetPeerId: string;
}

export class MessageRelayEngine extends EventEmitter {
  private nodeId: string;
  private config: RelayConfig;
  private routingTable = new Map<string, RoutingEntry>();
  private messageQueue: QueuedMessage[] = [];
  private receivedMessages = new Set<string>();
  private sequenceNumber = 0;
  private processingTimer?: NodeJS.Timer;
  private routeMaintenanceTimer?: NodeJS.Timer;
  private acknowledgments = new Map<string, Date>();

  constructor(nodeId: string, config: RelayConfig = {}) {
    super();

    this.nodeId = nodeId;
    this.config = {
      maxHops: 24,
      routingAlgorithm: "distance-vector",
      queueSize: 1000,
      retryAttempts: 3,
      retryDelay: 5000,
      compressionEnabled: true,
      encryptionEnabled: true,
      ...config,
    };
  }

  async start(): Promise<void> {
    this.startMessageProcessing();
    this.startRouteMaintenance();
    console.log(`Message relay engine started for node: ${this.nodeId}`);
  }

  async stop(): Promise<void> {
    this.stopMessageProcessing();
    this.stopRouteMaintenance();

    this.messageQueue = [];
    this.routingTable.clear();
    this.receivedMessages.clear();
    this.acknowledgments.clear();

    console.log(`Message relay engine stopped for node: ${this.nodeId}`);
  }

  private startMessageProcessing(): void {
    this.processingTimer = setInterval(() => {
      this.processMessageQueue();
    }, 1000); // Process every second
  }

  private stopMessageProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }
  }

  private startRouteMaintenance(): void {
    this.routeMaintenanceTimer = setInterval(() => {
      this.maintainRoutes();
      this.cleanupOldMessages();
    }, 30000); // Maintain every 30 seconds
  }

  private stopRouteMaintenance(): void {
    if (this.routeMaintenanceTimer) {
      clearInterval(this.routeMaintenanceTimer);
      this.routeMaintenanceTimer = undefined;
    }
  }

  async forwardPacket(
    packet: MessagePacket,
    targetPeerId: string,
  ): Promise<void> {
    // Add to queue for processing
    const queuedMessage: QueuedMessage = {
      packet,
      retryCount: 0,
      nextRetry: new Date(),
      targetPeerId,
    };

    if (this.messageQueue.length >= this.config.queueSize!) {
      // Remove oldest low-priority message
      const oldestLowPriority = this.messageQueue.find(
        (msg) => msg.packet.priority === "low",
      );
      if (oldestLowPriority) {
        const index = this.messageQueue.indexOf(oldestLowPriority);
        this.messageQueue.splice(index, 1);
      } else {
        // Queue is full, drop this message
        this.emit("messageDropped", packet, "queue_full");
        return;
      }
    }

    // Insert based on priority
    this.insertByPriority(queuedMessage);
  }

  private insertByPriority(queuedMessage: QueuedMessage): void {
    const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
    const messagePriority = priorities[queuedMessage.packet.priority];

    let insertIndex = this.messageQueue.length;
    for (let i = 0; i < this.messageQueue.length; i++) {
      const queuePriority = priorities[this.messageQueue[i].packet.priority];
      if (messagePriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.messageQueue.splice(insertIndex, 0, queuedMessage);
  }

  private async processMessageQueue(): Promise<void> {
    const now = new Date();

    for (let i = this.messageQueue.length - 1; i >= 0; i--) {
      const queuedMessage = this.messageQueue[i];

      if (now >= queuedMessage.nextRetry) {
        try {
          await this.transmitMessage(queuedMessage);
          this.messageQueue.splice(i, 1);
        } catch (error) {
          queuedMessage.retryCount++;

          if (queuedMessage.retryCount >= this.config.retryAttempts!) {
            this.messageQueue.splice(i, 1);
            this.emit("messageDeliveryFailed", queuedMessage.packet, error);
          } else {
            queuedMessage.nextRetry = new Date(
              now.getTime() + this.config.retryDelay!,
            );
          }
        }
      }
    }
  }

  private async transmitMessage(queuedMessage: QueuedMessage): Promise<void> {
    const { packet, targetPeerId } = queuedMessage;

    // Check if we've already seen this message (prevent loops)
    const messageHash = this.createMessageHash(packet);
    if (this.receivedMessages.has(messageHash)) {
      return;
    }

    this.receivedMessages.add(messageHash);

    // Simulate transmission
    const success = await this.simulateTransmission(packet, targetPeerId);

    if (success) {
      this.emit("messageTransmitted", packet, targetPeerId);

      if (packet.acknowledgmentRequired) {
        this.waitForAcknowledgment(packet.id);
      }
    } else {
      throw new Error("Transmission failed");
    }
  }

  private async simulateTransmission(
    packet: MessagePacket,
    targetPeerId: string,
  ): Promise<boolean> {
    // Simulate BLE transmission with realistic failure rates
    return new Promise((resolve) => {
      setTimeout(
        () => {
          const successRate = this.calculateSuccessRate(packet, targetPeerId);
          resolve(Math.random() < successRate);
        },
        Math.random() * 500 + 100,
      ); // 100-600ms delay
    });
  }

  private calculateSuccessRate(
    packet: MessagePacket,
    targetPeerId: string,
  ): number {
    const routingEntry = this.routingTable.get(targetPeerId);

    let baseSuccessRate = 0.85; // 85% base success rate

    if (routingEntry) {
      // Adjust based on route reliability
      baseSuccessRate *= routingEntry.metrics.reliability;

      // Adjust based on hop count
      const hopPenalty = Math.pow(0.95, routingEntry.metrics.hopCount);
      baseSuccessRate *= hopPenalty;
    }

    // Adjust based on packet size
    const sizePenalty = Math.max(0.7, 1 - packet.payload.length / 10000);
    baseSuccessRate *= sizePenalty;

    // Priority bonus
    const priorityBonus = {
      critical: 1.1,
      high: 1.05,
      medium: 1.0,
      low: 0.95,
    }[packet.priority];

    baseSuccessRate *= priorityBonus;

    return Math.min(0.99, Math.max(0.1, baseSuccessRate));
  }

  private createMessageHash(packet: MessagePacket): string {
    const hashInput = `${packet.id}-${packet.sourceId}-${packet.sequenceNumber}`;
    return createHash("sha256").update(hashInput).digest("hex");
  }

  private waitForAcknowledgment(packetId: string): void {
    const timeout = setTimeout(() => {
      this.acknowledgments.delete(packetId);
      this.emit("acknowledgmentTimeout", packetId);
    }, 30000); // 30 second timeout

    this.acknowledgments.set(packetId, new Date());
  }

  async receiveMessage(
    packet: MessagePacket,
    sourcePeerId: string,
  ): Promise<void> {
    // Check TTL
    if (packet.ttl <= 0) {
      this.emit("messageExpired", packet);
      return;
    }

    // Check for duplicate
    const messageHash = this.createMessageHash(packet);
    if (this.receivedMessages.has(messageHash)) {
      return;
    }

    this.receivedMessages.add(messageHash);

    // Update route information
    this.updateRouteFromPacket(packet, sourcePeerId);

    // Check if message is for us
    if (packet.targetId === this.nodeId) {
      this.emit("messageReceived", packet);

      if (packet.acknowledgmentRequired) {
        await this.sendAcknowledgment(packet, sourcePeerId);
      }
      return;
    }

    // Forward message if TTL allows
    if (packet.ttl > 1 && !packet.routePath.includes(this.nodeId)) {
      packet.ttl--;
      packet.routePath.push(this.nodeId);

      const nextHop = this.findNextHop(packet.targetId);
      if (nextHop) {
        await this.forwardPacket(packet, nextHop);
      } else {
        // No route found, use flooding for discovery
        await this.floodMessage(packet, sourcePeerId);
      }
    }
  }

  private async sendAcknowledgment(
    originalPacket: MessagePacket,
    targetPeerId: string,
  ): Promise<void> {
    const ackPacket: MessagePacket = {
      id: randomBytes(8).toString("hex"),
      sourceId: this.nodeId,
      targetId: originalPacket.sourceId,
      payload: Buffer.from(
        JSON.stringify({
          type: "acknowledgment",
          originalPacketId: originalPacket.id,
        }),
      ),
      timestamp: new Date(),
      ttl: this.config.maxHops!,
      routePath: [this.nodeId],
      priority: "high",
      encrypted: false,
      compressed: false,
      sequenceNumber: this.sequenceNumber++,
      acknowledgmentRequired: false,
    };

    await this.forwardPacket(ackPacket, targetPeerId);
  }

  private async floodMessage(
    packet: MessagePacket,
    excludePeerId: string,
  ): Promise<void> {
    // Get all known peers except the source
    const allPeers = Array.from(this.routingTable.keys()).filter(
      (peerId) =>
        peerId !== excludePeerId && !packet.routePath.includes(peerId),
    );

    // Forward to up to 3 best peers to prevent excessive flooding
    const selectedPeers = this.selectBestPeers(allPeers, 3);

    for (const peerId of selectedPeers) {
      await this.forwardPacket({ ...packet }, peerId);
    }
  }

  private selectBestPeers(peerIds: string[], count: number): string[] {
    return peerIds
      .map((peerId) => ({
        peerId,
        entry: this.routingTable.get(peerId)!,
      }))
      .filter((peer) => peer.entry)
      .sort((a, b) => {
        // Sort by reliability and hop count
        const scoreA =
          a.entry.metrics.reliability - a.entry.metrics.hopCount * 0.1;
        const scoreB =
          b.entry.metrics.reliability - b.entry.metrics.hopCount * 0.1;
        return scoreB - scoreA;
      })
      .slice(0, count)
      .map((peer) => peer.peerId);
  }

  private findNextHop(targetId: string): string | null {
    const routingEntry = this.routingTable.get(targetId);
    return routingEntry?.nextHop || null;
  }

  private updateRouteFromPacket(
    packet: MessagePacket,
    sourcePeerId: string,
  ): void {
    // Update route to source
    const hopCount = packet.routePath.length;
    const latency = Date.now() - packet.timestamp.getTime();

    const existingEntry = this.routingTable.get(packet.sourceId);
    const newCost = hopCount + latency / 1000; // Cost = hops + latency in seconds

    if (!existingEntry || newCost < existingEntry.cost) {
      this.routingTable.set(packet.sourceId, {
        targetId: packet.sourceId,
        nextHop: sourcePeerId,
        metrics: {
          hopCount,
          latency,
          reliability: 0.9, // Initial reliability
          bandwidth: 1000, // Assume 1Kbps
          lastUpdated: new Date(),
        },
        cost: newCost,
      });

      this.emit("routeUpdate", {
        targetId: packet.sourceId,
        path: [sourcePeerId, ...packet.routePath.slice().reverse()],
      });
    }
  }

  private maintainRoutes(): void {
    const now = new Date();
    const maxAge = 300000; // 5 minutes

    for (const [targetId, entry] of this.routingTable) {
      if (now.getTime() - entry.metrics.lastUpdated.getTime() > maxAge) {
        this.routingTable.delete(targetId);
        this.emit("routeExpired", targetId);
      }
    }
  }

  private cleanupOldMessages(): void {
    const cutoff = new Date(Date.now() - 300000); // 5 minutes ago

    const oldMessages = Array.from(this.receivedMessages).filter((hash) => {
      // This is a simplified check - in practice, you'd store timestamps with hashes
      return Math.random() < 0.1; // Randomly remove 10% of old messages
    });

    oldMessages.forEach((hash) => this.receivedMessages.delete(hash));
  }

  // Public methods
  createPacket(
    targetId: string,
    payload: Buffer,
    options: Partial<MessagePacket> = {},
  ): MessagePacket {
    return {
      id: randomBytes(8).toString("hex"),
      sourceId: this.nodeId,
      targetId,
      payload,
      timestamp: new Date(),
      ttl: this.config.maxHops!,
      routePath: [this.nodeId],
      priority: "medium",
      encrypted: this.config.encryptionEnabled!,
      compressed: this.config.compressionEnabled!,
      sequenceNumber: this.sequenceNumber++,
      acknowledgmentRequired: false,
      ...options,
    };
  }

  getRoutingTable(): RoutingEntry[] {
    return Array.from(this.routingTable.values());
  }

  getQueueStatus() {
    return {
      queueLength: this.messageQueue.length,
      priorityBreakdown: {
        critical: this.messageQueue.filter(
          (m) => m.packet.priority === "critical",
        ).length,
        high: this.messageQueue.filter((m) => m.packet.priority === "high")
          .length,
        medium: this.messageQueue.filter((m) => m.packet.priority === "medium")
          .length,
        low: this.messageQueue.filter((m) => m.packet.priority === "low")
          .length,
      },
    };
  }

  getNetworkStats() {
    return {
      knownRoutes: this.routingTable.size,
      receivedMessageCount: this.receivedMessages.size,
      pendingAcknowledgments: this.acknowledgments.size,
      averageHopCount: this.calculateAverageHopCount(),
      averageLatency: this.calculateAverageLatency(),
    };
  }

  private calculateAverageHopCount(): number {
    const entries = Array.from(this.routingTable.values());
    if (entries.length === 0) return 0;

    const totalHops = entries.reduce(
      (sum, entry) => sum + entry.metrics.hopCount,
      0,
    );
    return totalHops / entries.length;
  }

  private calculateAverageLatency(): number {
    const entries = Array.from(this.routingTable.values());
    if (entries.length === 0) return 0;

    const totalLatency = entries.reduce(
      (sum, entry) => sum + entry.metrics.latency,
      0,
    );
    return totalLatency / entries.length;
  }
}
