import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Lock,
  Users,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VaultTapLogo } from "@/components/VaultTapLogo";

export default function Vault() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vaultName, setVaultName] = useState("");
  const [vaultType, setVaultType] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [description, setDescription] = useState("");

  const vaultTypes = [
    {
      id: "personal",
      name: "Personal Vault",
      description: "Private savings with automated yield",
      minDeposit: 10,
      baseYield: 5.2,
    },
    {
      id: "cooperative",
      name: "Cooperative Vault",
      description: "Shared vault for group savings and lending",
      minDeposit: 50,
      baseYield: 8.5,
    },
    {
      id: "community",
      name: "Community Vault",
      description: "Public fund for community projects",
      minDeposit: 25,
      baseYield: 3.1,
    },
  ];

  const existingVaults = [
    {
      name: "Personal Savings",
      balance: 847.83,
      yieldRate: 5.2,
      type: "personal",
      isLocked: false,
      created: "3 months ago",
    },
    {
      name: "Harvest Cooperative",
      balance: 325.0,
      yieldRate: 8.5,
      participants: 12,
      type: "cooperative",
      isLocked: true,
      created: "2 weeks ago",
    },
    {
      name: "Community Relief",
      balance: 75.0,
      yieldRate: 3.1,
      participants: 45,
      type: "community",
      isLocked: false,
      created: "1 week ago",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "personal":
        return "from-vault-blue to-vault-purple";
      case "cooperative":
        return "from-vault-green to-vault-blue";
      case "community":
        return "from-vault-orange to-vault-purple";
      default:
        return "from-vault-blue to-vault-purple";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cooperative":
        return <Users className="w-5 h-5" />;
      case "community":
        return <Users className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <VaultTapLogo showText={false} />
            <span className="text-xl font-semibold">Vault Management</span>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Vault
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Create Vault Form */}
        {showCreateForm && (
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h2 className="text-2xl font-bold">Create New Vault</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vaultName">Vault Name</Label>
                  <Input
                    id="vaultName"
                    placeholder="e.g., Emergency Fund"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="vaultType">Vault Type</Label>
                  <Select value={vaultType} onValueChange={setVaultType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vault type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vaultTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="initialDeposit">Initial Deposit (VT)</Label>
                  <Input
                    id="initialDeposit"
                    type="number"
                    placeholder="0.00"
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this vault for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {vaultType && (
                  <div className="p-4 rounded-xl bg-secondary space-y-2">
                    <h4 className="font-semibold">
                      {vaultTypes.find((t) => t.id === vaultType)?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {vaultTypes.find((t) => t.id === vaultType)?.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Min. Deposit:</span>
                      <span className="font-semibold">
                        {vaultTypes.find((t) => t.id === vaultType)?.minDeposit}{" "}
                        VT
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Base Yield:</span>
                      <span className="font-semibold text-vault-green">
                        {vaultTypes.find((t) => t.id === vaultType)?.baseYield}%
                        APY
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90"
                disabled={!vaultName || !vaultType || !initialDeposit}
              >
                Create Vault
              </Button>
            </div>
          </div>
        )}

        {/* Existing Vaults */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Vaults</h2>

          <div className="grid gap-6">
            {existingVaults.map((vault, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border border-border space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(vault.type)}`}
                    >
                      {getTypeIcon(vault.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{vault.name}</h3>
                      <p className="text-muted-foreground capitalize">
                        {vault.type} vault • Created {vault.created}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {vault.isLocked && (
                      <div className="flex items-center space-x-2 text-vault-orange">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">Locked</span>
                      </div>
                    )}
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">
                      {vault.balance.toFixed(2)} VT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Yield Rate</p>
                    <p className="text-2xl font-bold text-vault-green">
                      +{vault.yieldRate}% APY
                    </p>
                  </div>
                  {vault.participants && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Participants
                      </p>
                      <p className="text-2xl font-bold">{vault.participants}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1">
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={vault.isLocked}
                  >
                    Withdraw
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vault Benefits */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-vault-blue/10 to-vault-purple/10 border border-primary/20">
          <h3 className="text-xl font-bold mb-4">Why Use VaultTap Vaults?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Automated Yield</h4>
              <p className="text-sm text-muted-foreground">
                Earn passive income through mesh network participation
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Community Power</h4>
              <p className="text-sm text-muted-foreground">
                Pool resources with others for higher yields and shared risk
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ritual Security</h4>
              <p className="text-sm text-muted-foreground">
                Multi-factor authentication through community consensus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
