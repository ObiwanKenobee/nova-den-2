export interface MeshPeer {
  id: string;
  name: string;
  publicKey: string;
  rssi: number;
  distance: number;
  lastSeen: Date;
  capabilities: PeerCapability[];
  trustScore: number;
  isRelay: boolean;
}

export interface PeerCapability {
  type: "payment" | "relay" | "vault" | "ritual" | "ai_agent";
  version: string;
  metadata?: Record<string, any>;
}

export interface MeshMessage {
  id: string;
  type: MeshMessageType;
  fromPeerId: string;
  toPeerId: string;
  payload: any;
  timestamp: Date;
  ttl: number;
  signature: string;
  hops: string[];
}

export type MeshMessageType =
  | "transaction"
  | "discovery"
  | "heartbeat"
  | "relay"
  | "sync"
  | "ritual"
  | "cover_traffic";

export interface TransactionPayload {
  amount: number;
  currency: string;
  ritual: string;
  message?: string;
  nonce: string;
}

export interface DiscoveryPayload {
  nodeInfo: {
    id: string;
    name: string;
    publicKey: string;
    capabilities: PeerCapability[];
    trustScore: number;
  };
}

export interface RelayNode {
  id: string;
  publicKey: string;
  capacity: number;
  currentLoad: number;
  reliability: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface MeshTopology {
  nodes: MeshPeer[];
  connections: Array<{
    from: string;
    to: string;
    strength: number;
    latency: number;
  }>;
  relayNodes: RelayNode[];
}

export interface BluetoothState {
  isEnabled: boolean;
  isScanning: boolean;
  isAdvertising: boolean;
  peers: MeshPeer[];
  connectedPeers: MeshPeer[];
  peerCount: number;
  meshTopology: MeshTopology;
  messageQueue: MeshMessage[];
}

export interface BluetoothContextType extends BluetoothState {
  enableBluetooth: () => Promise<void>;
  disableBluetooth: () => Promise<void>;
  startScanning: () => Promise<void>;
  stopScanning: () => Promise<void>;
  connectToPeer: (peerId: string) => Promise<void>;
  disconnectFromPeer: (peerId: string) => Promise<void>;
  sendMessage: (message: MeshMessage) => Promise<void>;
  broadcastMessage: (
    message: Omit<MeshMessage, "id" | "timestamp" | "signature">,
  ) => Promise<void>;
  startRelay: () => Promise<void>;
  stopRelay: () => Promise<void>;
}
