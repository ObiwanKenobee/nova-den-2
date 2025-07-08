import React, { useState, useEffect, useRef } from "react";
import {
  Wifi,
  Users,
  Globe,
  Zap,
  Signal,
  MapPin,
  Activity,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MeshNode {
  id: string;
  deviceId: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  status: "active" | "inactive" | "maintenance";
  trustScore: number;
  signalStrength: number;
  batteryLevel: number;
  lastSeen: Date;
  connections: string[];
  throughput: {
    sent: number;
    received: number;
  };
  nodeType: "mobile" | "fixed" | "drone" | "satellite";
  capabilities: string[];
}

interface MeshNetwork {
  nodes: MeshNode[];
  totalConnections: number;
  averageLatency: number;
  networkHealth: number;
  coverage: {
    countries: number;
    regions: number;
    activeNodes: number;
  };
  performance: {
    messagesRouted: number;
    successRate: number;
    avgHops: number;
  };
}

export default function MeshNetworkVisualization() {
  const [meshNetwork, setMeshNetwork] = useState<MeshNetwork | null>(null);
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [viewMode, setViewMode] = useState<"global" | "regional" | "local">(
    "global",
  );
  const [activeTab, setActiveTab] = useState("overview");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadMeshData();
    const interval = setInterval(loadMeshData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMeshData = async () => {
    try {
      // Simulate mesh network data
      const mockNetwork: MeshNetwork = {
        nodes: [
          {
            id: "node_001",
            deviceId: "VT-KE-001",
            location: {
              lat: -1.2921,
              lng: 36.8219,
              country: "Kenya",
              region: "Nairobi",
            },
            status: "active",
            trustScore: 0.95,
            signalStrength: 85,
            batteryLevel: 73,
            lastSeen: new Date(Date.now() - 30000),
            connections: ["node_002", "node_005", "node_012"],
            throughput: { sent: 1250, received: 980 },
            nodeType: "mobile",
            capabilities: [
              "ritual_verification",
              "payment_relay",
              "vault_sync",
            ],
          },
          {
            id: "node_002",
            deviceId: "VT-UG-001",
            location: {
              lat: 0.3476,
              lng: 32.5825,
              country: "Uganda",
              region: "Kampala",
            },
            status: "active",
            trustScore: 0.88,
            signalStrength: 92,
            batteryLevel: 45,
            lastSeen: new Date(Date.now() - 15000),
            connections: ["node_001", "node_003", "node_007"],
            throughput: { sent: 890, received: 1150 },
            nodeType: "fixed",
            capabilities: ["mesh_relay", "data_storage", "emergency_beacon"],
          },
          {
            id: "node_003",
            deviceId: "VT-TZ-001",
            location: {
              lat: -6.7924,
              lng: 39.2083,
              country: "Tanzania",
              region: "Dar es Salaam",
            },
            status: "active",
            trustScore: 0.92,
            signalStrength: 78,
            batteryLevel: 89,
            lastSeen: new Date(Date.now() - 45000),
            connections: ["node_002", "node_004", "node_008"],
            throughput: { sent: 1450, received: 1320 },
            nodeType: "drone",
            capabilities: [
              "aerial_relay",
              "disaster_response",
              "coverage_extension",
            ],
          },
          {
            id: "node_004",
            deviceId: "VT-SAT-001",
            location: {
              lat: 0,
              lng: 0,
              country: "Satellite",
              region: "Low Earth Orbit",
            },
            status: "active",
            trustScore: 0.99,
            signalStrength: 100,
            batteryLevel: 100,
            lastSeen: new Date(Date.now() - 5000),
            connections: ["node_003", "node_005", "node_006"],
            throughput: { sent: 5800, received: 4900 },
            nodeType: "satellite",
            capabilities: [
              "global_backbone",
              "interplanetary_relay",
              "emergency_override",
            ],
          },
        ],
        totalConnections: 12,
        averageLatency: 245,
        networkHealth: 94.5,
        coverage: {
          countries: 15,
          regions: 45,
          activeNodes: 156,
        },
        performance: {
          messagesRouted: 24850,
          successRate: 98.7,
          avgHops: 2.3,
        },
      };

      setMeshNetwork(mockNetwork);
    } catch (error) {
      console.error("Failed to load mesh data:", error);
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "inactive":
        return "text-red-500";
      case "maintenance":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getNodeTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case "mobile":
        return <Users className="w-4 h-4" />;
      case "fixed":
        return <Wifi className="w-4 h-4" />;
      case "drone":
        return <Zap className="w-4 h-4" />;
      case "satellite":
        return <Globe className="w-4 h-4" />;
      default:
        return <Signal className="w-4 h-4" />;
    }
  };

  const formatThroughput = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${bytes}B`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!meshNetwork) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading mesh network...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {meshNetwork.coverage.activeNodes}
                </p>
                <p className="text-sm text-muted-foreground">Active Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {meshNetwork.networkHealth}%
                </p>
                <p className="text-sm text-muted-foreground">Network Health</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {meshNetwork.performance.messagesRouted.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Messages Routed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {meshNetwork.averageLatency}ms
                </p>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nodes">Node Details</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="map">Network Map</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Countries Covered</span>
                  <Badge variant="secondary">
                    {meshNetwork.coverage.countries}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Regions Active</span>
                  <Badge variant="secondary">
                    {meshNetwork.coverage.regions}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <Badge variant="default">
                    {meshNetwork.performance.successRate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Hops</span>
                  <Badge variant="outline">
                    {meshNetwork.performance.avgHops}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm">New node joined: VT-KE-002</p>
                    <p className="text-xs text-muted-foreground">
                      2 minutes ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Ritual verification completed</p>
                    <p className="text-xs text-muted-foreground">
                      5 minutes ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Payment relay successful</p>
                    <p className="text-xs text-muted-foreground">
                      8 minutes ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Satellite uplink established</p>
                    <p className="text-xs text-muted-foreground">
                      12 minutes ago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid gap-4">
            {meshNetwork.nodes.map((node) => (
              <Card
                key={node.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedNode(node)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getNodeTypeIcon(node.nodeType)}
                      <div>
                        <p className="font-medium">{node.deviceId}</p>
                        <p className="text-sm text-muted-foreground">
                          {node.location.region}, {node.location.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Trust Score</p>
                        <p className="font-bold text-green-500">
                          {(node.trustScore * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Signal</p>
                        <p className="font-bold">{node.signalStrength}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Battery</p>
                        <p
                          className={cn(
                            "font-bold",
                            node.batteryLevel > 50
                              ? "text-green-500"
                              : "text-orange-500",
                          )}
                        >
                          {node.batteryLevel}%
                        </p>
                      </div>
                      <Badge className={getNodeStatusColor(node.status)}>
                        {node.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Throughput
                      </p>
                      <p className="text-sm">
                        ↑ {formatThroughput(node.throughput.sent)} / ↓{" "}
                        {formatThroughput(node.throughput.received)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Seen</p>
                      <p className="text-sm">{formatTimeAgo(node.lastSeen)}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Capabilities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {node.capabilities.map((capability) => (
                        <Badge
                          key={capability}
                          variant="outline"
                          className="text-xs"
                        >
                          {capability.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Routing Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">
                        {meshNetwork.performance.successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${meshNetwork.performance.successRate}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Network Health</span>
                      <span className="text-sm font-medium">
                        {meshNetwork.networkHealth}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${meshNetwork.networkHealth}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Messages Routed</span>
                      <span className="font-medium">
                        {meshNetwork.performance.messagesRouted.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Hops</span>
                      <span className="font-medium">
                        {meshNetwork.performance.avgHops}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Latency</span>
                      <span className="font-medium">
                        {meshNetwork.averageLatency}ms
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Node Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    meshNetwork.nodes.reduce(
                      (acc, node) => {
                        acc[node.nodeType] = (acc[node.nodeType] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {getNodeTypeIcon(type)}
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / meshNetwork.nodes.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Global Mesh Network Map</span>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === "global" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("global")}
                  >
                    Global
                  </Button>
                  <Button
                    variant={viewMode === "regional" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("regional")}
                  >
                    Regional
                  </Button>
                  <Button
                    variant={viewMode === "local" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("local")}
                  >
                    Local
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  width={800}
                  height={384}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">
                      Interactive mesh network map
                    </p>
                    <p className="text-sm text-gray-500">
                      {meshNetwork.nodes.length} nodes across{" "}
                      {meshNetwork.coverage.countries} countries
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Node Details Modal */}
      {selectedNode && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Node Details: {selectedNode.deviceId}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {selectedNode.location.region},{" "}
                  {selectedNode.location.country}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedNode.location.lat.toFixed(4)},{" "}
                  {selectedNode.location.lng.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Node Type</p>
                <div className="flex items-center space-x-2">
                  {getNodeTypeIcon(selectedNode.nodeType)}
                  <span className="capitalize">{selectedNode.nodeType}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trust Score</p>
                <p className="font-medium text-green-500">
                  {(selectedNode.trustScore * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signal Strength</p>
                <p className="font-medium">{selectedNode.signalStrength}%</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Connected Nodes
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedNode.connections.map((connId) => {
                  const connectedNode = meshNetwork.nodes.find(
                    (n) => n.id === connId,
                  );
                  return (
                    <Badge key={connId} variant="outline">
                      {connectedNode?.deviceId || connId}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {selectedNode.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary">
                    {capability.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
