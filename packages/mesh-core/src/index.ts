export { VaultTapMesh } from "./initMesh";
export { PeerDiscovery } from "./peerDiscovery";
export { MessageRelayEngine } from "./messageRelayEngine";
export { MeshShard } from "./meshShard";

export type { MeshConfig, MeshNode, MeshPacket } from "./initMesh";

export type {
  DiscoveryConfig,
  BLECharacteristic,
  BLEService,
  BLEDevice,
} from "./peerDiscovery";

export type {
  RelayConfig,
  RouteMetrics,
  RoutingEntry,
  MessagePacket,
  QueuedMessage,
} from "./messageRelayEngine";

export type { Shard, ShardMetadata, ReassemblyStatus } from "./meshShard";

export const VAULTTAP_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
export const MESH_CHARACTERISTIC_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
export const VAULT_CHARACTERISTIC_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
export const TRUST_CHARACTERISTIC_UUID = "6E400004-B5A3-F393-E0A9-E50E24DCCA9E";

// Utility functions
export {
  createShardId,
  parseShardId,
  validateShardSequence,
} from "./meshShard";
