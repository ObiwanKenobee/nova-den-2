import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Users,
  Eye,
  Mic,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Globe,
  Camera,
  FileText,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface RitualSubmission {
  id: string;
  type: "birth_ceremony" | "coming_of_age" | "marriage" | "harvest" | "funeral";
  submittedBy: string;
  timestamp: Date;
  status: "pending" | "analyzing" | "verified" | "rejected" | "needs_elder";
  culturalContext: {
    community: string;
    region: string;
    tradition: string;
    language: string;
  };
  evidence: {
    audio: string[];
    video: string[];
    images: string[];
    documents: string[];
    location: {
      lat: number;
      lng: number;
      accuracy: number;
    };
  };
  aiAnalysis: {
    authenticity: number;
    confidence: number;
    patterns: string[];
    anomalies: string[];
    recommendation: "approve" | "reject" | "elder_review";
  };
  elderReview?: {
    elderName: string;
    elderId: string;
    decision: "approved" | "rejected" | "needs_discussion";
    wisdom: string;
    timestamp: Date;
  };
}

interface ElderProfile {
  id: string;
  name: string;
  community: string;
  expertise: string[];
  experience: number;
  verifications: number;
  trustScore: number;
  languages: string[];
  status: "active" | "consultation" | "unavailable";
}

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  model: "claude-v2" | "gpt-4" | "cultural-ai";
  accuracy: number;
  processed: number;
  status: "active" | "training" | "maintenance";
}

export default function CulturalVerificationSystem() {
  const [submissions, setSubmissions] = useState<RitualSubmission[]>([]);
  const [elders, setElders] = useState<ElderProfile[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<RitualSubmission | null>(null);
  const [activeTab, setActiveTab] = useState("submissions");
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadVerificationData();
    const interval = setInterval(loadVerificationData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadVerificationData = async () => {
    try {
      // Simulate cultural verification data
      const mockSubmissions: RitualSubmission[] = [
        {
          id: "ritual_001",
          type: "birth_ceremony",
          submittedBy: "Maria Kibet",
          timestamp: new Date(Date.now() - 1800000), // 30 min ago
          status: "analyzing",
          culturalContext: {
            community: "Kalenjin",
            region: "Rift Valley, Kenya",
            tradition: "Traditional Birth Blessing",
            language: "Kalenjin",
          },
          evidence: {
            audio: ["blessing_chant.mp3", "elder_prayers.mp3"],
            video: ["ceremony_overview.mp4"],
            images: ["ritual_setup.jpg", "participants.jpg"],
            documents: ["cultural_context.pdf"],
            location: {
              lat: 0.5143,
              lng: 35.2697,
              accuracy: 10,
            },
          },
          aiAnalysis: {
            authenticity: 92.5,
            confidence: 88.3,
            patterns: [
              "Traditional chanting patterns detected",
              "Authentic ceremonial arrangement",
              "Correct seasonal timing",
              "Elder participation confirmed",
            ],
            anomalies: ["Modern clothing in some participants"],
            recommendation: "approve",
          },
        },
        {
          id: "ritual_002",
          type: "harvest",
          submittedBy: "Emmanuel Mwangi",
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: "needs_elder",
          culturalContext: {
            community: "Kikuyu",
            region: "Central Kenya",
            tradition: "Harvest Thanksgiving",
            language: "Kikuyu",
          },
          evidence: {
            audio: ["harvest_songs.mp3"],
            video: ["thanksgiving_dance.mp4"],
            images: ["harvest_display.jpg"],
            documents: ["tradition_explanation.pdf"],
            location: {
              lat: -0.7893,
              lng: 36.9578,
              accuracy: 15,
            },
          },
          aiAnalysis: {
            authenticity: 78.2,
            confidence: 65.8,
            patterns: ["Traditional harvest songs", "Seasonal appropriateness"],
            anomalies: [
              "Some non-traditional elements present",
              "Mixed modern practices",
            ],
            recommendation: "elder_review",
          },
          elderReview: {
            elderName: "Samuel Njoroge",
            elderId: "elder_003",
            decision: "approved",
            wisdom:
              "The ceremony maintains the core elements of gratitude and community sharing, which are the essence of our harvest traditions.",
            timestamp: new Date(Date.now() - 600000),
          },
        },
      ];

      const mockElders: ElderProfile[] = [
        {
          id: "elder_001",
          name: "Grace Wanjiku",
          community: "Kikuyu",
          expertise: ["birth_ceremonies", "coming_of_age", "marriage"],
          experience: 45,
          verifications: 156,
          trustScore: 0.97,
          languages: ["Kikuyu", "Swahili", "English"],
          status: "active",
        },
        {
          id: "elder_002",
          name: "Joseph Kiplagat",
          community: "Kalenjin",
          expertise: ["harvest", "seasonal_rituals", "community_gatherings"],
          experience: 38,
          verifications: 203,
          trustScore: 0.94,
          languages: ["Kalenjin", "Swahili"],
          status: "active",
        },
        {
          id: "elder_003",
          name: "Samuel Njoroge",
          community: "Kikuyu",
          expertise: ["harvest", "ancestral_rituals", "conflict_resolution"],
          experience: 52,
          verifications: 289,
          trustScore: 0.98,
          languages: ["Kikuyu", "Swahili", "English"],
          status: "consultation",
        },
      ];

      const mockAiAgents: AIAgent[] = [
        {
          id: "agent_001",
          name: "Cultural Pattern Analyzer",
          specialization: "Audio & Visual Pattern Recognition",
          model: "claude-v2",
          accuracy: 92.3,
          processed: 1245,
          status: "active",
        },
        {
          id: "agent_002",
          name: "Language Authenticity Checker",
          specialization: "Traditional Language Verification",
          model: "gpt-4",
          accuracy: 89.7,
          processed: 892,
          status: "active",
        },
        {
          id: "agent_003",
          name: "Contextual Wisdom Validator",
          specialization: "Cultural Context & Seasonal Appropriateness",
          model: "cultural-ai",
          accuracy: 94.1,
          processed: 678,
          status: "training",
        },
      ];

      setSubmissions(mockSubmissions);
      setElders(mockElders);
      setAiAgents(mockAiAgents);
    } catch (error) {
      console.error("Failed to load verification data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "analyzing":
        return "text-blue-500";
      case "needs_elder":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "analyzing":
        return <Brain className="w-4 h-4 animate-pulse" />;
      case "needs_elder":
        return <Users className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getRitualTypeIcon = (type: string) => {
    switch (type) {
      case "birth_ceremony":
        return "👶";
      case "coming_of_age":
        return "🌱";
      case "marriage":
        return "💒";
      case "harvest":
        return "🌾";
      case "funeral":
        return "🕊️";
      default:
        return "🔮";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-muted-foreground">
                  Active Submissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {elders.filter((e) => e.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Elders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {aiAgents.filter((a) => a.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">AI Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    aiAgents.reduce((acc, agent) => acc + agent.accuracy, 0) /
                      aiAgents.length,
                  )}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
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
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="elders">Elders</TabsTrigger>
          <TabsTrigger value="ai-agents">AI Agents</TabsTrigger>
          <TabsTrigger value="submit">Submit Ritual</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedSubmission(submission)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getRitualTypeIcon(submission.type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {submission.type.replace("_", " ")} -{" "}
                          {submission.culturalContext.community}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {submission.submittedBy} •{" "}
                          {formatTimeAgo(submission.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Authenticity</p>
                        <p className="font-bold text-green-500">
                          {submission.aiAnalysis.authenticity.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="text-sm">
                        {submission.culturalContext.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Language</p>
                      <p className="text-sm">
                        {submission.culturalContext.language}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Evidence</p>
                      <p className="text-sm">
                        {submission.evidence.audio.length}A,{" "}
                        {submission.evidence.video.length}V,{" "}
                        {submission.evidence.images.length}I
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                      <p className="text-sm">
                        {submission.aiAnalysis.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="elders" className="space-y-4">
          <div className="grid gap-4">
            {elders.map((elder) => (
              <Card key={elder.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{elder.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {elder.community} Community • {elder.experience} years
                          experience
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Trust Score</p>
                        <p className="font-bold text-green-500">
                          {(elder.trustScore * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Verifications</p>
                        <p className="font-bold">{elder.verifications}</p>
                      </div>
                      <Badge
                        variant={
                          elder.status === "active" ? "default" : "secondary"
                        }
                      >
                        {elder.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Expertise
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {elder.expertise.map((exp) => (
                          <Badge
                            key={exp}
                            variant="outline"
                            className="text-xs"
                          >
                            {exp.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {elder.languages.map((lang) => (
                          <Badge
                            key={lang}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-agents" className="space-y-4">
          <div className="grid gap-4">
            {aiAgents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">Accuracy</p>
                        <p className="font-bold text-green-500">
                          {agent.accuracy.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Processed</p>
                        <p className="font-bold">{agent.processed}</p>
                      </div>
                      <Badge
                        variant={
                          agent.status === "active" ? "default" : "secondary"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Performance</span>
                      <span className="text-sm">
                        {agent.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={agent.accuracy} className="h-2" />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {agent.model}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {agent.processed} rituals processed
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Cultural Ritual for Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your ritual submission will be analyzed by our AI systems and
                  reviewed by community elders to ensure cultural authenticity
                  and preservation.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recording Interface */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Record Your Ritual
                  </h3>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {!isRecording ? (
                        <Button onClick={startRecording} size="lg">
                          <Camera className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          size="lg"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Ritual Type</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>Birth Ceremony</option>
                      <option>Coming of Age</option>
                      <option>Marriage</option>
                      <option>Harvest</option>
                      <option>Funeral</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Community</label>
                    <input
                      type="text"
                      placeholder="e.g., Kikuyu, Maasai, Luo"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Region</label>
                    <input
                      type="text"
                      placeholder="e.g., Central Kenya, Rift Valley"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <input
                      type="text"
                      placeholder="Primary language used"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Cultural Context
                    </label>
                    <textarea
                      placeholder="Explain the significance and traditional elements of this ritual..."
                      rows={3}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit for Verification
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">AI Accuracy</span>
                      <span className="text-sm font-medium">92.1%</span>
                    </div>
                    <Progress value={92.1} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Elder Agreement</span>
                      <span className="text-sm font-medium">96.7%</span>
                    </div>
                    <Progress value={96.7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cultural Preservation Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rituals Preserved</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communities Served</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages Documented</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elder Wisdom Captured</span>
                    <span className="font-medium">456 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Submission Details */}
      {selectedSubmission && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {getRitualTypeIcon(selectedSubmission.type)}{" "}
                {selectedSubmission.type.replace("_", " ")} - Detailed Analysis
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Cultural Context</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Community:</span>
                    <span className="font-medium">
                      {selectedSubmission.culturalContext.community}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium">
                      {selectedSubmission.culturalContext.region}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="font-medium">
                      {selectedSubmission.culturalContext.language}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tradition:</span>
                    <span className="font-medium">
                      {selectedSubmission.culturalContext.tradition}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">AI Analysis Results</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Authenticity Score</span>
                      <span className="font-medium">
                        {selectedSubmission.aiAnalysis.authenticity.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={selectedSubmission.aiAnalysis.authenticity}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Confidence Level</span>
                      <span className="font-medium">
                        {selectedSubmission.aiAnalysis.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={selectedSubmission.aiAnalysis.confidence}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Detected Patterns</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedSubmission.aiAnalysis.patterns.map(
                  (pattern, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{pattern}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {selectedSubmission.aiAnalysis.anomalies.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Anomalies Detected</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedSubmission.aiAnalysis.anomalies.map(
                    (anomaly, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{anomaly}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {selectedSubmission.elderReview && (
              <div>
                <h4 className="font-medium mb-3">Elder Review</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">
                      {selectedSubmission.elderReview.elderName}
                    </span>
                    <Badge
                      variant={
                        selectedSubmission.elderReview.decision === "approved"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {selectedSubmission.elderReview.decision}
                    </Badge>
                  </div>
                  <p className="text-sm italic">
                    "{selectedSubmission.elderReview.wisdom}"
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
