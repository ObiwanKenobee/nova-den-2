import React, { useState } from "react";
import {
  Settings,
  Power,
  AlertTriangle,
  Shield,
  Database,
  Globe,
  Users,
  DollarSign,
  Bell,
  RefreshCw,
  Download,
  Upload,
  Server,
  Activity,
  Lock,
  Unlock,
  Play,
  Pause,
  StopCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface SystemService {
  id: string;
  name: string;
  description: string;
  status: "running" | "stopped" | "restarting";
  auto_scale: boolean;
  maintenance_mode: boolean;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  scheduled_start: Date;
  scheduled_end: Date;
  status: "scheduled" | "active" | "completed";
  affected_services: string[];
}

interface EmergencyAction {
  id: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  requires_confirmation: boolean;
}

export function OperationalControls() {
  const [services, setServices] = useState<SystemService[]>([
    {
      id: "api",
      name: "API Gateway",
      description: "Main API endpoint for all client requests",
      status: "running",
      auto_scale: true,
      maintenance_mode: false,
    },
    {
      id: "mesh",
      name: "Bluetooth Mesh",
      description: "P2P mesh network coordination",
      status: "running",
      auto_scale: false,
      maintenance_mode: false,
    },
    {
      id: "ai",
      name: "AI Agents",
      description: "Governance and ritual verification agents",
      status: "running",
      auto_scale: true,
      maintenance_mode: false,
    },
    {
      id: "payments",
      name: "Payment Processing",
      description: "Financial transaction processing",
      status: "running",
      auto_scale: false,
      maintenance_mode: false,
    },
    {
      id: "analytics",
      name: "Revenue Analytics",
      description: "Real-time revenue and usage analytics",
      status: "running",
      auto_scale: true,
      maintenance_mode: false,
    },
  ]);

  const [maintenanceWindows, setMaintenanceWindows] = useState<
    MaintenanceWindow[]
  >([
    {
      id: "mw1",
      title: "Database Migration",
      scheduled_start: new Date(Date.now() + 86400000 * 2),
      scheduled_end: new Date(Date.now() + 86400000 * 2 + 7200000),
      status: "scheduled",
      affected_services: ["api", "analytics"],
    },
    {
      id: "mw2",
      title: "AI Model Update",
      scheduled_start: new Date(Date.now() + 86400000 * 7),
      scheduled_end: new Date(Date.now() + 86400000 * 7 + 3600000),
      status: "scheduled",
      affected_services: ["ai"],
    },
  ]);

  const [emergencyActions] = useState<EmergencyAction[]>([
    {
      id: "rate_limit",
      name: "Enable Rate Limiting",
      description: "Activate aggressive rate limiting to prevent overload",
      severity: "medium",
      requires_confirmation: false,
    },
    {
      id: "maintenance_mode",
      name: "Global Maintenance Mode",
      description: "Put entire platform into maintenance mode",
      severity: "high",
      requires_confirmation: true,
    },
    {
      id: "emergency_shutdown",
      name: "Emergency Shutdown",
      description: "Immediate shutdown of all non-critical services",
      severity: "critical",
      requires_confirmation: true,
    },
    {
      id: "scale_up",
      name: "Emergency Scale Up",
      description: "Rapidly scale all services to maximum capacity",
      severity: "medium",
      requires_confirmation: false,
    },
  ]);

  const [newMaintenanceTitle, setNewMaintenanceTitle] = useState("");
  const [newMaintenanceStart, setNewMaintenanceStart] = useState("");
  const [newMaintenanceEnd, setNewMaintenanceEnd] = useState("");
  const [newMaintenanceServices, setNewMaintenanceServices] = useState<
    string[]
  >([]);

  const handleServiceToggle = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status: service.status === "running" ? "stopped" : "restarting",
            }
          : service,
      ),
    );

    toast({
      title: "Service Action",
      description: `Service ${serviceId} is being toggled...`,
    });

    // Simulate status change
    setTimeout(() => {
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? {
                ...service,
                status: service.status === "running" ? "stopped" : "running",
              }
            : service,
        ),
      );
    }, 2000);
  };

  const handleAutoScaleToggle = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, auto_scale: !service.auto_scale }
          : service,
      ),
    );
  };

  const handleMaintenanceModeToggle = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, maintenance_mode: !service.maintenance_mode }
          : service,
      ),
    );
  };

  const handleEmergencyAction = (actionId: string) => {
    const action = emergencyActions.find((a) => a.id === actionId);
    if (!action) return;

    toast({
      title: "Emergency Action Executed",
      description: action.description,
      variant: action.severity === "critical" ? "destructive" : "default",
    });
  };

  const scheduleMaintenanceWindow = () => {
    if (!newMaintenanceTitle || !newMaintenanceStart || !newMaintenanceEnd) {
      toast({
        title: "Error",
        description: "Please fill in all maintenance window fields",
        variant: "destructive",
      });
      return;
    }

    const newWindow: MaintenanceWindow = {
      id: `mw${Date.now()}`,
      title: newMaintenanceTitle,
      scheduled_start: new Date(newMaintenanceStart),
      scheduled_end: new Date(newMaintenanceEnd),
      status: "scheduled",
      affected_services: newMaintenanceServices,
    };

    setMaintenanceWindows((prev) => [...prev, newWindow]);
    setNewMaintenanceTitle("");
    setNewMaintenanceStart("");
    setNewMaintenanceEnd("");
    setNewMaintenanceServices([]);

    toast({
      title: "Maintenance Window Scheduled",
      description: `${newWindow.title} has been scheduled successfully`,
    });
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "stopped":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "restarting":
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "stopped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "restarting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 hover:bg-red-600";
      case "high":
        return "bg-orange-500 hover:bg-orange-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-500" />
            Service Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 rounded-lg border bg-card/50 gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getServiceStatusIcon(service.status)}
                    <h4 className="font-medium">{service.name}</h4>
                    <Badge
                      className={cn(
                        "text-xs",
                        getServiceStatusColor(service.status),
                      )}
                    >
                      {service.status}
                    </Badge>
                    {service.maintenance_mode && (
                      <Badge variant="outline" className="text-xs">
                        Maintenance
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`auto-scale-${service.id}`}>
                        Auto Scale
                      </Label>
                      <Switch
                        id={`auto-scale-${service.id}`}
                        checked={service.auto_scale}
                        onCheckedChange={() =>
                          handleAutoScaleToggle(service.id)
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`maintenance-${service.id}`}>
                        Maintenance
                      </Label>
                      <Switch
                        id={`maintenance-${service.id}`}
                        checked={service.maintenance_mode}
                        onCheckedChange={() =>
                          handleMaintenanceModeToggle(service.id)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleServiceToggle(service.id)}
                      disabled={service.status === "restarting"}
                    >
                      {service.status === "running" ? (
                        <Pause className="w-4 h-4 mr-1" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      {service.status === "running" ? "Stop" : "Start"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Restart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyActions.map((action) => (
              <div key={action.id} className="p-4 rounded-lg border bg-card/50">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{action.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-xs text-white",
                        action.severity === "critical"
                          ? "bg-red-500"
                          : action.severity === "high"
                            ? "bg-orange-500"
                            : action.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-blue-500",
                      )}
                    >
                      {action.severity}
                    </Badge>
                    {action.requires_confirmation ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            className={getSeverityColor(action.severity)}
                          >
                            Execute
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Emergency Action
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to execute "{action.name}"?
                              This action cannot be undone and may affect system
                              availability.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEmergencyAction(action.id)}
                              className={getSeverityColor(action.severity)}
                            >
                              Execute
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEmergencyAction(action.id)}
                        className={getSeverityColor(action.severity)}
                      >
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Windows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-purple-500" />
            Maintenance Windows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Schedule New Maintenance */}
            <div className="p-4 rounded-lg border bg-card/50">
              <h4 className="font-medium mb-4">Schedule New Maintenance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-title">Title</Label>
                  <Input
                    id="maintenance-title"
                    placeholder="Maintenance window title"
                    value={newMaintenanceTitle}
                    onChange={(e) => setNewMaintenanceTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-start">Start Time</Label>
                  <Input
                    id="maintenance-start"
                    type="datetime-local"
                    value={newMaintenanceStart}
                    onChange={(e) => setNewMaintenanceStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-end">End Time</Label>
                  <Input
                    id="maintenance-end"
                    type="datetime-local"
                    value={newMaintenanceEnd}
                    onChange={(e) => setNewMaintenanceEnd(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Affected Services</Label>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <Button
                        key={service.id}
                        variant={
                          newMaintenanceServices.includes(service.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setNewMaintenanceServices((prev) =>
                            prev.includes(service.id)
                              ? prev.filter((id) => id !== service.id)
                              : [...prev, service.id],
                          );
                        }}
                      >
                        {service.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="mt-4" onClick={scheduleMaintenanceWindow}>
                Schedule Maintenance
              </Button>
            </div>

            {/* Existing Maintenance Windows */}
            <div className="space-y-4">
              <h4 className="font-medium">Scheduled Maintenance</h4>
              {maintenanceWindows.map((window) => (
                <div
                  key={window.id}
                  className="p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h5 className="font-medium">{window.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {window.scheduled_start.toLocaleString()} -{" "}
                        {window.scheduled_end.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {window.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Services: {window.affected_services.join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-500" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              Export Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="w-6 h-6 mb-2" />
              Import Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <RefreshCw className="w-6 h-6 mb-2" />
              Sync Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
