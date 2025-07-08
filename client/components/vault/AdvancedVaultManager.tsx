import React, { useState, useEffect, useRef } from "react";
import {
  Vault,
  Shield,
  DNA,
  Key,
  Users,
  Clock,
  TrendingUp,
  Zap,
  Globe,
  Eye,
  EyeOff,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  Brain,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface VaultDNA {
  sequence: string;
  traits: {
    risk_tolerance: number;
    community_affinity: number;
    cultural_preservation: number;
    innovation_index: number;
    trust_coefficient: number;
  };
  behavioral_patterns: {
    transaction_frequency: number;
    seasonal_activity: number;
    cultural_events_correlation: number;
    mesh_participation: number;
  };
  evolution_history: {
    mutations: number;
    adaptations: string[];
    learning_rate: number;
  };
}

interface Vault {
  id: string;
  name: string;
  type: "personal" | "community" | "ritual" | "diaspora";
  status: "active" | "locked" | "dormant" | "evolving";
  balance: number;
  currency: string;
  created: Date;
  lastActivity: Date;
  dna: VaultDNA;
  encryption: {
    algorithm: string;
    keyShards: number;
    sharesRequired: number;
    elderSignatures: string[];
  };
  governance: {
    consensus_threshold: number;
    voting_power: Record<string, number>;
    ritual_requirements: string[];
    cultural_validators: string[];
  };
  yield: {
    rate: number;
    source: "community" | "ritual" | "mesh" | "cultural";
    accumulated: number;
    next_distribution: Date;
  };
  access_control: {
    biometric_required: boolean;
    ritual_verification: boolean;
    elder_approval: boolean;
    time_locks: { unlock_date: Date; reason: string }[];
  };
  mesh_integration: {
    connected_nodes: string[];
    sync_status: "synced" | "syncing" | "offline";
    last_mesh_backup: Date;
    geographic_distribution: string[];
  };
}

interface RitualProof {
  id: string;
  type: string;
  timestamp: Date;
  cultural_context: string;
  verification_status: "pending" | "verified" | "failed";
  zero_knowledge_proof: string;
}

export default function AdvancedVaultManager() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSensitive, setShowSensitive] = useState(false);
  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [dnaVisualization, setDnaVisualization] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadVaults();
    const interval = setInterval(loadVaults, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadVaults = async () => {
    try {
      // Simulate vault data with genomic fingerprinting
      const mockVaults: Vault[] = [
        {
          id: "vault_001",
          name: "Family Heritage Vault",
          type: "community",
          status: "active",
          balance: 12500.75,
          currency: "USD",
          created: new Date(Date.now() - 86400000 * 365), // 1 year ago
          lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
          dna: {
            sequence:
              "ATGCGTACGATCGTAGCTAGCGATCGAAGCTTAGCGATCGTAGCTGATCGATCGTAGCGATCGTAG",
            traits: {
              risk_tolerance: 0.35,
              community_affinity: 0.92,
              cultural_preservation: 0.87,
              innovation_index: 0.63,
              trust_coefficient: 0.94,
            },
            behavioral_patterns: {
              transaction_frequency: 0.75,
              seasonal_activity: 0.82,
              cultural_events_correlation: 0.91,
              mesh_participation: 0.78,
            },
            evolution_history: {
              mutations: 12,
              adaptations: [
                "Harvest season yield optimization",
                "Community consensus adaptation",
                "Cultural event pattern recognition",
              ],
              learning_rate: 0.15,
            },
          },
          encryption: {
            algorithm: "AES-256-GCM + Shamir",
            keyShards: 7,
            sharesRequired: 4,
            elderSignatures: ["elder_001", "elder_003", "elder_007"],
          },
          governance: {
            consensus_threshold: 0.67,
            voting_power: {
              family_head: 0.4,
              elders: 0.35,
              community: 0.25,
            },
            ritual_requirements: ["birth_blessing", "harvest_ceremony"],
            cultural_validators: ["village_council", "traditional_court"],
          },
          yield: {
            rate: 0.08,
            source: "community",
            accumulated: 147.25,
            next_distribution: new Date(Date.now() + 86400000 * 7),
          },
          access_control: {
            biometric_required: true,
            ritual_verification: true,
            elder_approval: false,
            time_locks: [
              {
                unlock_date: new Date(Date.now() + 86400000 * 30),
                reason: "Coming of age ceremony completion",
              },
            ],
          },
          mesh_integration: {
            connected_nodes: ["node_001", "node_005", "node_012"],
            sync_status: "synced",
            last_mesh_backup: new Date(Date.now() - 1800000),
            geographic_distribution: ["Kenya", "Uganda", "Tanzania"],
          },
        },
        {
          id: "vault_002",
          name: "Diaspora Connect Vault",
          type: "diaspora",
          status: "evolving",
          balance: 8750.5,
          currency: "USD",
          created: new Date(Date.now() - 86400000 * 180), // 6 months ago
          lastActivity: new Date(Date.now() - 1800000), // 30 min ago
          dna: {
            sequence:
              "CGATCGTAGCGATCGTACGATCGTAGCGAATCGTAGCGATCGTAGCGATCGTATCGATCGTAG",
            traits: {
              risk_tolerance: 0.72,
              community_affinity: 0.68,
              cultural_preservation: 0.95,
              innovation_index: 0.89,
              trust_coefficient: 0.81,
            },
            behavioral_patterns: {
              transaction_frequency: 0.45,
              seasonal_activity: 0.55,
              cultural_events_correlation: 0.88,
              mesh_participation: 0.92,
            },
            evolution_history: {
              mutations: 8,
              adaptations: [
                "Cross-border transaction optimization",
                "Cultural event synchronization",
                "Language pattern adaptation",
              ],
              learning_rate: 0.22,
            },
          },
          encryption: {
            algorithm: "AES-256-GCM + Shamir",
            keyShards: 9,
            sharesRequired: 5,
            elderSignatures: ["elder_002", "elder_004", "elder_008"],
          },
          governance: {
            consensus_threshold: 0.6,
            voting_power: {
              diaspora_council: 0.45,
              homeland_representatives: 0.35,
              youth_committee: 0.2,
            },
            ritual_requirements: ["cultural_identity_verification"],
            cultural_validators: ["diaspora_council", "cultural_institute"],
          },
          yield: {
            rate: 0.12,
            source: "cultural",
            accumulated: 89.75,
            next_distribution: new Date(Date.now() + 86400000 * 14),
          },
          access_control: {
            biometric_required: true,
            ritual_verification: true,
            elder_approval: true,
            time_locks: [],
          },
          mesh_integration: {
            connected_nodes: ["node_003", "node_007", "node_015", "node_021"],
            sync_status: "syncing",
            last_mesh_backup: new Date(Date.now() - 900000),
            geographic_distribution: ["USA", "Canada", "Kenya", "UK"],
          },
        },
      ];

      setVaults(mockVaults);
      if (!selectedVault && mockVaults.length > 0) {
        setSelectedVault(mockVaults[0]);
      }
    } catch (error) {
      console.error("Failed to load vaults:", error);
    }
  };

  const generateDNAVisualization = (dna: VaultDNA) => {
    const sequence = dna.sequence;
    const colorMap = {
      A: "#FF6B6B", // Red
      T: "#4ECDC4", // Teal
      G: "#45B7D1", // Blue
      C: "#96CEB4", // Green
    };

    let visualization = "";
    for (let i = 0; i < sequence.length; i += 3) {
      const codon = sequence.slice(i, i + 3);
      visualization += codon + " ";
    }
    return visualization;
  };

  const getVaultStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "locked":
        return "text-red-500";
      case "evolving":
        return "text-blue-500";
      case "dormant":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getVaultTypeIcon = (type: string) => {
    switch (type) {
      case "personal":
        return <Shield className="w-4 h-4" />;
      case "community":
        return <Users className="w-4 h-4" />;
      case "ritual":
        return <Brain className="w-4 h-4" />;
      case "diaspora":
        return <Globe className="w-4 h-4" />;
      default:
        return <Vault className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const calculateVaultHealth = (vault: Vault) => {
    const factors = [
      vault.dna.traits.trust_coefficient,
      vault.mesh_integration.sync_status === "synced" ? 1 : 0.5,
      vault.yield.rate > 0 ? 1 : 0.7,
      vault.dna.behavioral_patterns.mesh_participation,
    ];
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  };

  if (!selectedVault) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading vault data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vault Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Vault className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{vaults.length}</p>
                <p className="text-sm text-muted-foreground">Total Vaults</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    vaults.reduce((sum, v) => sum + v.balance, 0),
                    "USD",
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(calculateVaultHealth(selectedVault) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Vault Health</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DNA className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {selectedVault.dna.evolution_history.mutations}
                </p>
                <p className="text-sm text-muted-foreground">DNA Mutations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vault Selection */}
      <div className="grid gap-4">
        {vaults.map((vault) => (
          <Card
            key={vault.id}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              selectedVault?.id === vault.id && "border-primary",
            )}
            onClick={() => setSelectedVault(vault)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getVaultTypeIcon(vault.type)}
                  <div>
                    <p className="font-medium">{vault.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.type} vault • Created{" "}
                      {formatTimeAgo(vault.created)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(vault.balance, vault.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Yield: {(vault.yield.rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Badge className={getVaultStatusColor(vault.status)}>
                    {vault.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dna">Vault DNA</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="mesh">Mesh Sync</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vault Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedVault.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <div className="flex items-center space-x-2">
                      {getVaultTypeIcon(selectedVault.type)}
                      <span className="capitalize">{selectedVault.type}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(
                        selectedVault.balance,
                        selectedVault.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      className={getVaultStatusColor(selectedVault.status)}
                    >
                      {selectedVault.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Vault Health
                  </p>
                  <Progress
                    value={calculateVaultHealth(selectedVault) * 100}
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(calculateVaultHealth(selectedVault) * 100)}% -
                    Excellent condition
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yield Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Rate</p>
                    <p className="font-medium text-lg text-green-500">
                      {(selectedVault.yield.rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedVault.yield.source}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accumulated</p>
                    <p className="font-medium">
                      {formatCurrency(
                        selectedVault.yield.accumulated,
                        selectedVault.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Next Distribution
                    </p>
                    <p className="font-medium">
                      {selectedVault.yield.next_distribution.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm">Yield distribution received</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm">DNA evolution detected</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <div>
                    <p className="text-sm">Mesh sync completed</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dna" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DNA className="w-5 h-5" />
                  <span>Genetic Sequence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 rounded-lg font-mono text-xs break-all">
                    {selectedVault.dna.sequence.match(/.{1,10}/g)?.join(" ")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedVault.dna.sequence.length} base pairs •{" "}
                    {selectedVault.dna.evolution_history.mutations} mutations
                    recorded
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavioral Traits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedVault.dna.traits).map(
                  ([trait, value]) => (
                    <div key={trait}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize">
                          {trait.replace("_", " ")}
                        </span>
                        <span className="text-sm font-medium">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Behavioral Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(selectedVault.dna.behavioral_patterns).map(
                  ([pattern, value]) => (
                    <div key={pattern} className="text-center">
                      <p className="text-2xl font-bold text-blue-500">
                        {(value * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {pattern.replace("_", " ")}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolution History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {selectedVault.dna.evolution_history.mutations}
                    </p>
                    <p className="text-sm text-muted-foreground">Mutations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">
                      {selectedVault.dna.evolution_history.adaptations.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Adaptations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">
                      {(
                        selectedVault.dna.evolution_history.learning_rate * 100
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Learning Rate
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Recent Adaptations</p>
                  <div className="space-y-2">
                    {selectedVault.dna.evolution_history.adaptations.map(
                      (adaptation, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{adaptation}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consensus Mechanism</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Consensus Threshold
                  </p>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={selectedVault.governance.consensus_threshold * 100}
                      className="flex-1 h-3"
                    />
                    <span className="font-medium">
                      {(
                        selectedVault.governance.consensus_threshold * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Voting Power Distribution
                  </p>
                  <div className="space-y-2">
                    {Object.entries(selectedVault.governance.voting_power).map(
                      ([role, power]) => (
                        <div key={role} className="flex justify-between">
                          <span className="text-sm capitalize">
                            {role.replace("_", " ")}
                          </span>
                          <span className="font-medium">
                            {(power * 100).toFixed(1)}%
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cultural Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ritual Requirements
                  </p>
                  <div className="space-y-1">
                    {selectedVault.governance.ritual_requirements.map(
                      (ritual, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {ritual.replace("_", " ")}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cultural Validators
                  </p>
                  <div className="space-y-1">
                    {selectedVault.governance.cultural_validators.map(
                      (validator, index) => (
                        <Badge key={index} variant="secondary" className="mr-1">
                          {validator.replace("_", " ")}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Encryption Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Algorithm</p>
                    <p className="font-medium">
                      {selectedVault.encryption.algorithm}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Key Shards</p>
                    <p className="font-medium">
                      {selectedVault.encryption.keyShards}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Shares Required
                    </p>
                    <p className="font-medium">
                      {selectedVault.encryption.sharesRequired}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Elder Signatures
                    </p>
                    <p className="font-medium">
                      {selectedVault.encryption.elderSignatures.length}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Security Score
                  </p>
                  <Progress value={95} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    95% - Military Grade Security
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Biometric Required</span>
                    <Badge
                      variant={
                        selectedVault.access_control.biometric_required
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedVault.access_control.biometric_required
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ritual Verification</span>
                    <Badge
                      variant={
                        selectedVault.access_control.ritual_verification
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedVault.access_control.ritual_verification
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Elder Approval</span>
                    <Badge
                      variant={
                        selectedVault.access_control.elder_approval
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedVault.access_control.elder_approval
                        ? "Required"
                        : "Not Required"}
                    </Badge>
                  </div>
                </div>

                {selectedVault.access_control.time_locks.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Time Locks
                    </p>
                    <div className="space-y-2">
                      {selectedVault.access_control.time_locks.map(
                        (lock, index) => (
                          <div
                            key={index}
                            className="p-2 bg-yellow-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {lock.unlock_date.toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {lock.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mesh" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mesh Integration Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sync Status</p>
                    <Badge
                      variant={
                        selectedVault.mesh_integration.sync_status === "synced"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedVault.mesh_integration.sync_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Connected Nodes
                    </p>
                    <p className="font-medium">
                      {selectedVault.mesh_integration.connected_nodes.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Backup</p>
                    <p className="font-medium">
                      {formatTimeAgo(
                        selectedVault.mesh_integration.last_mesh_backup,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Regions</p>
                    <p className="font-medium">
                      {
                        selectedVault.mesh_integration.geographic_distribution
                          .length
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Connected Nodes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedVault.mesh_integration.connected_nodes.map(
                      (node) => (
                        <Badge key={node} variant="outline" className="text-xs">
                          {node}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedVault.mesh_integration.geographic_distribution.map(
                    (region, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{region}</span>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mesh Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Force Sync
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Yield Performance</span>
                      <span className="text-sm font-medium">+12.5%</span>
                    </div>
                    <Progress value={125} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Security Score</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Mesh Reliability</span>
                      <span className="text-sm font-medium">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">+15.2%</p>
                    <p className="text-sm text-muted-foreground">
                      Projected Annual Growth
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {formatCurrency(selectedVault.balance * 1.152, "USD")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estimated Value Next Year
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
