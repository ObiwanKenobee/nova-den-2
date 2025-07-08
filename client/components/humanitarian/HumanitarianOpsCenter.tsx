import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Users,
  Globe,
  MapPin,
  AlertTriangle,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  Phone,
  Radio,
  Satellite,
  Truck,
  Home,
  Droplets,
  Wheat,
  BookOpen,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HumanitarianProgram {
  id: string;
  name: string;
  type:
    | "disaster_relief"
    | "refugee_assistance"
    | "food_security"
    | "education"
    | "healthcare"
    | "water_sanitation";
  status: "planning" | "active" | "suspended" | "completed" | "emergency";
  location: {
    country: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  beneficiaries: {
    target: number;
    reached: number;
    demographics: {
      children: number;
      women: number;
      elderly: number;
      men: number;
    };
  };
  funding: {
    target: number;
    raised: number;
    currency: string;
    donors: string[];
  };
  timeline: {
    start: Date;
    end: Date;
    milestones: {
      name: string;
      date: Date;
      completed: boolean;
    }[];
  };
  mesh_integration: {
    connected: boolean;
    nodes: string[];
    last_sync: Date;
    offline_capability: boolean;
  };
  cultural_context: {
    communities: string[];
    languages: string[];
    traditional_leaders: string[];
    cultural_considerations: string[];
  };
}

interface EmergencyAlert {
  id: string;
  type: "natural_disaster" | "conflict" | "epidemic" | "infrastructure_failure";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  description: string;
  timestamp: Date;
  status: "new" | "acknowledged" | "responding" | "resolved";
  affected_population: number;
  response_teams: string[];
  resources_needed: string[];
}

interface FieldTeam {
  id: string;
  name: string;
  location: string;
  size: number;
  status: "deployed" | "standby" | "returning" | "training";
  specialization: string[];
  contact_info: {
    radio_frequency: string;
    satellite_phone: string;
    mesh_node_id: string;
  };
  current_assignment: string;
  last_update: Date;
}

interface ResourceInventory {
  id: string;
  type: "medical" | "food" | "shelter" | "water" | "education" | "technology";
  name: string;
  quantity: number;
  unit: string;
  location: string;
  status: "available" | "deployed" | "in_transit" | "low_stock";
  expiry_date?: Date;
  allocation: {
    program_id: string;
    quantity: number;
  }[];
}

export default function HumanitarianOpsCenter() {
  const [programs, setPrograms] = useState<HumanitarianProgram[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [fieldTeams, setFieldTeams] = useState<FieldTeam[]>([]);
  const [inventory, setInventory] = useState<ResourceInventory[]>([]);
  const [selectedProgram, setSelectedProgram] =
    useState<HumanitarianProgram | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHumanitarianData();
    const interval = setInterval(loadHumanitarianData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHumanitarianData = async () => {
    try {
      // Simulate comprehensive humanitarian operations data
      const mockPrograms: HumanitarianProgram[] = [
        {
          id: "prog_001",
          name: "East Africa Drought Relief",
          type: "disaster_relief",
          status: "active",
          location: {
            country: "Kenya",
            region: "Turkana County",
            coordinates: { lat: 3.1167, lng: 35.6 },
          },
          beneficiaries: {
            target: 50000,
            reached: 32000,
            demographics: {
              children: 18000,
              women: 15000,
              elderly: 3500,
              men: 13500,
            },
          },
          funding: {
            target: 2500000,
            raised: 1750000,
            currency: "USD",
            donors: ["UN WFP", "USAID", "EU Humanitarian Aid", "VaultTap DAO"],
          },
          timeline: {
            start: new Date(Date.now() - 86400000 * 60), // 60 days ago
            end: new Date(Date.now() + 86400000 * 120), // 120 days from now
            milestones: [
              {
                name: "Emergency Assessment",
                date: new Date(Date.now() - 86400000 * 55),
                completed: true,
              },
              {
                name: "Food Distribution Setup",
                date: new Date(Date.now() - 86400000 * 30),
                completed: true,
              },
              {
                name: "Water System Repair",
                date: new Date(Date.now() + 86400000 * 15),
                completed: false,
              },
            ],
          },
          mesh_integration: {
            connected: true,
            nodes: ["node_ke_001", "node_ke_007", "node_ke_015"],
            last_sync: new Date(Date.now() - 900000), // 15 minutes ago
            offline_capability: true,
          },
          cultural_context: {
            communities: ["Turkana", "Pokot", "Samburu"],
            languages: ["Turkana", "Pokot", "Swahili"],
            traditional_leaders: ["Chief John Lokales", "Elder Mary Akiru"],
            cultural_considerations: [
              "Pastoralist lifestyle patterns",
              "Traditional water rights",
              "Seasonal migration routes",
            ],
          },
        },
        {
          id: "prog_002",
          name: "Syrian Refugee Education Initiative",
          type: "education",
          status: "active",
          location: {
            country: "Jordan",
            region: "Zaatari Camp",
            coordinates: { lat: 32.2944, lng: 36.3267 },
          },
          beneficiaries: {
            target: 15000,
            reached: 12500,
            demographics: {
              children: 9000,
              women: 3500,
              elderly: 500,
              men: 2500,
            },
          },
          funding: {
            target: 800000,
            raised: 650000,
            currency: "USD",
            donors: ["UNICEF", "Save the Children", "VaultTap Community"],
          },
          timeline: {
            start: new Date(Date.now() - 86400000 * 180), // 6 months ago
            end: new Date(Date.now() + 86400000 * 365), // 1 year from now
            milestones: [
              {
                name: "School Infrastructure Setup",
                date: new Date(Date.now() - 86400000 * 150),
                completed: true,
              },
              {
                name: "Teacher Training Program",
                date: new Date(Date.now() - 86400000 * 90),
                completed: true,
              },
              {
                name: "Digital Learning Platform",
                date: new Date(Date.now() + 86400000 * 30),
                completed: false,
              },
            ],
          },
          mesh_integration: {
            connected: true,
            nodes: ["node_jo_003", "node_jo_008"],
            last_sync: new Date(Date.now() - 600000), // 10 minutes ago
            offline_capability: true,
          },
          cultural_context: {
            communities: ["Syrian refugees", "Host community"],
            languages: ["Arabic", "Kurdish"],
            traditional_leaders: ["Camp Elder Council"],
            cultural_considerations: [
              "Trauma-informed education",
              "Gender-sensitive programming",
              "Religious observance",
            ],
          },
        },
      ];

      const mockEmergencyAlerts: EmergencyAlert[] = [
        {
          id: "alert_001",
          type: "natural_disaster",
          severity: "high",
          location: "Philippines - Mindanao",
          description: "Typhoon Mawar approaching with Category 4 winds",
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: "responding",
          affected_population: 120000,
          response_teams: ["Team Alpha", "Team Delta"],
          resources_needed: [
            "Emergency shelter kits",
            "Water purification tablets",
            "Medical supplies",
          ],
        },
        {
          id: "alert_002",
          type: "conflict",
          severity: "critical",
          location: "South Sudan - Upper Nile",
          description: "Renewed violence forcing population displacement",
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          status: "acknowledged",
          affected_population: 45000,
          response_teams: ["Team Bravo"],
          resources_needed: [
            "Emergency food rations",
            "Family tents",
            "Security assessment",
          ],
        },
      ];

      const mockFieldTeams: FieldTeam[] = [
        {
          id: "team_001",
          name: "Team Alpha - East Africa",
          location: "Turkana, Kenya",
          size: 12,
          status: "deployed",
          specialization: ["Emergency response", "Water systems", "Nutrition"],
          contact_info: {
            radio_frequency: "146.520 MHz",
            satellite_phone: "+881-677-123-456",
            mesh_node_id: "node_ke_001",
          },
          current_assignment: "East Africa Drought Relief",
          last_update: new Date(Date.now() - 1800000), // 30 minutes ago
        },
        {
          id: "team_002",
          name: "Team Bravo - Middle East",
          location: "Zaatari, Jordan",
          size: 8,
          status: "deployed",
          specialization: [
            "Education",
            "Child protection",
            "Community engagement",
          ],
          contact_info: {
            radio_frequency: "147.420 MHz",
            satellite_phone: "+881-677-789-012",
            mesh_node_id: "node_jo_003",
          },
          current_assignment: "Syrian Refugee Education Initiative",
          last_update: new Date(Date.now() - 600000), // 10 minutes ago
        },
      ];

      const mockInventory: ResourceInventory[] = [
        {
          id: "inv_001",
          type: "food",
          name: "High Energy Biscuits",
          quantity: 5000,
          unit: "cartons",
          location: "Nairobi Warehouse",
          status: "available",
          allocation: [
            { program_id: "prog_001", quantity: 2000 },
            { program_id: "prog_003", quantity: 1500 },
          ],
        },
        {
          id: "inv_002",
          type: "medical",
          name: "Oral Rehydration Salts",
          quantity: 200,
          unit: "boxes",
          location: "Regional Medical Store",
          status: "low_stock",
          expiry_date: new Date(Date.now() + 86400000 * 180), // 6 months
          allocation: [{ program_id: "prog_001", quantity: 150 }],
        },
        {
          id: "inv_003",
          type: "technology",
          name: "Satellite Communication Units",
          quantity: 15,
          unit: "units",
          location: "Equipment Center",
          status: "deployed",
          allocation: [
            { program_id: "prog_001", quantity: 8 },
            { program_id: "prog_002", quantity: 7 },
          ],
        },
      ];

      setPrograms(mockPrograms);
      setEmergencyAlerts(mockEmergencyAlerts);
      setFieldTeams(mockFieldTeams);
      setInventory(mockInventory);

      if (!selectedProgram && mockPrograms.length > 0) {
        setSelectedProgram(mockPrograms[0]);
      }
    } catch (error) {
      console.error("Failed to load humanitarian data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "deployed":
      case "available":
        return "text-green-500";
      case "emergency":
      case "critical":
      case "high":
        return "text-red-500";
      case "planning":
      case "standby":
      case "medium":
        return "text-yellow-500";
      case "suspended":
      case "low_stock":
        return "text-orange-500";
      case "completed":
      case "resolved":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "deployed":
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "emergency":
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "completed":
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgramTypeIcon = (type: string) => {
    switch (type) {
      case "disaster_relief":
        return <AlertTriangle className="w-4 h-4" />;
      case "refugee_assistance":
        return <Home className="w-4 h-4" />;
      case "food_security":
        return <Wheat className="w-4 h-4" />;
      case "education":
        return <BookOpen className="w-4 h-4" />;
      case "healthcare":
        return <Heart className="w-4 h-4" />;
      case "water_sanitation":
        return <Droplets className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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

  const calculateTotalBeneficiaries = () => {
    return programs.reduce(
      (sum, program) => sum + program.beneficiaries.reached,
      0,
    );
  };

  const calculateTotalFunding = () => {
    return programs.reduce((sum, program) => sum + program.funding.raised, 0);
  };

  return (
    <div className="space-y-6">
      {/* Humanitarian Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {calculateTotalBeneficiaries().toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">People Reached</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(calculateTotalFunding(), "USD")}
                </p>
                <p className="text-sm text-muted-foreground">Funds Raised</p>
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
                  {programs.filter((p) => p.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Programs</p>
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
                    emergencyAlerts.filter((a) => a.status !== "resolved")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alerts */}
      {emergencyAlerts.filter((a) => a.status !== "resolved").length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Emergency Alerts</span>
          </h3>
          {emergencyAlerts
            .filter((alert) => alert.status !== "resolved")
            .map((alert) => (
              <Alert
                key={alert.id}
                className={cn(
                  "border-l-4",
                  alert.severity === "critical"
                    ? "border-l-red-500 bg-red-50"
                    : alert.severity === "high"
                      ? "border-l-orange-500 bg-orange-50"
                      : "border-l-yellow-500 bg-yellow-50",
                )}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {alert.location} - {alert.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {alert.affected_population.toLocaleString()} people
                        affected • {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{alert.status}</Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="teams">Field Teams</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="coordination">Coordination</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Operations Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className="h-64 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  <div className="text-center">
                    <Globe className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Interactive Operations Map</p>
                    <p className="text-sm text-gray-500">
                      {programs.length} active programs across{" "}
                      {new Set(programs.map((p) => p.location.country)).size}{" "}
                      countries
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Beneficiary Reach</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        (calculateTotalBeneficiaries() /
                          programs.reduce(
                            (sum, p) => sum + p.beneficiaries.target,
                            0,
                          )) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (calculateTotalBeneficiaries() /
                        programs.reduce(
                          (sum, p) => sum + p.beneficiaries.target,
                          0,
                        )) *
                        100,
                    )}
                    className="h-3"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Funding Progress</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        (calculateTotalFunding() /
                          programs.reduce(
                            (sum, p) => sum + p.funding.target,
                            0,
                          )) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (calculateTotalFunding() /
                        programs.reduce(
                          (sum, p) => sum + p.funding.target,
                          0,
                        )) *
                        100,
                    )}
                    className="h-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {fieldTeams.filter((t) => t.status === "deployed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Teams Deployed
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {
                        programs.filter((p) => p.mesh_integration.connected)
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mesh Connected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm">
                      Food distribution completed in Turkana County
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 hours ago • 1,200 families reached
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm">
                      Educational supplies delivered to Zaatari Camp
                    </p>
                    <p className="text-xs text-muted-foreground">
                      4 hours ago • 500 students benefited
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <div>
                    <p className="text-sm">
                      Mesh network synchronized with satellite relay
                    </p>
                    <p className="text-xs text-muted-foreground">
                      6 hours ago • 15 nodes updated
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
                <SelectItem value="middle_east">Middle East</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="americas">Americas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {programs.map((program) => (
              <Card
                key={program.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  selectedProgram?.id === program.id && "border-primary",
                )}
                onClick={() => setSelectedProgram(program)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getProgramTypeIcon(program.type)}
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {program.location.region}, {program.location.country}{" "}
                          • {program.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Beneficiaries</p>
                        <p className="font-bold">
                          {program.beneficiaries.reached.toLocaleString()} /{" "}
                          {program.beneficiaries.target.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Funding</p>
                        <p className="font-bold text-green-500">
                          {Math.round(
                            (program.funding.raised / program.funding.target) *
                              100,
                          )}
                          %
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(program.status)}>
                          {getStatusIcon(program.status)}
                        </div>
                        <Badge className={getStatusColor(program.status)}>
                          {program.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Mesh Status
                      </p>
                      <div className="flex items-center space-x-1">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            program.mesh_integration.connected
                              ? "bg-green-500"
                              : "bg-red-500",
                          )}
                        />
                        <span className="text-sm">
                          {program.mesh_integration.connected
                            ? "Connected"
                            : "Offline"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timeline</p>
                      <p className="text-sm">
                        {Math.round(
                          ((Date.now() - program.timeline.start.getTime()) /
                            (program.timeline.end.getTime() -
                              program.timeline.start.getTime())) *
                            100,
                        )}
                        % Complete
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Communities
                      </p>
                      <p className="text-sm">
                        {program.cultural_context.communities.length} groups
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Languages</p>
                      <p className="text-sm">
                        {program.cultural_context.languages.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4">
            {fieldTeams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.location} • {team.size} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Assignment</p>
                        <p className="font-medium">{team.current_assignment}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Last Update</p>
                        <p className="font-medium">
                          {formatTimeAgo(team.last_update)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Specializations
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {team.specialization.map((spec, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          {team.contact_info.radio_frequency}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Satellite className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          {team.contact_info.satellite_phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">
                          {team.contact_info.mesh_node_id}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4">
            {inventory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        {item.type === "food" && (
                          <Wheat className="w-6 h-6 text-white" />
                        )}
                        {item.type === "medical" && (
                          <Heart className="w-6 h-6 text-white" />
                        )}
                        {item.type === "technology" && (
                          <Zap className="w-6 h-6 text-white" />
                        )}
                        {!["food", "medical", "technology"].includes(
                          item.type,
                        ) && <Truck className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.location} • {item.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Quantity</p>
                        <p className="font-bold">
                          {item.quantity.toLocaleString()} {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Allocated</p>
                        <p className="font-medium">
                          {item.allocation
                            .reduce((sum, alloc) => sum + alloc.quantity, 0)
                            .toLocaleString()}{" "}
                          {item.unit}
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {item.expiry_date && (
                    <div className="mt-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">
                        Expires: {item.expiry_date.toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {item.allocation.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Allocations
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.allocation.map((alloc, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {alloc.program_id}: {alloc.quantity} {item.unit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coordination" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Radio className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Emergency Radio Network</p>
                      <p className="text-sm text-muted-foreground">
                        Primary coordination channel
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Satellite className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Satellite Communication</p>
                      <p className="text-sm text-muted-foreground">
                        Backup for remote areas
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium">VaultTap Mesh Network</p>
                      <p className="text-sm text-muted-foreground">
                        Secure cultural data sync
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partner Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">UN World Food Programme</span>
                    <Badge variant="default">Active Partner</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">UNICEF</span>
                    <Badge variant="default">Active Partner</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Save the Children</span>
                    <Badge variant="default">Active Partner</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Médecins Sans Frontières</span>
                    <Badge variant="secondary">Standby</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VaultTap DAO Community</span>
                    <Badge variant="default">Cultural Partner</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coordination Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button>
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Coordination Call
                </Button>
                <Button variant="outline">
                  <Radio className="w-4 h-4 mr-2" />
                  Broadcast Alert
                </Button>
                <Button variant="outline">
                  <Satellite className="w-4 h-4 mr-2" />
                  Satellite Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Program Details */}
      {selectedProgram && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {getProgramTypeIcon(selectedProgram.type)}{" "}
                {selectedProgram.name} - Detailed View
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProgram(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Program Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">
                      {selectedProgram.location.region},{" "}
                      {selectedProgram.location.country}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">
                      {selectedProgram.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedProgram.status)}>
                      {selectedProgram.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {selectedProgram.timeline.start.toLocaleDateString()} -{" "}
                      {selectedProgram.timeline.end.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Impact Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Beneficiaries Reached</span>
                      <span className="font-medium">
                        {selectedProgram.beneficiaries.reached.toLocaleString()}{" "}
                        /{" "}
                        {selectedProgram.beneficiaries.target.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedProgram.beneficiaries.reached /
                          selectedProgram.beneficiaries.target) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        {formatCurrency(
                          selectedProgram.funding.raised,
                          selectedProgram.funding.currency,
                        )}{" "}
                        /{" "}
                        {formatCurrency(
                          selectedProgram.funding.target,
                          selectedProgram.funding.currency,
                        )}
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedProgram.funding.raised /
                          selectedProgram.funding.target) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Cultural Context</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Communities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProgram.cultural_context.communities.map(
                      (community, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {community}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProgram.cultural_context.languages.map(
                      (language, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {language}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Cultural Considerations
                </p>
                <div className="text-sm">
                  {selectedProgram.cultural_context.cultural_considerations.join(
                    ", ",
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Mesh Integration Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      selectedProgram.mesh_integration.connected
                        ? "bg-green-500"
                        : "bg-red-500",
                    )}
                  />
                  <span className="text-sm">
                    {selectedProgram.mesh_integration.connected
                      ? "Connected to mesh network"
                      : "Disconnected from mesh"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Sync:</span>{" "}
                  {formatTimeAgo(selectedProgram.mesh_integration.last_sync)}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">
                  Connected Nodes
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedProgram.mesh_integration.nodes.map((node, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {node}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
