import { VaultTapMesh } from "./initMesh";

async function testMeshRouting() {
  console.log("Starting VaultTap Mesh Routing Test...");

  // Create test nodes
  const node1 = new VaultTapMesh({
    nodeId: "node1",
    deviceName: "VaultTap-Node1",
    maxPeers: 10,
  });

  const node2 = new VaultTapMesh({
    nodeId: "node2",
    deviceName: "VaultTap-Node2",
    maxPeers: 10,
  });

  const node3 = new VaultTapMesh({
    nodeId: "node3",
    deviceName: "VaultTap-Node3",
    maxPeers: 10,
  });

  try {
    // Initialize nodes
    await Promise.all([
      node1.initialize(),
      node2.initialize(),
      node3.initialize(),
    ]);

    console.log("All nodes initialized successfully");

    // Test message sending
    const testMessage = Buffer.from("Hello from node1 to node3 via mesh!");

    const packetId = await node1.sendPacket("node3", testMessage, "high");
    console.log(`Sent packet ${packetId} from node1 to node3`);

    // Wait for propagation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check node statuses
    console.log("Node 1 Info:", node1.nodeInfo);
    console.log("Node 2 Info:", node2.nodeInfo);
    console.log("Node 3 Info:", node3.nodeInfo);

    console.log("Node 1 Routes:", node1.routes);
    console.log("Node 2 Routes:", node2.routes);
    console.log("Node 3 Routes:", node3.routes);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Cleanup
    await Promise.all([node1.shutdown(), node2.shutdown(), node3.shutdown()]);

    console.log("Test completed and nodes shut down");
  }
}

if (require.main === module) {
  testMeshRouting().catch(console.error);
}

export { testMeshRouting };
