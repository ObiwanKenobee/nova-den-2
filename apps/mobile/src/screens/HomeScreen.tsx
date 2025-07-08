import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "@vaulttap/bluetooth-mesh";
import { VaultTapLogo, Button, Card } from "@vaulttap/ui-kit";

const { width } = Dimensions.get("window");

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { isEnabled, peerCount, enableBluetooth } = useBluetooth();
  const [balance] = useState(1247.83);

  useEffect(() => {
    if (!isEnabled) {
      enableBluetooth();
    }
  }, []);

  const features = [
    {
      icon: "bluetooth-outline",
      title: "Mesh Banking",
      description: "P2P payments via Bluetooth",
      color: "#00bcd4",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Ritual Auth",
      description: "Secure with gestures & voice",
      color: "#9c27b0",
    },
    {
      icon: "flash-outline",
      title: "Offline Ready",
      description: "Works without internet",
      color: "#4caf50",
    },
    {
      icon: "people-outline",
      title: "Community",
      description: "Cooperative vaults & lending",
      color: "#ff9800",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#020817", "#1e293b", "#020817"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <VaultTapLogo size="large" />
          <View style={styles.statusContainer}>
            <View style={styles.bluetoothStatus}>
              <Ionicons
                name={isEnabled ? "bluetooth" : "bluetooth-outline"}
                size={20}
                color={isEnabled ? "#4caf50" : "#64748b"}
              />
              <Text style={styles.statusText}>
                {isEnabled ? `${peerCount} peers` : "Offline"}
              </Text>
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <LinearGradient
            colors={["#00bcd4", "#9c27b0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{balance.toFixed(2)} VT</Text>
            <View style={styles.balanceActions}>
              <Button
                onPress={() => navigation.navigate("Send")}
                style={styles.actionButton}
                variant="secondary"
              >
                <Ionicons name="send-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>Send</Text>
              </Button>
              <Button
                onPress={() => navigation.navigate("Receive")}
                style={styles.actionButton}
                variant="secondary"
              >
                <Ionicons name="qr-code-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>Receive</Text>
              </Button>
              <Button
                onPress={() => navigation.navigate("Vault")}
                style={styles.actionButton}
                variant="secondary"
              >
                <Ionicons name="safe-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>Vault</Text>
              </Button>
            </View>
          </LinearGradient>
        </Card>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>VaultTap Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => {
                  if (feature.title === "Mesh Banking") {
                    navigation.navigate("PeerDiscovery");
                  }
                }}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={feature.color}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            onPress={() => navigation.navigate("Wallet")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Open Wallet</Text>
          </Button>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  bluetoothStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    color: "#64748b",
    fontSize: 14,
  },
  balanceCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  balanceGradient: {
    padding: 24,
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 16,
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#00bcd4",
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#00bcd4",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
