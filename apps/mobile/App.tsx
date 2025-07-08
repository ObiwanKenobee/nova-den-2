import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "@vaulttap/ui-kit";
import { BluetoothProvider } from "@vaulttap/bluetooth-mesh";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import WalletScreen from "./src/screens/WalletScreen";
import SendScreen from "./src/screens/SendScreen";
import ReceiveScreen from "./src/screens/ReceiveScreen";
import VaultScreen from "./src/screens/VaultScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import RitualScreen from "./src/screens/RitualScreen";
import PeerDiscoveryScreen from "./src/screens/PeerDiscoveryScreen";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BluetoothProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#020817",
                },
                headerTintColor: "#f8fafc",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Wallet"
                component={WalletScreen}
                options={{ title: "My Vault" }}
              />
              <Stack.Screen
                name="Send"
                component={SendScreen}
                options={{ title: "Send Payment" }}
              />
              <Stack.Screen
                name="Receive"
                component={ReceiveScreen}
                options={{ title: "Receive Payment" }}
              />
              <Stack.Screen
                name="Vault"
                component={VaultScreen}
                options={{ title: "Vault Management" }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: "Settings" }}
              />
              <Stack.Screen
                name="Ritual"
                component={RitualScreen}
                options={{ title: "Ritual Authentication" }}
              />
              <Stack.Screen
                name="PeerDiscovery"
                component={PeerDiscoveryScreen}
                options={{ title: "Nearby Peers" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </BluetoothProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
