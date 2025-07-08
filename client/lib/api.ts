import {
  ApiResponse,
  DashboardResponse,
  WalletBalance,
  TransactionHistory,
  BluetoothStatus,
  DiscoverPeersResponse,
  CreateTransactionRequest,
  SendPaymentResponse,
  Vault,
  CreateVaultRequest,
  VaultOperation,
  UserSettings,
  Ritual,
} from "@shared/api";

const API_BASE = "/api";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Wallet endpoints
  async getBalance(): Promise<WalletBalance> {
    return this.request<WalletBalance>("/wallet/balance");
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>("/wallet/dashboard");
  }

  async getTransactionHistory(
    page = 1,
    limit = 10,
    status?: string,
    type?: string,
  ): Promise<TransactionHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append("status", status);
    if (type) params.append("type", type);

    return this.request<TransactionHistory>(`/wallet/transactions?${params}`);
  }

  // Bluetooth endpoints
  async getBluetoothStatus(): Promise<BluetoothStatus> {
    return this.request<BluetoothStatus>("/bluetooth/status");
  }

  async discoverPeers(): Promise<DiscoverPeersResponse> {
    return this.request<DiscoverPeersResponse>("/bluetooth/discover", {
      method: "POST",
    });
  }

  async connectToPeer(peerId: string): Promise<any> {
    return this.request(`/bluetooth/connect/${peerId}`, {
      method: "POST",
    });
  }

  async disconnectFromPeer(peerId: string): Promise<any> {
    return this.request(`/bluetooth/connect/${peerId}`, {
      method: "DELETE",
    });
  }

  async enableBluetooth(): Promise<any> {
    return this.request("/bluetooth/enable", {
      method: "POST",
    });
  }

  async disableBluetooth(): Promise<any> {
    return this.request("/bluetooth/disable", {
      method: "POST",
    });
  }

  // Transaction endpoints
  async sendPayment(
    request: CreateTransactionRequest,
  ): Promise<SendPaymentResponse> {
    return this.request<SendPaymentResponse>("/transactions/send", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getTransactions(
    page = 1,
    limit = 10,
    status?: string,
    type?: string,
  ): Promise<TransactionHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append("status", status);
    if (type) params.append("type", type);

    return this.request<TransactionHistory>(`/transactions?${params}`);
  }

  async getTransaction(transactionId: string): Promise<any> {
    return this.request(`/transactions/${transactionId}`);
  }

  async cancelTransaction(transactionId: string): Promise<any> {
    return this.request(`/transactions/${transactionId}/cancel`, {
      method: "POST",
    });
  }

  async retryTransaction(transactionId: string): Promise<any> {
    return this.request(`/transactions/${transactionId}/retry`, {
      method: "POST",
    });
  }

  // Vault endpoints
  async getVaults(): Promise<Vault[]> {
    return this.request<Vault[]>("/vaults");
  }

  async getVault(vaultId: string): Promise<Vault> {
    return this.request<Vault>(`/vaults/${vaultId}`);
  }

  async createVault(request: CreateVaultRequest): Promise<Vault> {
    return this.request<Vault>("/vaults", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async vaultOperation(operation: VaultOperation): Promise<Vault> {
    return this.request<Vault>("/vaults/operation", {
      method: "POST",
      body: JSON.stringify(operation),
    });
  }

  async lockVault(vaultId: string): Promise<Vault> {
    return this.request<Vault>(`/vaults/${vaultId}/lock`, {
      method: "POST",
    });
  }

  async unlockVault(vaultId: string, ritual?: string): Promise<Vault> {
    return this.request<Vault>(`/vaults/${vaultId}/unlock`, {
      method: "POST",
      body: JSON.stringify({ ritual }),
    });
  }

  async deleteVault(vaultId: string): Promise<any> {
    return this.request(`/vaults/${vaultId}`, {
      method: "DELETE",
    });
  }

  // Settings endpoints
  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>("/settings");
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  async getRituals(): Promise<Ritual[]> {
    return this.request<Ritual[]>("/settings/rituals");
  }

  async createCustomRitual(ritual: {
    name: string;
    description: string;
    requirements: string[];
  }): Promise<Ritual> {
    return this.request<Ritual>("/settings/rituals", {
      method: "POST",
      body: JSON.stringify(ritual),
    });
  }

  async deleteRitual(ritualId: string): Promise<any> {
    return this.request(`/settings/rituals/${ritualId}`, {
      method: "DELETE",
    });
  }

  async exportData(): Promise<any> {
    return this.request("/settings/export");
  }

  async importData(data: any): Promise<any> {
    return this.request("/settings/import", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async clearData(type: "settings" | "rituals" | "all"): Promise<any> {
    return this.request("/settings/clear", {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  }

  async emergencyWipe(pattern: string): Promise<any> {
    return this.request("/settings/emergency-wipe", {
      method: "POST",
      body: JSON.stringify({
        pattern,
        confirmation: "EMERGENCY_WIPE_CONFIRMED",
      }),
    });
  }
}

export const api = new ApiClient();
