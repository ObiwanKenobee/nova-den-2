import { RequestHandler } from "express";
import { WalletBalance, DashboardResponse, WalletStats } from "@shared/api";

// Mock data - in production this would connect to your database
const mockUser = {
  id: "user_123",
  publicKey: "0x1234...abcd",
  createdAt: new Date("2024-01-15"),
  lastActive: new Date(),
};

const mockTransactions = [
  {
    id: "tx_001",
    fromUserId: "user_456",
    toUserId: "user_123",
    fromPeer: "Maya's Maize Stand",
    toPeer: "You",
    amount: 50.0,
    currency: "VT" as const,
    status: "completed" as const,
    type: "received" as const,
    message: "Payment for maize",
    ritual: "harvest blessing",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    networkFee: 0.01,
    signature: "0xabc123...",
  },
  {
    id: "tx_002",
    fromUserId: "user_123",
    toUserId: "user_789",
    fromPeer: "You",
    toPeer: "Kwame (Elder)",
    amount: 25.5,
    currency: "VT" as const,
    status: "completed" as const,
    type: "sent" as const,
    ritual: "elder witness",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    networkFee: 0.01,
    signature: "0xdef456...",
  },
  {
    id: "tx_003",
    fromUserId: "user_999",
    toUserId: "user_123",
    fromPeer: "UN Relief Mesh",
    toPeer: "You",
    amount: 100.0,
    currency: "VT" as const,
    status: "pending" as const,
    type: "received" as const,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    networkFee: 0.01,
    signature: "0xghi789...",
  },
];

const mockVaults = [
  {
    id: "vault_001",
    userId: "user_123",
    name: "Personal Savings",
    type: "personal" as const,
    balance: 847.83,
    yieldRate: 5.2,
    isLocked: false,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "vault_002",
    userId: "user_123",
    name: "Harvest Cooperative",
    type: "cooperative" as const,
    balance: 325.0,
    yieldRate: 8.5,
    isLocked: true,
    participants: ["user_123", "user_456", "user_789"],
    participantCount: 12,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "vault_003",
    userId: "user_123",
    name: "Community Relief",
    type: "community" as const,
    balance: 75.0,
    yieldRate: 3.1,
    isLocked: false,
    participantCount: 45,
    createdAt: new Date("2024-02-08"),
  },
];

const mockBluetoothStatus = {
  status: "connected" as const,
  peerCount: 5,
  peers: [
    {
      id: "peer_001",
      name: "Maya's Maize Stand",
      publicKey: "0x5678...efgh",
      distance: "2m",
      signalStrength: 5,
      lastSeen: new Date(),
      isOnline: true,
      capabilities: ["payments", "relay"],
    },
  ],
};

export const getBalance: RequestHandler = (req, res) => {
  const balance: WalletBalance = {
    totalBalance: 1247.83,
    availableBalance: 1172.83,
    lockedBalance: 75.0,
    currency: "VT",
  };

  res.json({
    success: true,
    data: balance,
  });
};

export const getDashboard: RequestHandler = (req, res) => {
  const stats: WalletStats = {
    totalTransactions: 24,
    totalVolume: 2450.75,
    averageTransactionSize: 102.11,
    activeVaults: 3,
    totalYieldEarned: 156.32,
    meshConnections: 5,
    uptime: 98.5,
  };

  const dashboardData: DashboardResponse = {
    user: mockUser,
    balance: {
      totalBalance: 1247.83,
      availableBalance: 1172.83,
      lockedBalance: 75.0,
      currency: "VT",
    },
    recentTransactions: mockTransactions,
    vaults: mockVaults,
    bluetoothStatus: mockBluetoothStatus,
    stats,
  };

  res.json({
    success: true,
    data: dashboardData,
  });
};

export const getTransactionHistory: RequestHandler = (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  res.json({
    success: true,
    data: {
      transactions: mockTransactions,
      total: mockTransactions.length,
      page,
      limit,
    },
  });
};
