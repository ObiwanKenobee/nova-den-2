// Base types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User and Wallet types
export interface User {
  id: string;
  publicKey: string;
  createdAt: Date;
  lastActive: Date;
}

export interface WalletBalance {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  currency: "VT";
}

// Bluetooth and Peer types
export interface BluetoothPeer {
  id: string;
  name: string;
  publicKey: string;
  distance: string;
  signalStrength: number;
  lastSeen: Date;
  isOnline: boolean;
  capabilities: string[];
}

export interface BluetoothStatus {
  status: "connected" | "searching" | "disconnected";
  peerCount: number;
  peers: BluetoothPeer[];
}

// Transaction types
export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromPeer?: string;
  toPeer?: string;
  amount: number;
  currency: "VT";
  status: "pending" | "completed" | "failed" | "cancelled";
  type: "sent" | "received";
  message?: string;
  ritual?: string;
  timestamp: Date;
  networkFee: number;
  blockHash?: string;
  signature: string;
}

export interface CreateTransactionRequest {
  toPeerId: string;
  amount: number;
  message?: string;
  ritual: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

// Vault types
export interface Vault {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: "personal" | "cooperative" | "community";
  balance: number;
  yieldRate: number;
  isLocked: boolean;
  participants?: string[];
  participantCount?: number;
  createdAt: Date;
  unlockConditions?: VaultUnlockCondition[];
}

export interface VaultUnlockCondition {
  type: "time" | "ritual" | "consensus" | "amount";
  value: any;
  description: string;
}

export interface CreateVaultRequest {
  name: string;
  description?: string;
  type: "personal" | "cooperative" | "community";
  initialDeposit: number;
  unlockConditions?: VaultUnlockCondition[];
}

export interface VaultOperation {
  vaultId: string;
  operation: "deposit" | "withdraw";
  amount: number;
  ritual?: string;
}

// Ritual types
export interface Ritual {
  id: string;
  name: string;
  description: string;
  type: "voice" | "gesture" | "elder_consensus" | "biometric" | "custom";
  requirements: string[];
  isActive: boolean;
}

export interface RitualVerification {
  ritualId: string;
  userId: string;
  status: "pending" | "verified" | "failed";
  timestamp: Date;
  verifiers?: string[];
}

// Settings types
export interface UserSettings {
  userId: string;
  bluetoothEnabled: boolean;
  autoRelay: boolean;
  coverTraffic: boolean;
  biometricAuth: boolean;
  ritualAuth: boolean;
  autoLock: boolean;
  autoLockTimeout: number;
  emergencyWipeEnabled: boolean;
  emergencyWipePattern?: string;
}

// Mesh Network types
export interface MeshNode {
  id: string;
  userId: string;
  publicKey: string;
  ipAddress?: string;
  port?: number;
  lastPing: Date;
  relayCapacity: number;
  isRelay: boolean;
  connections: string[];
}

export interface MeshMessage {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: "transaction" | "discovery" | "sync" | "cover";
  payload: any;
  timestamp: Date;
  ttl: number;
  signature: string;
}

// Statistics and Analytics
export interface WalletStats {
  totalTransactions: number;
  totalVolume: number;
  averageTransactionSize: number;
  activeVaults: number;
  totalYieldEarned: number;
  meshConnections: number;
  uptime: number;
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalTransactions: number;
  networkVolume: number;
  averageLatency: number;
}

// API Endpoints Response Types
export interface DashboardResponse {
  user: User;
  balance: WalletBalance;
  recentTransactions: Transaction[];
  vaults: Vault[];
  bluetoothStatus: BluetoothStatus;
  stats: WalletStats;
}

export interface SendPaymentResponse {
  transaction: Transaction;
  estimatedConfirmationTime: number;
}

export interface DiscoverPeersResponse {
  peers: BluetoothPeer[];
  scanDuration: number;
}
