import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bluetooth,
  Shield,
  Zap,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VaultTapLogo } from "@/components/VaultTapLogo";

export default function Settings() {
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
            <span className="text-xl font-semibold">Settings</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        {/* Network Settings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Bluetooth className="w-6 h-6 mr-3 text-vault-blue" />
            Network Settings
          </h2>

          <div className="space-y-6 p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bluetooth" className="text-base font-medium">
                  Bluetooth Mesh
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable peer-to-peer connectivity
                </p>
              </div>
              <Switch id="bluetooth" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-relay" className="text-base font-medium">
                  Auto Relay
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically relay transactions for offline peers
                </p>
              </div>
              <Switch id="auto-relay" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="cover-traffic"
                  className="text-base font-medium"
                >
                  Cover Traffic
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send dummy messages to prevent surveillance mapping
                </p>
              </div>
              <Switch id="cover-traffic" defaultChecked />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="w-6 h-6 mr-3 text-vault-green" />
            Security & Privacy
          </h2>

          <div className="space-y-6 p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="biometric" className="text-base font-medium">
                  Biometric Unlock
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face recognition
                </p>
              </div>
              <Switch id="biometric" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ritual-auth" className="text-base font-medium">
                  Ritual Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require ritual verification for large transactions
                </p>
              </div>
              <Switch id="ritual-auth" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-lock" className="text-base font-medium">
                  Auto Lock
                </Label>
                <p className="text-sm text-muted-foreground">
                  Lock app after 5 minutes of inactivity
                </p>
              </div>
              <Switch id="auto-lock" defaultChecked />
            </div>

            <Button
              variant="outline"
              className="w-full border-vault-orange text-vault-orange hover:bg-vault-orange/10"
            >
              <Zap className="w-4 h-4 mr-2" />
              Configure Emergency Wipe
            </Button>
          </div>
        </div>

        {/* Backup & Recovery */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Backup & Recovery</h2>

          <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Vault Keys
            </Button>

            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Import Vault Keys
            </Button>

            <div className="p-4 rounded-xl bg-vault-orange/10 border border-vault-orange/20">
              <h4 className="font-semibold text-vault-orange mb-2">
                Important
              </h4>
              <p className="text-sm text-muted-foreground">
                VaultTap uses ritual-based recovery instead of seed phrases.
                Make sure your trusted elders know your recovery ritual.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>

          <div className="space-y-4 p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Transaction History
            </Button>

            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Settings
            </Button>

            <Button variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Emergency Wipe All Data
            </Button>

            <p className="text-xs text-muted-foreground">
              Emergency wipe will permanently delete all data and cannot be
              undone.
            </p>
          </div>
        </div>

        {/* App Info */}
        <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-2">
          <VaultTapLogo className="justify-center" />
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">
            Banking on Bluetooth • Built for financial sovereignty
          </p>
        </div>
      </div>
    </div>
  );
}
