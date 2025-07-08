import React, { useState, useEffect } from "react";
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Scale,
  Eye,
  Download,
  Upload,
  Settings,
  Users,
  Lock,
  Activity,
  BarChart3,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ComplianceFramework {
  id: string;
  name: string;
  region: string;
  type: "financial" | "data_privacy" | "security" | "humanitarian";
  status: "compliant" | "partial" | "non_compliant" | "pending";
  lastAudit: Date;
  nextAudit: Date;
  requirements: ComplianceRequirement[];
  risk_level: "low" | "medium" | "high" | "critical";
  certification_status: "active" | "expired" | "pending" | "revoked";
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: "met" | "partial" | "not_met" | "n_a";
  mandatory: boolean;
  evidence: string[];
  responsible_party: string;
  deadline: Date;
  implementation_notes: string;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  auditor: string;
  framework: string;
  action: string;
  findings: string;
  risk_rating: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
}

interface DataRetentionPolicy {
  id: string;
  data_type: string;
  retention_period: number;
  jurisdiction: string;
  purpose: string;
  encryption_required: boolean;
  backup_required: boolean;
  deletion_method: string;
}

export default function ComplianceCenter() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<
    DataRetentionPolicy[]
  >([]);
  const [selectedFramework, setSelectedFramework] =
    useState<ComplianceFramework | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");

  useEffect(() => {
    loadComplianceData();
    const interval = setInterval(loadComplianceData, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      // Simulate comprehensive compliance data
      const mockFrameworks: ComplianceFramework[] = [
        {
          id: "pci_dss",
          name: "PCI DSS v4.0",
          region: "Global",
          type: "financial",
          status: "compliant",
          lastAudit: new Date(Date.now() - 86400000 * 30), // 30 days ago
          nextAudit: new Date(Date.now() + 86400000 * 335), // ~11 months
          risk_level: "low",
          certification_status: "active",
          requirements: [
            {
              id: "pci_1_1",
              title: "Install and maintain network security controls",
              description:
                "Implement and maintain network security controls to protect cardholder data",
              status: "met",
              mandatory: true,
              evidence: ["firewall_config.pdf", "network_diagram.pdf"],
              responsible_party: "Security Team",
              deadline: new Date(Date.now() + 86400000 * 90),
              implementation_notes:
                "Firewall rules updated and documented. Regular reviews scheduled.",
            },
            {
              id: "pci_2_1",
              title: "Apply secure configurations to all system components",
              description:
                "Remove default accounts, implement secure configurations",
              status: "met",
              mandatory: true,
              evidence: ["security_hardening.pdf", "config_checklist.pdf"],
              responsible_party: "DevOps Team",
              deadline: new Date(Date.now() + 86400000 * 90),
              implementation_notes:
                "All systems hardened according to CIS benchmarks.",
            },
          ],
        },
        {
          id: "gdpr",
          name: "GDPR",
          region: "European Union",
          type: "data_privacy",
          status: "compliant",
          lastAudit: new Date(Date.now() - 86400000 * 60), // 60 days ago
          nextAudit: new Date(Date.now() + 86400000 * 305), // ~10 months
          risk_level: "medium",
          certification_status: "active",
          requirements: [
            {
              id: "gdpr_art6",
              title: "Lawful basis for processing",
              description:
                "Ensure lawful basis exists for all personal data processing",
              status: "met",
              mandatory: true,
              evidence: ["privacy_policy.pdf", "consent_records.pdf"],
              responsible_party: "Legal Team",
              deadline: new Date(Date.now() + 86400000 * 180),
              implementation_notes:
                "Updated privacy policy and consent mechanisms implemented.",
            },
            {
              id: "gdpr_art25",
              title: "Data protection by design and by default",
              description:
                "Implement data protection measures by design and default",
              status: "partial",
              mandatory: true,
              evidence: ["privacy_impact_assessment.pdf"],
              responsible_party: "Engineering Team",
              deadline: new Date(Date.now() + 86400000 * 120),
              implementation_notes:
                "Privacy-by-design principles implemented. Some legacy systems need updates.",
            },
          ],
        },
        {
          id: "soc2",
          name: "SOC 2 Type II",
          region: "United States",
          type: "security",
          status: "pending",
          lastAudit: new Date(Date.now() - 86400000 * 120), // 4 months ago
          nextAudit: new Date(Date.now() + 86400000 * 60), // 2 months
          risk_level: "medium",
          certification_status: "pending",
          requirements: [
            {
              id: "soc2_cc1",
              title: "Control Environment",
              description:
                "Organization demonstrates commitment to integrity and ethics",
              status: "met",
              mandatory: true,
              evidence: ["code_of_conduct.pdf", "training_records.pdf"],
              responsible_party: "HR Team",
              deadline: new Date(Date.now() + 86400000 * 30),
              implementation_notes:
                "Ethics training completed for all employees.",
            },
            {
              id: "soc2_cc6",
              title: "Logical and Physical Access Controls",
              description:
                "Controls provide reasonable assurance that access is restricted",
              status: "partial",
              mandatory: true,
              evidence: ["access_control_policy.pdf"],
              responsible_party: "Security Team",
              deadline: new Date(Date.now() + 86400000 * 45),
              implementation_notes:
                "Multi-factor authentication implemented. Physical access controls being upgraded.",
            },
          ],
        },
        {
          id: "fatf",
          name: "FATF AML Guidelines",
          region: "Global",
          type: "financial",
          status: "compliant",
          lastAudit: new Date(Date.now() - 86400000 * 45), // 45 days ago
          nextAudit: new Date(Date.now() + 86400000 * 320), // ~11 months
          risk_level: "high",
          certification_status: "active",
          requirements: [
            {
              id: "fatf_r10",
              title: "Customer Due Diligence",
              description:
                "Implement customer due diligence and know your customer procedures",
              status: "met",
              mandatory: true,
              evidence: ["kyc_procedures.pdf", "cdd_policy.pdf"],
              responsible_party: "Compliance Team",
              deadline: new Date(Date.now() + 86400000 * 90),
              implementation_notes:
                "Enhanced due diligence procedures for high-risk customers implemented.",
            },
          ],
        },
      ];

      const mockAuditLogs: AuditLog[] = [
        {
          id: "audit_001",
          timestamp: new Date(Date.now() - 86400000 * 7), // 7 days ago
          auditor: "External Auditor - CyberSec Inc",
          framework: "PCI DSS",
          action: "Quarterly Security Assessment",
          findings:
            "All requirements met. Minor recommendation for improved logging.",
          risk_rating: "low",
          status: "closed",
        },
        {
          id: "audit_002",
          timestamp: new Date(Date.now() - 86400000 * 14), // 14 days ago
          auditor: "Internal Audit Team",
          framework: "GDPR",
          action: "Data Processing Review",
          findings:
            "Data retention policies need updates for new humanitarian programs.",
          risk_rating: "medium",
          status: "in_progress",
        },
        {
          id: "audit_003",
          timestamp: new Date(Date.now() - 86400000 * 21), // 21 days ago
          auditor: "SOC 2 Auditor - Compliance Pro",
          framework: "SOC 2",
          action: "Annual Type II Audit",
          findings:
            "Physical access controls require enhancement. Logical controls satisfactory.",
          risk_rating: "medium",
          status: "in_progress",
        },
      ];

      const mockRetentionPolicies: DataRetentionPolicy[] = [
        {
          id: "policy_001",
          data_type: "Financial Transaction Records",
          retention_period: 2555, // 7 years in days
          jurisdiction: "Global",
          purpose: "Regulatory compliance and audit requirements",
          encryption_required: true,
          backup_required: true,
          deletion_method: "Secure multi-pass overwrite",
        },
        {
          id: "policy_002",
          data_type: "Personal Identification Information",
          retention_period: 365, // 1 year
          jurisdiction: "EU",
          purpose: "GDPR compliance",
          encryption_required: true,
          backup_required: false,
          deletion_method: "Cryptographic erasure",
        },
        {
          id: "policy_003",
          data_type: "Cultural Verification Data",
          retention_period: 3650, // 10 years
          jurisdiction: "Global",
          purpose: "Cultural preservation and research",
          encryption_required: true,
          backup_required: true,
          deletion_method: "Secure deletion with elder approval",
        },
      ];

      setFrameworks(mockFrameworks);
      setAuditLogs(mockAuditLogs);
      setRetentionPolicies(mockRetentionPolicies);

      if (!selectedFramework && mockFrameworks.length > 0) {
        setSelectedFramework(mockFrameworks[0]);
      }
    } catch (error) {
      console.error("Failed to load compliance data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "met":
      case "active":
        return "text-green-500";
      case "partial":
      case "pending":
        return "text-yellow-500";
      case "non_compliant":
      case "not_met":
      case "expired":
      case "revoked":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "met":
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "partial":
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "non_compliant":
      case "not_met":
      case "expired":
      case "revoked":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getFrameworkTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <BarChart3 className="w-4 h-4" />;
      case "data_privacy":
        return <Lock className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "humanitarian":
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const calculateOverallCompliance = () => {
    const compliantCount = frameworks.filter(
      (f) => f.status === "compliant",
    ).length;
    return frameworks.length > 0
      ? Math.round((compliantCount / frameworks.length) * 100)
      : 0;
  };

  const formatTimeAgo = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 86400));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const formatDaysUntil = (date: Date) => {
    const days = Math.floor((date.getTime() - Date.now()) / (1000 * 86400));
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {calculateOverallCompliance()}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Overall Compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{frameworks.length}</p>
                <p className="text-sm text-muted-foreground">
                  Active Frameworks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {auditLogs.filter((a) => a.status === "in_progress").length}
                </p>
                <p className="text-sm text-muted-foreground">Ongoing Audits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    frameworks.filter(
                      (f) =>
                        f.nextAudit.getTime() - Date.now() <
                        30 * 24 * 60 * 60 * 1000,
                    ).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Upcoming Audits</p>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="audits">Audit Logs</TabsTrigger>
          <TabsTrigger value="policies">Data Policies</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Overall Compliance</span>
                      <span className="text-sm font-medium">
                        {calculateOverallCompliance()}%
                      </span>
                    </div>
                    <Progress
                      value={calculateOverallCompliance()}
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {["compliant", "partial", "non_compliant", "pending"].map(
                      (status) => (
                        <div key={status} className="text-center">
                          <p
                            className={cn(
                              "text-2xl font-bold",
                              getStatusColor(status),
                            )}
                          >
                            {
                              frameworks.filter((f) => f.status === status)
                                .length
                            }
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {status.replace("_", " ")}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          getRiskColor(log.risk_rating),
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.framework} • {formatTimeAgo(log.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.findings}
                        </p>
                      </div>
                      <Badge
                        variant={
                          log.status === "closed"
                            ? "default"
                            : log.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {log.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Critical Compliance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    SOC 2 audit scheduled for next month. Physical access
                    controls require immediate attention.
                  </AlertDescription>
                </Alert>
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    GDPR data retention policies need updates for new
                    humanitarian programs by next week.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="united_states">United States</SelectItem>
                <SelectItem value="european_union">European Union</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {frameworks
              .filter((framework) => {
                const matchesSearch = framework.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
                const matchesRegion =
                  filterRegion === "all" ||
                  framework.region
                    .toLowerCase()
                    .replace(" ", "_")
                    .includes(filterRegion);
                return matchesSearch && matchesRegion;
              })
              .map((framework) => (
                <Card
                  key={framework.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-shadow",
                    selectedFramework?.id === framework.id && "border-primary",
                  )}
                  onClick={() => setSelectedFramework(framework)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFrameworkTypeIcon(framework.type)}
                        <div>
                          <p className="font-medium">{framework.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {framework.region} •{" "}
                            {framework.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm">Risk Level</p>
                          <p
                            className={cn(
                              "font-bold",
                              getRiskColor(framework.risk_level),
                            )}
                          >
                            {framework.risk_level.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Next Audit</p>
                          <p className="font-medium">
                            {formatDaysUntil(framework.nextAudit)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={getStatusColor(framework.status)}>
                            {getStatusIcon(framework.status)}
                          </div>
                          <Badge className={getStatusColor(framework.status)}>
                            {framework.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Last Audit
                        </p>
                        <p className="text-sm">
                          {formatTimeAgo(framework.lastAudit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Requirements
                        </p>
                        <p className="text-sm">
                          {
                            framework.requirements.filter(
                              (r) => r.status === "met",
                            ).length
                          }
                          /{framework.requirements.length} Met
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Certification
                        </p>
                        <Badge
                          variant={
                            framework.certification_status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {framework.certification_status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <div className="grid gap-4">
            {auditLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          getRiskColor(log.risk_rating),
                        )}
                      />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.framework} • {log.auditor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Risk Rating</p>
                        <p
                          className={cn(
                            "font-bold",
                            getRiskColor(log.risk_rating),
                          )}
                        >
                          {log.risk_rating.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Date</p>
                        <p className="font-medium">
                          {formatTimeAgo(log.timestamp)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          log.status === "closed"
                            ? "default"
                            : log.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {log.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Findings
                    </p>
                    <p className="text-sm">{log.findings}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4">
            {retentionPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{policy.data_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.purpose}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Retention Period</p>
                        <p className="font-medium">
                          {Math.round(policy.retention_period / 365)} years
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Jurisdiction</p>
                        <p className="font-medium">{policy.jurisdiction}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Lock
                        className={cn(
                          "w-4 h-4",
                          policy.encryption_required
                            ? "text-green-500"
                            : "text-gray-400",
                        )}
                      />
                      <span className="text-sm">Encryption Required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Download
                        className={cn(
                          "w-4 h-4",
                          policy.backup_required
                            ? "text-green-500"
                            : "text-gray-400",
                        )}
                      />
                      <span className="text-sm">Backup Required</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Deletion Method
                      </p>
                      <p className="text-sm">{policy.deletion_method}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Annual Compliance Report</p>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive annual review
                    </p>
                  </div>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">SOC 2 Type II Report</p>
                    <p className="text-sm text-muted-foreground">
                      Security controls assessment
                    </p>
                  </div>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">GDPR Compliance Summary</p>
                    <p className="text-sm text-muted-foreground">
                      Data protection compliance status
                    </p>
                  </div>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Reporting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Report Schedule
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Status Reports</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Weekly Compliance Summary</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Audit Digest</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quarterly Risk Assessment</span>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Framework Details */}
      {selectedFramework && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedFramework.name} - Detailed Requirements</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFramework(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Framework Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium">
                      {selectedFramework.region}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">
                      {selectedFramework.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedFramework.status)}>
                      {selectedFramework.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <span
                      className={cn(
                        "font-medium",
                        getRiskColor(selectedFramework.risk_level),
                      )}
                    >
                      {selectedFramework.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Audit Schedule</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Last Audit:</span>
                    <span className="font-medium">
                      {formatTimeAgo(selectedFramework.lastAudit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Audit:</span>
                    <span className="font-medium">
                      {formatDaysUntil(selectedFramework.nextAudit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certification:</span>
                    <Badge
                      variant={
                        selectedFramework.certification_status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedFramework.certification_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Requirements</h4>
              <div className="space-y-3">
                {selectedFramework.requirements.map((requirement) => (
                  <div
                    key={requirement.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(requirement.status)}>
                          {getStatusIcon(requirement.status)}
                        </div>
                        <span className="font-medium">{requirement.title}</span>
                        {requirement.mandatory && (
                          <Badge variant="destructive" className="text-xs">
                            Mandatory
                          </Badge>
                        )}
                      </div>
                      <Badge className={getStatusColor(requirement.status)}>
                        {requirement.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {requirement.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">
                          Responsible:
                        </span>{" "}
                        {requirement.responsible_party}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline:</span>{" "}
                        {requirement.deadline.toLocaleDateString()}
                      </div>
                    </div>
                    {requirement.implementation_notes && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Notes:</span>{" "}
                        {requirement.implementation_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
