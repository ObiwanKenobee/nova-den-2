import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bluetooth, Users, Scan, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BluetoothStatus } from "@/components/BluetoothStatus";
import { VaultTapLogo } from "@/components/VaultTapLogo";

export default function Send() {
  const [amount, setAmount] = useState("");
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [ritual, setRitual] = useState<string | null>(null);
  const [bluetoothStatus] = useState<
    "connected" | "searching" | "disconnected"
  >("connected");

  const nearbyPeers = [
    {
      id: "1",
      name: "Maya's Maize Stand",
      distance: "2m",
      signal: 5,
      lastSeen: "now",
    },
    {
      id: "2",
      name: "Kwame (Elder)",
      distance: "5m",
      signal: 4,
      lastSeen: "1m ago",
    },
    {
      id: "3",
      name: "Local Coop Fund",
      distance: "8m",
      signal: 3,
      lastSeen: "2m ago",
    },
    {
      id: "4",
      name: "Market Hub",
      distance: "12m",
      signal: 2,
      lastSeen: "5m ago",
    },
  ];

  const rituals = [
    {
      id: "harvest",
      name: "Harvest Blessing",
      description: "For agricultural transactions",
    },
    {
      id: "elder",
      name: "Elder Witness",
      description: "Verified by community elder",
    },
    {
      id: "coop",
      name: "Cooperative Bond",
      description: "Member-to-member transfer",
    },
    {
      id: "relief",
      name: "Aid Distribution",
      description: "Emergency or humanitarian aid",
    },
  ];

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-3 rounded-full ${
          i < strength ? "bg-vault-green" : "bg-muted"
        }`}
      />
    ));
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
            <span className="text-xl font-semibold">Send Payment</span>
          </div>
          <BluetoothStatus status={bluetoothStatus} peerCount={4} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        {/* Amount Input */}
        <div className="space-y-4">
          <Label htmlFor="amount" className="text-lg font-semibold">
            Amount to Send
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-3xl font-bold py-6 pr-16 text-center"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl font-semibold text-muted-foreground">
              VT
            </span>
          </div>
        </div>

        {/* Nearby Peers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Select Recipient</Label>
            <Button variant="outline" size="sm">
              <Scan className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
          </div>

          <div className="space-y-3">
            {nearbyPeers.map((peer) => (
              <div
                key={peer.id}
                onClick={() => setSelectedPeer(peer.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPeer === peer.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-vault-blue to-vault-purple rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{peer.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {peer.distance} • {peer.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bluetooth className="w-4 h-4 text-vault-blue" />
                    <div className="flex space-x-1">
                      {getSignalBars(peer.signal)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ritual Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Authentication Ritual</Label>
          <div className="grid grid-cols-2 gap-3">
            {rituals.map((ritualOption) => (
              <div
                key={ritualOption.id}
                onClick={() => setRitual(ritualOption.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  ritual === ritualOption.id
                    ? "border-vault-purple bg-vault-purple/5"
                    : "border-border hover:border-vault-purple/50"
                }`}
              >
                <h4 className="font-semibold text-sm">{ritualOption.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {ritualOption.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <Label htmlFor="message" className="text-lg font-semibold">
            Message (Optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Add a note for this transaction..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        {/* Transaction Summary */}
        {amount && selectedPeer && ritual && (
          <div className="p-6 rounded-xl bg-card border border-border space-y-4">
            <h3 className="font-semibold text-lg">Transaction Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{amount} VT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-semibold">
                  {nearbyPeers.find((p) => p.id === selectedPeer)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ritual:</span>
                <span className="font-semibold">
                  {rituals.find((r) => r.id === ritual)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee:</span>
                <span className="font-semibold">0.01 VT</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    {(parseFloat(amount) + 0.01).toFixed(2)} VT
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button
          className="w-full py-6 text-lg bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90"
          disabled={!amount || !selectedPeer || !ritual}
        >
          <Zap className="w-5 h-5 mr-2" />
          Send Payment via Bluetooth
        </Button>
      </div>
    </div>
  );
}
