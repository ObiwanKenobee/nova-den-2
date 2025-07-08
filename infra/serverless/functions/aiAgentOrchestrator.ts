import { APIGatewayProxyHandler } from "aws-lambda";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { RitualAgent } from "@vaulttap/ai-agents/src/ritualAgent";
import { GovernanceAgent } from "@vaulttap/ai-agents/src/governanceAgent";
import { SyntheticAgent } from "@vaulttap/ai-agents/src/syntheticAgent";

interface AgentRequest {
  agent_type: "ritual" | "governance" | "synthetic" | "orchestration";
  operation: string;
  payload: any;
  mesh_node_id: string;
  user_id?: string;
  session_id?: string;
}

interface OrchestrationContext {
  request_id: string;
  mesh_node_id: string;
  user_id?: string;
  agents_required: string[];
  dependencies: Array<{
    agent: string;
    depends_on: string[];
  }>;
  parallel_execution: boolean;
  timeout_seconds: number;
}

const sfnClient = new SFNClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// Initialize AI agents
const ritualAgent = new RitualAgent(process.env.AWS_REGION);
const governanceAgent = new GovernanceAgent("EU", process.env.AWS_REGION);
const syntheticAgent = new SyntheticAgent(
  process.env.AWS_REGION,
  process.env.TRUST_MODEL_ENDPOINT,
);

/**
 * Main Lambda handler for AI agent orchestration
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log("AI Agent Orchestrator invoked", {
      path: event.path,
      method: event.httpMethod,
      body: event.body?.substring(0, 200),
    });

    const request: AgentRequest = JSON.parse(event.body || "{}");

    // Validate request
    if (!request.agent_type || !request.operation || !request.mesh_node_id) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({
          error: "Missing required fields: agent_type, operation, mesh_node_id",
        }),
      };
    }

    // Route to appropriate handler
    let result;
    switch (request.agent_type) {
      case "ritual":
        result = await handleRitualRequest(request);
        break;
      case "governance":
        result = await handleGovernanceRequest(request);
        break;
      case "synthetic":
        result = await handleSyntheticRequest(request);
        break;
      case "orchestration":
        result = await handleOrchestrationRequest(request);
        break;
      default:
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({
            error: `Unknown agent type: ${request.agent_type}`,
          }),
        };
    }

    // Store request and response for analytics
    await storeAnalytics(request, result);

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("AI Agent Orchestrator error:", error);

    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

/**
 * Handle ritual agent requests
 */
async function handleRitualRequest(request: AgentRequest): Promise<any> {
  const { operation, payload } = request;

  switch (operation) {
    case "analyze_ritual":
      return await ritualAgent.analyzeRitual(payload);

    case "generate_synthetic_context":
      return await ritualAgent.generateSyntheticCulturalContext(
        payload.narrative,
        payload.behavioral_patterns,
        payload.community_interactions,
      );

    case "validate_community_standards":
      return await ritualAgent.validateCommunityStandards(
        payload.ritual_type,
        payload.cultural_context,
        payload.community_feedback,
      );

    case "suggest_alternatives":
      return await ritualAgent.suggestRitualAlternatives(
        payload.original_ritual,
        payload.target_culture,
        payload.constraints,
      );

    default:
      throw new Error(`Unknown ritual operation: ${operation}`);
  }
}

/**
 * Handle governance agent requests
 */
async function handleGovernanceRequest(request: AgentRequest): Promise<any> {
  const { operation, payload } = request;

  switch (operation) {
    case "evaluate_vault_action":
      return await governanceAgent.evaluateVaultAction(payload);

    case "assess_ai_bias":
      return await governanceAgent.assessAIBias(
        payload.model_outputs,
        payload.demographic_data,
        payload.cultural_context,
      );

    case "generate_compliance_report":
      return await governanceAgent.generateComplianceReport(
        payload.time_period,
        payload.actions,
        payload.decisions,
      );

    default:
      throw new Error(`Unknown governance operation: ${operation}`);
  }
}

/**
 * Handle synthetic agent requests
 */
async function handleSyntheticRequest(request: AgentRequest): Promise<any> {
  const { operation, payload } = request;

  switch (operation) {
    case "generate_identity":
      return await syntheticAgent.generateSyntheticIdentity(payload);

    case "evolve_trust_score":
      return await syntheticAgent.evolveTrustScore(
        payload.user_id,
        payload.current_identity,
        payload.new_evidence,
      );

    case "generate_story_token":
      return await syntheticAgent.generateStoryToken(
        payload.narrative,
        payload.context,
        payload.verification_requirements,
      );

    case "validate_story_token":
      return await syntheticAgent.validateStoryToken(
        payload.story_token,
        payload.usage_context,
        payload.community_validation,
      );

    default:
      throw new Error(`Unknown synthetic operation: ${operation}`);
  }
}

/**
 * Handle complex multi-agent orchestration
 */
async function handleOrchestrationRequest(request: AgentRequest): Promise<any> {
  const { operation, payload } = request;

  switch (operation) {
    case "comprehensive_user_analysis":
      return await performComprehensiveUserAnalysis(payload);

    case "vault_action_with_full_compliance":
      return await performFullComplianceVaultAction(payload);

    case "ritual_verification_with_governance":
      return await performRitualVerificationWithGovernance(payload);

    case "synthetic_identity_with_validation":
      return await performSyntheticIdentityWithValidation(payload);

    default:
      // Use Step Functions for complex orchestration
      return await executeStepFunction(
        operation,
        payload,
        request.mesh_node_id,
      );
  }
}

/**
 * Perform comprehensive user analysis using multiple agents
 */
async function performComprehensiveUserAnalysis(payload: any): Promise<any> {
  const results = await Promise.allSettled([
    // Synthetic identity analysis
    syntheticAgent.generateSyntheticIdentity(payload.user_narrative),

    // Cultural context analysis
    ritualAgent.generateSyntheticCulturalContext(
      payload.user_narrative.story,
      payload.user_narrative.behavioral_data,
      payload.user_narrative.community_context,
    ),

    // AI bias assessment
    governanceAgent.assessAIBias(
      payload.model_outputs || [],
      payload.demographic_data || {},
      payload.cultural_context || {},
    ),
  ]);

  // Aggregate results
  const analysis = {
    synthetic_identity:
      results[0].status === "fulfilled" ? results[0].value : null,
    cultural_context:
      results[1].status === "fulfilled" ? results[1].value : null,
    bias_assessment:
      results[2].status === "fulfilled" ? results[2].value : null,
    errors: results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason?.message || "Unknown error"),
    timestamp: new Date().toISOString(),
  };

  return analysis;
}

/**
 * Perform vault action with full compliance checking
 */
async function performFullComplianceVaultAction(payload: any): Promise<any> {
  // Step 1: Governance evaluation
  const governanceResult = await governanceAgent.evaluateVaultAction(
    payload.vault_action,
  );

  if (!governanceResult.approved) {
    return {
      approved: false,
      reason: "Governance compliance failed",
      governance_result: governanceResult,
    };
  }

  // Step 2: Ritual verification if required
  let ritualResult = null;
  if (payload.ritual_verification) {
    ritualResult = await ritualAgent.analyzeRitual(payload.ritual_verification);

    if (ritualResult.authenticity_score < 0.7) {
      return {
        approved: false,
        reason: "Ritual verification failed",
        ritual_result: ritualResult,
        governance_result: governanceResult,
      };
    }
  }

  // Step 3: Synthetic trust validation if needed
  let trustResult = null;
  if (payload.synthetic_validation) {
    trustResult = await syntheticAgent.validateStoryToken(
      payload.synthetic_validation.story_token,
      payload.synthetic_validation.usage_context,
    );

    if (!trustResult.valid) {
      return {
        approved: false,
        reason: "Trust validation failed",
        trust_result: trustResult,
        ritual_result: ritualResult,
        governance_result: governanceResult,
      };
    }
  }

  return {
    approved: true,
    governance_result: governanceResult,
    ritual_result: ritualResult,
    trust_result: trustResult,
    final_approval: {
      timestamp: new Date().toISOString(),
      compliance_score: governanceResult.compliance_score,
      risk_level: governanceResult.risk_level,
    },
  };
}

/**
 * Perform ritual verification with governance oversight
 */
async function performRitualVerificationWithGovernance(
  payload: any,
): Promise<any> {
  // Parallel execution for efficiency
  const [ritualAnalysis, governanceCheck] = await Promise.all([
    ritualAgent.analyzeRitual(payload.ritual_request),
    governanceAgent.assessAIBias(
      [payload.ritual_request],
      payload.demographic_data || {},
      payload.ritual_request.cultural_context,
    ),
  ]);

  // Combine results
  const combined_result = {
    ritual_analysis: ritualAnalysis,
    governance_check: governanceCheck,
    final_decision: {
      approved:
        ritualAnalysis.authenticity_score > 0.7 &&
        ritualAnalysis.cultural_appropriateness > 0.8 &&
        !governanceCheck.bias_detected,
      confidence: Math.min(
        ritualAnalysis.authenticity_score,
        ritualAnalysis.cultural_appropriateness,
        1 - governanceCheck.bias_score,
      ),
      risk_factors: [
        ...ritualAnalysis.risk_factors,
        ...governanceCheck.affected_groups.map(
          (g) => `Potential bias against ${g}`,
        ),
      ],
    },
  };

  return combined_result;
}

/**
 * Perform synthetic identity creation with validation
 */
async function performSyntheticIdentityWithValidation(
  payload: any,
): Promise<any> {
  // Step 1: Generate synthetic identity
  const identity = await syntheticAgent.generateSyntheticIdentity(
    payload.user_narrative,
  );

  // Step 2: Validate with governance
  const governanceValidation = await governanceAgent.assessAIBias(
    [identity],
    payload.demographic_context || {},
    payload.cultural_context || {},
  );

  // Step 3: Cultural appropriateness check
  const culturalValidation = await ritualAgent.validateCommunityStandards(
    "synthetic_identity",
    payload.cultural_context || {},
    payload.community_feedback || [],
  );

  return {
    synthetic_identity: identity,
    governance_validation: governanceValidation,
    cultural_validation: culturalValidation,
    final_validation: {
      approved:
        !governanceValidation.bias_detected && culturalValidation.approved,
      trust_score_adjustment: culturalValidation.approved ? 0 : -100,
      recommendations: [
        ...governanceValidation.mitigation_strategies,
        ...culturalValidation.recommendations,
      ],
    },
  };
}

/**
 * Execute Step Functions for complex orchestration
 */
async function executeStepFunction(
  operation: string,
  payload: any,
  meshNodeId: string,
): Promise<any> {
  const context: OrchestrationContext = {
    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mesh_node_id: meshNodeId,
    user_id: payload.user_id,
    agents_required: payload.agents_required || [
      "ritual",
      "governance",
      "synthetic",
    ],
    dependencies: payload.dependencies || [],
    parallel_execution: payload.parallel_execution || false,
    timeout_seconds: payload.timeout_seconds || 300,
  };

  const executionInput = {
    operation,
    payload,
    context,
  };

  const command = new StartExecutionCommand({
    stateMachineArn: process.env.AI_ORCHESTRATION_STATE_MACHINE_ARN,
    input: JSON.stringify(executionInput),
    name: context.request_id,
  });

  try {
    const result = await sfnClient.send(command);

    return {
      execution_arn: result.executionArn,
      request_id: context.request_id,
      status: "started",
      estimated_completion: new Date(
        Date.now() + context.timeout_seconds * 1000,
      ).toISOString(),
    };
  } catch (error) {
    console.error("Step Functions execution failed:", error);
    throw new Error("Failed to start orchestration workflow");
  }
}

/**
 * Store analytics data in DynamoDB
 */
async function storeAnalytics(
  request: AgentRequest,
  result: any,
): Promise<void> {
  try {
    const analyticsItem = {
      request_id: {
        S: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      timestamp: { S: new Date().toISOString() },
      agent_type: { S: request.agent_type },
      operation: { S: request.operation },
      mesh_node_id: { S: request.mesh_node_id },
      user_id: { S: request.user_id || "anonymous" },
      session_id: { S: request.session_id || "none" },
      request_size: { N: JSON.stringify(request).length.toString() },
      response_size: { N: JSON.stringify(result).length.toString() },
      success: { BOOL: !!result },
      ttl: { N: Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60).toString() }, // 30 days
    };

    const command = new PutItemCommand({
      TableName: process.env.ANALYTICS_TABLE_NAME,
      Item: analyticsItem,
    });

    await dynamoClient.send(command);
  } catch (error) {
    console.error("Failed to store analytics:", error);
    // Don't throw - analytics failure shouldn't break the main flow
  }
}

/**
 * Get CORS headers
 */
function getCorsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  };
}
