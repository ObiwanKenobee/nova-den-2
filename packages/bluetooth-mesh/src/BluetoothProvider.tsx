import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { BleManager, Device, State } from "react-native-ble-plx";
import {
  BluetoothContextType,
  BluetoothState,
  MeshMessage,
  MeshPeer,
} from "./types";
import { MeshNode } from "./meshNode";
import { PeerDiscovery } from "./peerDiscovery";
import { Encryption } from "./encryption";

const BluetoothContext = createContext<BluetoothContextType | null>(null);

interface BluetoothProviderProps {
  children: ReactNode;
}

const initialState: BluetoothState = {
  isEnabled: false,
  isScanning: false,
  isAdvertising: false,
  peers: [],
  connectedPeers: [],
  peerCount: 0,
  meshTopology: {
    nodes: [],
    connections: [],
    relayNodes: [],
  },
  messageQueue: [],
};

type BluetoothAction =
  | { type: "SET_ENABLED"; payload: boolean }
  | { type: "SET_SCANNING"; payload: boolean }
  | { type: "SET_ADVERTISING"; payload: boolean }
  | { type: "ADD_PEER"; payload: MeshPeer }
  | { type: "REMOVE_PEER"; payload: string }
  | { type: "UPDATE_PEER"; payload: MeshPeer }
  | { type: "SET_PEERS"; payload: MeshPeer[] }
  | { type: "ADD_CONNECTED_PEER"; payload: MeshPeer }
  | { type: "REMOVE_CONNECTED_PEER"; payload: string }
  | { type: "ADD_MESSAGE"; payload: MeshMessage }
  | { type: "REMOVE_MESSAGE"; payload: string };

function bluetoothReducer(
  state: BluetoothState,
  action: BluetoothAction,
): BluetoothState {
  switch (action.type) {
    case "SET_ENABLED":
      return { ...state, isEnabled: action.payload };
    case "SET_SCANNING":
      return { ...state, isScanning: action.payload };
    case "SET_ADVERTISING":
      return { ...state, isAdvertising: action.payload };
    case "ADD_PEER":
      return {
        ...state,
        peers: [
          ...state.peers.filter((p) => p.id !== action.payload.id),
          action.payload,
        ],
        peerCount:
          state.peers.filter((p) => p.id !== action.payload.id).length + 1,
      };
    case "REMOVE_PEER":
      return {
        ...state,
        peers: state.peers.filter((p) => p.id !== action.payload),
        peerCount: state.peers.filter((p) => p.id !== action.payload).length,
      };
    case "UPDATE_PEER":
      return {
        ...state,
        peers: state.peers.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };
    case "SET_PEERS":
      return {
        ...state,
        peers: action.payload,
        peerCount: action.payload.length,
      };
    case "ADD_CONNECTED_PEER":
      return {
        ...state,
        connectedPeers: [
          ...state.connectedPeers.filter((p) => p.id !== action.payload.id),
          action.payload,
        ],
      };
    case "REMOVE_CONNECTED_PEER":
      return {
        ...state,
        connectedPeers: state.connectedPeers.filter(
          (p) => p.id !== action.payload,
        ),
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messageQueue: [...state.messageQueue, action.payload],
      };
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messageQueue: state.messageQueue.filter((m) => m.id !== action.payload),
      };
    default:
      return state;
  }
}

export function BluetoothProvider({ children }: BluetoothProviderProps) {
  const [state, dispatch] = useReducer(bluetoothReducer, initialState);
  const bleManager = new BleManager();
  const meshNode = new MeshNode();
  const peerDiscovery = new PeerDiscovery(bleManager);
  const encryption = new Encryption();

  useEffect(() => {
    // Initialize Bluetooth
    const subscription = bleManager.onStateChange((state) => {
      dispatch({ type: "SET_ENABLED", payload: state === State.PoweredOn });
    }, true);

    return () => subscription.remove();
  }, []);

  const enableBluetooth = async () => {
    try {
      await bleManager.enable();
      dispatch({ type: "SET_ENABLED", payload: true });

      // Start advertising our presence
      await startAdvertising();
    } catch (error) {
      console.error("Failed to enable Bluetooth:", error);
    }
  };

  const disableBluetooth = async () => {
    await stopScanning();
    await stopAdvertising();
    dispatch({ type: "SET_ENABLED", payload: false });
  };

  const startScanning = async () => {
    if (!state.isEnabled) return;

    try {
      dispatch({ type: "SET_SCANNING", payload: true });

      await peerDiscovery.startScanning((peer) => {
        dispatch({ type: "ADD_PEER", payload: peer });
      });
    } catch (error) {
      console.error("Failed to start scanning:", error);
      dispatch({ type: "SET_SCANNING", payload: false });
    }
  };

  const stopScanning = async () => {
    await peerDiscovery.stopScanning();
    dispatch({ type: "SET_SCANNING", payload: false });
  };

  const startAdvertising = async () => {
    try {
      dispatch({ type: "SET_ADVERTISING", payload: true });
      await meshNode.startAdvertising();
    } catch (error) {
      console.error("Failed to start advertising:", error);
      dispatch({ type: "SET_ADVERTISING", payload: false });
    }
  };

  const stopAdvertising = async () => {
    await meshNode.stopAdvertising();
    dispatch({ type: "SET_ADVERTISING", payload: false });
  };

  const connectToPeer = async (peerId: string) => {
    const peer = state.peers.find((p) => p.id === peerId);
    if (!peer) return;

    try {
      await meshNode.connectToPeer(peer);
      dispatch({ type: "ADD_CONNECTED_PEER", payload: peer });
    } catch (error) {
      console.error("Failed to connect to peer:", error);
    }
  };

  const disconnectFromPeer = async (peerId: string) => {
    await meshNode.disconnectFromPeer(peerId);
    dispatch({ type: "REMOVE_CONNECTED_PEER", payload: peerId });
  };

  const sendMessage = async (message: MeshMessage) => {
    try {
      const encryptedMessage = await encryption.encryptMessage(message);
      await meshNode.sendMessage(encryptedMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const broadcastMessage = async (
    message: Omit<MeshMessage, "id" | "timestamp" | "signature">,
  ) => {
    const fullMessage: MeshMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      signature: await encryption.signMessage(message),
      hops: [],
    };

    await sendMessage(fullMessage);
  };

  const startRelay = async () => {
    await meshNode.startRelay();
  };

  const stopRelay = async () => {
    await meshNode.stopRelay();
  };

  const value: BluetoothContextType = {
    ...state,
    enableBluetooth,
    disableBluetooth,
    startScanning,
    stopScanning,
    connectToPeer,
    disconnectFromPeer,
    sendMessage,
    broadcastMessage,
    startRelay,
    stopRelay,
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth(): BluetoothContextType {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
}
