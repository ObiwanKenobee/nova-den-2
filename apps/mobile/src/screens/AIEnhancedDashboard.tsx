import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "@vaulttap/bluetooth-mesh";
import { VaultTapLogo, Button, Card } from "@vaulttap/ui-kit";

interface AIInsight {
  id: string;
  type:
    | "trust_score"
    | "ritual_suggestion"
    | "governance_alert"
    | "market_opportunity";
  title: string;
  description: string;
  confidence: number;
  action_required: boolean;
  data: any;
}

interface SyntheticIdentity {
  trust_score: number;
  identity_strength: number;
  cultural_markers: string[];
  community_standing: string;
  recent_changes: Array<{
    factor: string;
    impact: number;
    timestamp: Date;
  }>;
}

interface GovernanceStatus {
  compliance_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  active_violations: string[];
  recommendations: string[];
}

export default function AIEnhancedDashboard({ navigation }: any) {
  const { isEnabled, peerCount, meshNodes } = useBluetooth();

  // State management
  const [balance, setBalance] = useState(1247.83);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [syntheticIdentity, setSyntheticIdentity] =
    useState<SyntheticIdentity | null>(null);
  const [governanceStatus, setGovernanceStatus] =
    useState<GovernanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysisInProgress, setAiAnalysisInProgress] = useState(false);

  // AWS configuration
  const awsConfig = {
    apiGatewayUrl:
      process.env.EXPO_PUBLIC_AWS_API_URL || "https://api.vaulttap.io",
    region: process.env.EXPO_PUBLIC_AWS_REGION || "us-east-1",
  };

  useEffect(() => {
    loadDashboardData();

    // Setup real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Load dashboard data with AI enhancements
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel data loading
      const [insights, identity, governance] = await Promise.allSettled([
        fetchAIInsights(),
        fetchSyntheticIdentity(),
        fetchGovernanceStatus(),
      ]);

      if (insights.status === "fulfilled") {
        setAiInsights(insights.value);
      }

      if (identity.status === "fulfilled") {
        setSyntheticIdentity(identity.value);
      }

      if (governance.status === "fulfilled") {
        setGovernanceStatus(governance.value);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      Alert.alert(
        "Error",
        "Failed to load AI insights. Some features may be limited.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch AI insights from AWS
   */
  const fetchAIInsights = async (): Promise<AIInsight[]> => {
    const response = await fetch(`${awsConfig.apiGatewayUrl}/ai/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_context: {
          mesh_activity: meshNodes.length,
          peer_count: peerCount,
          balance,
          recent_transactions: [], // Would include recent transaction data
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI insights");
    }

    const data = await response.json();
    return data.insights || [];
  };

  /**
   * Fetch synthetic identity analysis
   */
  const fetchSyntheticIdentity = async (): Promise<SyntheticIdentity> => {
    const response = await fetch(
      `${awsConfig.apiGatewayUrl}/ai/synthetic-identity`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: "synthetic",
          operation: "get_current_identity",
          payload: {
            user_id: "current_user", // Would be actual user ID
            include_recent_changes: true,
          },
          mesh_node_id: "current_node", // Would be actual node ID
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch synthetic identity");
    }

    const data = await response.json();
    return data.data;
  };

  /**
   * Fetch governance compliance status
   */
  const fetchGovernanceStatus = async (): Promise<GovernanceStatus> => {
    const response = await fetch(
      `${awsConfig.apiGatewayUrl}/ai/governance-status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: "governance",
          operation: "get_compliance_status",
          payload: {
            user_id: "current_user",
            time_range: "24h",
          },
          mesh_node_id: "current_node",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch governance status");
    }

    const data = await response.json();
    return data.data;
  };

  /**
   * Trigger comprehensive AI analysis
   */
  const triggerAIAnalysis = async () => {
    try {
      setAiAnalysisInProgress(true);

      const response = await fetch(
        `${awsConfig.apiGatewayUrl}/ai/orchestration`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_type: "orchestration",
            operation: "comprehensive_user_analysis",
            payload: {
              user_narrative: {
                user_id: "current_user",
                story: "User's self-described background and goals",
                behavioral_data: {
                  mesh_interactions: meshNodes.length,
                  transaction_patterns: [],
                },
                community_context: {
                  peer_connections: peerCount,
                  cultural_practices: [],
                },
              },
              demographic_data: {},
              cultural_context: {},
            },
            mesh_node_id: "current_node",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("AI analysis failed");
      }

      const result = await response.json();

      // Update state with new analysis
      await loadDashboardData();

      Alert.alert(
        "AI Analysis Complete",
        "Your trust profile and recommendations have been updated.",
        [{ text: "OK", onPress: () => {} }],
      );
    } catch (error) {
      console.error("AI analysis failed:", error);
      Alert.alert("Error", "AI analysis failed. Please try again later.");
    } finally {
      setAiAnalysisInProgress(false);
    }
  };

  /**
   * Handle AI insight action
   */
  const handleInsightAction = async (insight: AIInsight) => {
    switch (insight.type) {
      case "ritual_suggestion":
        navigation.navigate("Ritual", {
          suggested_ritual: insight.data.ritual_type,
          context: insight.data.context,
        });
        break;

      case "governance_alert":
        Alert.alert("Governance Alert", insight.description, [
          { text: "Dismiss", style: "cancel" },
          {
            text: "Learn More",
            onPress: () => navigation.navigate("Settings"),
          },
        ]);
        break;

      case "market_opportunity":
        Alert.alert("Market Opportunity", insight.description, [
          { text: "Not Now", style: "cancel" },
          { text: "Explore", onPress: () => navigation.navigate("Send") },
        ]);
        break;

      default:
        Alert.alert("Insight", insight.description);
    }
  };

  /**
   * Get trust score color
   */
  const getTrustScoreColor = (score: number): string => {
    if (score >= 800) return "#4caf50"; // Green
    if (score >= 600) return "#ff9800"; // Orange
    if (score >= 400) return "#f44336"; // Red
    return "#9e9e9e"; // Gray
  };

  /**
   * Get governance risk color
   */
  const getGovernanceRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case "low":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "high":
        return "#f44336";
      case "critical":
        return "#d32f2f";
      default:
        return "#9e9e9e";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00bcd4" />
          <Text style={styles.loadingText}>Loading AI insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <VaultTapLogo size="medium" />
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={triggerAIAnalysis}
              disabled={aiAnalysisInProgress}
            >
              {aiAnalysisInProgress ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="sparkles" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card with AI Insights */}
        <Card style={styles.balanceCard}>
          <LinearGradient
            colors={["#00bcd4", "#9c27b0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <View style={styles.meshStatus}>
                <Ionicons
                  name={isEnabled ? "radio" : "radio-outline"}
                  size={16}
                  color={isEnabled ? "#4caf50" : "#ff9800"}
                />
                <Text style={styles.meshStatusText}>
                  {peerCount} peers • {meshNodes.length} nodes
                </Text>
              </View>
            </View>

            <Text style={styles.balanceAmount}>{balance.toFixed(2)} VT</Text>

            {syntheticIdentity && (
              <View style={styles.trustScoreContainer}>
                <Text style={styles.trustScoreLabel}>AI Trust Score</Text>
                <View style={styles.trustScoreRow}>
                  <View
                    style={[
                      styles.trustScoreBadge,
                      {
                        backgroundColor: getTrustScoreColor(
                          syntheticIdentity.trust_score,
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.trustScoreText}>
                      {syntheticIdentity.trust_score}/1000
                    </Text>
                  </View>
                  <Text style={styles.identityStrength}>
                    ID Strength:{" "}
                    {(syntheticIdentity.identity_strength * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </Card>

        {/* Governance Status */}
        {governanceStatus && (
          <Card style={styles.governanceCard}>
            <View style={styles.governanceHeader}>
              <View style={styles.governanceTitle}>
                <Ionicons name="shield-checkmark" size={24} color="#9c27b0" />
                <Text style={styles.governanceText}>Governance Status</Text>
              </View>
              <View
                style={[
                  styles.riskBadge,
                  {
                    backgroundColor: getGovernanceRiskColor(
                      governanceStatus.risk_level,
                    ),
                  },
                ]}
              >
                <Text style={styles.riskText}>
                  {governanceStatus.risk_level.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>Compliance Score</Text>
              <Text style={styles.complianceScore}>
                {(governanceStatus.compliance_score * 100).toFixed(0)}%
              </Text>
            </View>

            {governanceStatus.active_violations.length > 0 && (
              <View style={styles.violationsContainer}>
                <Text style={styles.violationsTitle}>Active Issues:</Text>
                {governanceStatus.active_violations
                  .slice(0, 2)
                  .map((violation, index) => (
                    <Text key={index} style={styles.violationText}>
                      • {violation}
                    </Text>
                  ))}
              </View>
            )}
          </Card>
        )}

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>

          {aiInsights.length === 0 ? (
            <Card style={styles.noInsightsCard}>
              <Ionicons name="bulb-outline" size={48} color="#64748b" />
              <Text style={styles.noInsightsText}>No insights available</Text>
              <Text style={styles.noInsightsSubtext}>
                Use VaultTap more to receive personalized AI recommendations
              </Text>
            </Card>
          ) : (
            aiInsights.slice(0, 3).map((insight) => (
              <TouchableOpacity
                key={insight.id}
                style={styles.insightCard}
                onPress={() => handleInsightAction(insight)}
              >
                <View style={styles.insightHeader}>
                  <View style={styles.insightTitleRow}>
                    <Ionicons
                      name={getInsightIcon(insight.type)}
                      size={20}
                      color={getInsightColor(insight.type)}
                    />
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {(insight.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.insightDescription}>
                  {insight.description}
                </Text>

                {insight.action_required && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionText}>Action Required</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Send")}
          >
            <Ionicons name="send" size={24} color="#00bcd4" />
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Receive")}
          >
            <Ionicons name="qr-code" size={24} color="#9c27b0" />
            <Text style={styles.actionLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Vault")}
          >
            <Ionicons name="safe" size={24} color="#4caf50" />
            <Text style={styles.actionLabel}>Vaults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Ritual")}
          >
            <Ionicons name="flower" size={24} color="#ff9800" />
            <Text style={styles.actionLabel}>Rituals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getInsightIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "trust_score":
      return "shield-checkmark";
    case "ritual_suggestion":
      return "flower";
    case "governance_alert":
      return "warning";
    case "market_opportunity":
      return "trending-up";
    default:
      return "information-circle";
  }
}

function getInsightColor(type: string): string {
  switch (type) {
    case "trust_score":
      return "#4caf50";
    case "ritual_suggestion":
      return "#ff9800";
    case "governance_alert":
      return "#f44336";
    case "market_opportunity":
      return "#00bcd4";
    default:
      return "#64748b";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  aiButton: {
    backgroundColor: "#9c27b0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  meshStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meshStatusText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 16,
  },
  trustScoreContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 16,
  },
  trustScoreLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 8,
  },
  trustScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trustScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trustScoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  identityStrength: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  governanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
  },
  governanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  governanceTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  governanceText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  complianceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  complianceLabel: {
    color: "#94a3b8",
    fontSize: 14,
  },
  complianceScore: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  violationsContainer: {
    marginTop: 8,
  },
  violationsTitle: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  violationText: {
    color: "#fca5a5",
    fontSize: 12,
    marginBottom: 2,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noInsightsCard: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
  },
  noInsightsText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  noInsightsSubtext: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
  insightCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#00bcd4",
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  insightTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  insightDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actionBadge: {
    backgroundColor: "#dc2626",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
});
