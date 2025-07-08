import { RequestHandler } from "express";
import {
  BluetoothStatus,
  BluetoothPeer,
  DiscoverPeersResponse,
} from "@shared/api";

const mockPeers: BluetoothPeer[] = [
  {
    id: "peer_001",
    name: "Maya's Maize Stand",
    publicKey: "0x5678...efgh",
    distance: "2m",
    signalStrength: 5,
    lastSeen: new Date(Date.now() - 1000),
    isOnline: true,
    capabilities: ["payments", "relay", "marketplace"],
  },
  {
    id: "peer_002",
    name: "Kwame (Elder)",
    publicKey: "0x9abc...ijkl",
    distance: "5m",
    signalStrength: 4,
    lastSeen: new Date(Date.now() - 60000),
    isOnline: true,
    capabilities: ["payments", "elder_auth", "ritual"],
  },
  {
    id: "peer_003",
    name: "Local Coop Fund",
    publicKey: "0xdef0...mnop",
    distance: "8m",
    signalStrength: 3,
    lastSeen: new Date(Date.now() - 120000),
    isOnline: true,
    capabilities: ["payments", "cooperative", "lending"],
  },
  {
    id: "peer_004",
    name: "Market Hub",
    publicKey: "0x1234...qrst",
    distance: "12m",
    signalStrength: 2,
    lastSeen: new Date(Date.now() - 300000),
    isOnline: true,
    capabilities: ["payments", "relay", "hub"],
  },
  {
    id: "peer_005",
    name: "Village Bank Node",
    publicKey: "0x5678...uvwx",
    distance: "15m",
    signalStrength: 1,
    lastSeen: new Date(Date.now() - 600000),
    isOnline: false,
    capabilities: ["payments", "banking", "sync"],
  },
];

export const getBluetoothStatus: RequestHandler = (req, res) => {
  const status: BluetoothStatus = {
    status: "connected",
    peerCount: mockPeers.filter((p) => p.isOnline).length,
    peers: mockPeers.filter((p) => p.isOnline),
  };

  res.json({
    success: true,
    data: status,
  });
};

export const discoverPeers: RequestHandler = (req, res) => {
  const scanDuration = Math.random() * 3000 + 2000; // 2-5 seconds

  // Simulate discovery delay
  setTimeout(() => {
    const discoveredPeers = mockPeers.filter(() => Math.random() > 0.3); // Randomly show some peers

    const response: DiscoverPeersResponse = {
      peers: discoveredPeers,
      scanDuration: Math.round(scanDuration),
    };

    res.json({
      success: true,
      data: response,
    });
  }, 1000);
};

export const connectToPeer: RequestHandler = (req, res) => {
  const { peerId } = req.params;
  const peer = mockPeers.find((p) => p.id === peerId);

  if (!peer) {
    return res.status(404).json({
      success: false,
      error: "Peer not found",
    });
  }

  // Simulate connection attempt
  const connectionSuccess = Math.random() > 0.2; // 80% success rate

  if (connectionSuccess) {
    peer.isOnline = true;
    peer.lastSeen = new Date();

    res.json({
      success: true,
      data: {
        peer,
        connectionTime: Date.now(),
        message: `Connected to ${peer.name}`,
      },
    });
  } else {
    res.status(500).json({
      success: false,
      error: "Failed to connect to peer",
    });
  }
};

export const disconnectFromPeer: RequestHandler = (req, res) => {
  const { peerId } = req.params;
  const peer = mockPeers.find((p) => p.id === peerId);

  if (!peer) {
    return res.status(404).json({
      success: false,
      error: "Peer not found",
    });
  }

  peer.isOnline = false;

  res.json({
    success: true,
    data: {
      message: `Disconnected from ${peer.name}`,
    },
  });
};

export const enableBluetooth: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Bluetooth enabled",
      status: "connected",
    },
  });
};

export const disableBluetooth: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Bluetooth disabled",
      status: "disconnected",
    },
  });
};

export const startMeshRelay: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Mesh relay started",
      relayCapacity: 10,
      activeConnections: 3,
    },
  });
};

export const stopMeshRelay: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Mesh relay stopped",
    },
  });
};
