import { EventEmitter } from "events";
import { randomBytes } from "crypto";

export interface DiscoveryConfig {
  scanInterval?: number;
  advertisementInterval?: number;
  rssiThreshold?: number;
  discoveryTimeout?: number;
  maxRetries?: number;
}

export interface BLECharacteristic {
  uuid: string;
  properties: string[];
  value?: Buffer;
}

export interface BLEService {
  uuid: string;
  characteristics: Map<string, BLECharacteristic>;
}

export interface BLEDevice {
  id: string;
  name?: string;
  rssi: number;
  services: Map<string, BLEService>;
  lastSeen: Date;
  manufacturerData?: Buffer;
  serviceData?: Map<string, Buffer>;
}

// VaultTap BLE Service UUIDs
export const VAULTTAP_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
export const MESH_CHARACTERISTIC_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
export const VAULT_CHARACTERISTIC_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
export const TRUST_CHARACTERISTIC_UUID = "6E400004-B5A3-F393-E0A9-E50E24DCCA9E";

export class PeerDiscovery extends EventEmitter {
  private nodeId: string;
  private deviceName: string;
  private config: DiscoveryConfig;
  private isScanning = false;
  private isAdvertising = false;
  private discoveredDevices = new Map<string, BLEDevice>();
  private scanTimer?: NodeJS.Timer;
  private advertisementTimer?: NodeJS.Timer;
  private cleanupTimer?: NodeJS.Timer;

  constructor(
    nodeId: string,
    deviceName: string,
    config: DiscoveryConfig = {},
  ) {
    super();

    this.nodeId = nodeId;
    this.deviceName = deviceName;
    this.config = {
      scanInterval: 5000, // 5 seconds
      advertisementInterval: 2000, // 2 seconds
      rssiThreshold: -80, // dBm
      discoveryTimeout: 30000, // 30 seconds
      maxRetries: 3,
      ...config,
    };
  }

  async start(): Promise<void> {
    if (this.isScanning || this.isAdvertising) {
      throw new Error("Discovery already running");
    }

    try {
      await this.startScanning();
      await this.startAdvertising();
      this.startCleanup();

      console.log(`Peer discovery started for node: ${this.nodeId}`);
    } catch (error) {
      this.emit("discoveryError", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.stopScanning();
    await this.stopAdvertising();
    this.stopCleanup();

    this.discoveredDevices.clear();
    console.log(`Peer discovery stopped for node: ${this.nodeId}`);
  }

  private async startScanning(): Promise<void> {
    this.isScanning = true;

    this.scanTimer = setInterval(async () => {
      try {
        await this.performScan();
      } catch (error) {
        this.emit("scanError", error);
      }
    }, this.config.scanInterval);

    // Perform initial scan
    await this.performScan();
  }

  private async stopScanning(): Promise<void> {
    this.isScanning = false;

    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = undefined;
    }
  }

  private async startAdvertising(): Promise<void> {
    this.isAdvertising = true;

    this.advertisementTimer = setInterval(async () => {
      try {
        await this.performAdvertisement();
      } catch (error) {
        this.emit("advertisementError", error);
      }
    }, this.config.advertisementInterval);

    // Perform initial advertisement
    await this.performAdvertisement();
  }

  private async stopAdvertising(): Promise<void> {
    this.isAdvertising = false;

    if (this.advertisementTimer) {
      clearInterval(this.advertisementTimer);
      this.advertisementTimer = undefined;
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleDevices();
    }, 10000); // Clean every 10 seconds
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private async performScan(): Promise<void> {
    // Simulate BLE scanning - in real implementation, this would use platform-specific BLE APIs
    const mockDevices = this.generateMockDevices();

    for (const device of mockDevices) {
      if (device.rssi >= this.config.rssiThreshold!) {
        await this.handleDeviceDiscovered(device);
      }
    }
  }

  private async performAdvertisement(): Promise<void> {
    // Simulate BLE advertisement - in real implementation, this would broadcast our presence
    const advertisementData = this.createAdvertisementData();

    // Mock: Notify other devices of our presence
    this.emit("advertisementSent", {
      nodeId: this.nodeId,
      deviceName: this.deviceName,
      data: advertisementData,
    });
  }

  private createAdvertisementData(): Buffer {
    const nodeIdBuffer = Buffer.from(this.nodeId, "hex");
    const deviceNameBuffer = Buffer.from(this.deviceName, "utf8");
    const timestamp = Buffer.alloc(8);
    timestamp.writeBigUInt64BE(BigInt(Date.now()));

    const capabilities = Buffer.from(
      JSON.stringify(["vault-operations", "mesh-routing", "trust-scoring"]),
    );

    return Buffer.concat([
      Buffer.from([nodeIdBuffer.length]),
      nodeIdBuffer,
      Buffer.from([deviceNameBuffer.length]),
      deviceNameBuffer,
      timestamp,
      Buffer.from([capabilities.length]),
      capabilities,
    ]);
  }

  private generateMockDevices(): BLEDevice[] {
    // Generate 1-5 mock nearby devices for simulation
    const deviceCount = Math.floor(Math.random() * 5) + 1;
    const devices: BLEDevice[] = [];

    for (let i = 0; i < deviceCount; i++) {
      const deviceId = randomBytes(8).toString("hex");
      const rssi = -30 - Math.floor(Math.random() * 60); // -30 to -90 dBm

      const device: BLEDevice = {
        id: deviceId,
        name: `VaultTap-${deviceId.slice(0, 8)}`,
        rssi,
        services: new Map([
          [
            VAULTTAP_SERVICE_UUID,
            {
              uuid: VAULTTAP_SERVICE_UUID,
              characteristics: new Map([
                [
                  MESH_CHARACTERISTIC_UUID,
                  {
                    uuid: MESH_CHARACTERISTIC_UUID,
                    properties: ["read", "write", "notify"],
                    value: randomBytes(20),
                  },
                ],
                [
                  VAULT_CHARACTERISTIC_UUID,
                  {
                    uuid: VAULT_CHARACTERISTIC_UUID,
                    properties: ["read", "write"],
                    value: randomBytes(32),
                  },
                ],
                [
                  TRUST_CHARACTERISTIC_UUID,
                  {
                    uuid: TRUST_CHARACTERISTIC_UUID,
                    properties: ["read", "notify"],
                    value: Buffer.from(
                      JSON.stringify({ trustScore: Math.random() }),
                    ),
                  },
                ],
              ]),
            },
          ],
        ]),
        lastSeen: new Date(),
        manufacturerData: randomBytes(10),
        serviceData: new Map([[VAULTTAP_SERVICE_UUID, randomBytes(16)]]),
      };

      devices.push(device);
    }

    return devices;
  }

  private async handleDeviceDiscovered(device: BLEDevice): Promise<void> {
    const existingDevice = this.discoveredDevices.get(device.id);

    if (existingDevice) {
      // Update existing device
      existingDevice.rssi = device.rssi;
      existingDevice.lastSeen = new Date();
      this.emit("deviceUpdated", existingDevice);
    } else {
      // New device discovered
      this.discoveredDevices.set(device.id, device);

      // Check if it's a VaultTap device
      if (await this.isVaultTapDevice(device)) {
        const meshNode = await this.createMeshNodeFromDevice(device);
        this.emit("peerDiscovered", meshNode);
      }

      this.emit("deviceDiscovered", device);
    }
  }

  private async isVaultTapDevice(device: BLEDevice): Promise<boolean> {
    return (
      device.services.has(VAULTTAP_SERVICE_UUID) &&
      device.name?.startsWith("VaultTap-") === true
    );
  }

  private async createMeshNodeFromDevice(device: BLEDevice): Promise<any> {
    const vaultTapService = device.services.get(VAULTTAP_SERVICE_UUID);
    const trustCharacteristic = vaultTapService?.characteristics.get(
      TRUST_CHARACTERISTIC_UUID,
    );

    let trustScore = 0.5; // Default trust score
    if (trustCharacteristic?.value) {
      try {
        const trustData = JSON.parse(trustCharacteristic.value.toString());
        trustScore = trustData.trustScore || 0.5;
      } catch (error) {
        // Use default trust score if parsing fails
      }
    }

    return {
      id: device.id,
      deviceName: device.name || `Unknown-${device.id.slice(0, 8)}`,
      lastSeen: device.lastSeen,
      signalStrength: device.rssi,
      capabilities: ["mesh-routing", "vault-operations"],
      trustScore,
    };
  }

  private cleanupStaleDevices(): void {
    const now = Date.now();
    const timeout = this.config.discoveryTimeout!;

    for (const [deviceId, device] of this.discoveredDevices) {
      if (now - device.lastSeen.getTime() > timeout) {
        this.discoveredDevices.delete(deviceId);
        this.emit("deviceLost", deviceId);

        // If it was a VaultTap peer, emit peer lost event
        if (device.name?.startsWith("VaultTap-")) {
          this.emit("peerLost", deviceId);
        }
      }
    }
  }

  // Public methods
  getDiscoveredDevices(): BLEDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  getVaultTapPeers(): BLEDevice[] {
    return this.getDiscoveredDevices().filter((device) =>
      device.services.has(VAULTTAP_SERVICE_UUID),
    );
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    const device = this.discoveredDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Simulate connection attempt
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        if (success) {
          this.emit("deviceConnected", device);
        } else {
          this.emit("deviceConnectionFailed", deviceId);
        }
        resolve(success);
      }, 1000);
    });
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    const device = this.discoveredDevices.get(deviceId);
    if (device) {
      this.emit("deviceDisconnected", device);
    }
  }

  get status() {
    return {
      isScanning: this.isScanning,
      isAdvertising: this.isAdvertising,
      discoveredDeviceCount: this.discoveredDevices.size,
      vaultTapPeerCount: this.getVaultTapPeers().length,
    };
  }
}
