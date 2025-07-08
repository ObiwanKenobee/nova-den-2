import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { EventEmitter } from "events";
import { logger } from "./utils/logger";
import { z } from "zod";

// Compliance frameworks
const ComplianceFrameworkSchema = z.object({
  gdpr: z.object({
    data_minimization: z.boolean(),
    consent_required: z.boolean(),
    right_to_erasure: z.boolean(),
    data_portability: z.boolean(),
  }),
  iso42001: z.object({
    ai_risk_assessment: z.boolean(),
    bias_monitoring: z.boolean(),
    transparency_required: z.boolean(),
    human_oversight: z.boolean(),
  }),
  eu_ai_act: z.object({
    risk_category: z.enum(["minimal", "limited", "high", "unacceptable"]),
    prohibited_practices: z.array(z.string()),
    transparency_obligations: z.boolean(),
    human_oversight_required: z.boolean(),
  }),
  fisma: z.object({
    security_controls: z.array(z.string()),
    continuous_monitoring: z.boolean(),
    incident_response: z.boolean(),
  }),
  digital_services_act: z.object({
    content_moderation: z.boolean(),
    risk_assessment: z.boolean(),
    transparency_reporting: z.boolean(),
  }),
});

const GovernanceDecisionSchema = z.object({
  approved: z.boolean(),
  confidence: z.number().min(0).max(1),
  compliance_score: z.number().min(0).max(1),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  violations: z.array(z.string()),
  recommendations: z.array(z.string()),
  required_actions: z.array(z.string()),
  monitoring_requirements: z.array(z.string()),
});

export interface VaultAction {
  action_type:
    | "create"
    | "deposit"
    | "withdraw"
    | "transfer"
    | "lock"
    | "unlock";
  user_id: string;
  vault_id?: string;
  amount?: number;
  currency: string;
  purpose: string;
  metadata: {
    cultural_context?: any;
    ritual_verification?: any;
    ai_involvement?: {
      models_used: string[];
      decision_factors: string[];
      bias_assessment: any;
    };
    data_processing?: {
      personal_data: boolean;
      sensitive_data: boolean;
      cross_border: boolean;
    };
  };
}

export interface GovernanceDecision {
  approved: boolean;
  confidence: number;
  compliance_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  violations: string[];
  recommendations: string[];
  required_actions: string[];
  monitoring_requirements: string[];
}

export class GovernanceAgent extends EventEmitter {
  private bedrock: BedrockRuntimeClient;
  private modelId: string = "anthropic.claude-3-sonnet-20240229-v1:0";
  private jurisdiction: string;
  private complianceFrameworks: any;

  constructor(jurisdiction: string = "EU", region: string = "us-east-1") {
    super();
    this.bedrock = new BedrockRuntimeClient({ region });
    this.jurisdiction = jurisdiction;
    this.complianceFrameworks = this.initializeComplianceFrameworks();
  }

  /**
   * Evaluate vault action against all applicable compliance frameworks
   */
  async evaluateVaultAction(action: VaultAction): Promise<GovernanceDecision> {
    try {
      logger.info(`Evaluating vault action for compliance`, {
        action_type: action.action_type,
        user_id: action.user_id,
        jurisdiction: this.jurisdiction,
      });

      // Parallel compliance checks
      const [
        gdprCompliance,
        iso42001Compliance,
        euAiActCompliance,
        fismaCompliance,
        ethicalCompliance,
      ] = await Promise.all([
        this.checkGDPRCompliance(action),
        this.checkISO42001Compliance(action),
        this.checkEUAiActCompliance(action),
        this.checkFISMACompliance(action),
        this.checkEthicalCompliance(action),
      ]);

      // Aggregate compliance results
      const decision = await this.aggregateComplianceResults([
        gdprCompliance,
        iso42001Compliance,
        euAiActCompliance,
        fismaCompliance,
        ethicalCompliance,
      ]);

      const validatedDecision = GovernanceDecisionSchema.parse(decision);

      logger.info(`Governance decision completed`, {
        approved: validatedDecision.approved,
        risk_level: validatedDecision.risk_level,
        compliance_score: validatedDecision.compliance_score,
      });

      this.emit("governanceDecision", {
        action,
        decision: validatedDecision,
      });

      return validatedDecision;
    } catch (error) {
      logger.error("Governance evaluation failed:", error);
      throw new Error("Failed to evaluate vault action compliance");
    }
  }

  /**
   * Assess AI bias and fairness in decision making
   */
  async assessAIBias(
    model_outputs: any[],
    demographic_data: any,
    cultural_context: any,
  ): Promise<{
    bias_detected: boolean;
    bias_score: number;
    affected_groups: string[];
    mitigation_strategies: string[];
  }> {
    const prompt = `
    As an AI ethics expert and bias detection specialist, analyze these AI model outputs for bias:

    Model Outputs: ${JSON.stringify(model_outputs, null, 2)}
    Demographic Context: ${JSON.stringify(demographic_data, null, 2)}
    Cultural Context: ${JSON.stringify(cultural_context, null, 2)}

    Analyze for:
    1. Demographic bias (age, gender, ethnicity, etc.)
    2. Cultural bias and assumptions
    3. Socioeconomic bias
    4. Geographic/regional bias
    5. Religious or spiritual bias
    6. Language and communication bias

    Evaluate:
    - Disparate impact on protected groups
    - Fairness across different demographics
    - Cultural sensitivity and inclusivity
    - Systemic advantages/disadvantages
    - Algorithmic discrimination potential

    Return JSON with bias assessment and mitigation strategies.
    `;

    try {
      const response = await this.invokeClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error("AI bias assessment failed:", error);
      throw error;
    }
  }

  /**
   * Generate compliance report for regulatory authorities
   */
  async generateComplianceReport(
    time_period: { start: Date; end: Date },
    actions: VaultAction[],
    decisions: GovernanceDecision[],
  ): Promise<{
    summary: any;
    violations: any[];
    risk_trends: any;
    recommendations: string[];
    regulatory_submissions: any[];
  }> {
    const prompt = `
    As a regulatory compliance expert, generate a comprehensive compliance report:

    Time Period: ${time_period.start.toISOString()} to ${time_period.end.toISOString()}
    Total Actions: ${actions.length}
    Decisions Made: ${decisions.length}
    Jurisdiction: ${this.jurisdiction}

    Actions Summary: ${JSON.stringify(this.summarizeActions(actions), null, 2)}
    Compliance Decisions: ${JSON.stringify(
      this.summarizeDecisions(decisions),
      null,
      2,
    )}

    Generate report covering:
    1. Executive Summary
    2. Compliance Framework Adherence
    3. Risk Assessment and Trends
    4. Violation Analysis and Remediation
    5. AI System Performance and Bias Monitoring
    6. Data Protection and Privacy Compliance
    7. Recommendations for Improvement
    8. Regulatory Submission Requirements

    Return comprehensive JSON report suitable for regulatory submission.
    `;

    try {
      const response = await this.invokeClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error("Compliance report generation failed:", error);
      throw error;
    }
  }

  /**
   * Check GDPR compliance
   */
  private async checkGDPRCompliance(action: VaultAction): Promise<any> {
    const prompt = `
    Evaluate this vault action for GDPR compliance:

    Action: ${JSON.stringify(action, null, 2)}

    Check:
    1. Data minimization principle
    2. Lawful basis for processing
    3. Consent requirements
    4. Right to erasure implications
    5. Data portability
    6. Cross-border transfer rules
    7. Special category data handling

    Return JSON with compliance assessment.
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Check ISO 42001 AI Management compliance
   */
  private async checkISO42001Compliance(action: VaultAction): Promise<any> {
    const prompt = `
    Evaluate this AI-involved vault action for ISO 42001 compliance:

    Action: ${JSON.stringify(action, null, 2)}

    Assess:
    1. AI risk management
    2. Bias monitoring and mitigation
    3. Transparency and explainability
    4. Human oversight requirements
    5. Continuous monitoring
    6. Impact assessment
    7. Stakeholder involvement

    Return JSON with ISO 42001 compliance assessment.
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Check EU AI Act compliance
   */
  private async checkEUAiActCompliance(action: VaultAction): Promise<any> {
    const prompt = `
    Evaluate this AI system action for EU AI Act compliance:

    Action: ${JSON.stringify(action, null, 2)}

    Determine:
    1. AI system risk category (minimal/limited/high/unacceptable)
    2. Prohibited AI practices
    3. Transparency obligations
    4. Human oversight requirements
    5. Conformity assessment needs
    6. CE marking requirements
    7. Post-market monitoring

    Return JSON with EU AI Act compliance assessment.
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Check FISMA security compliance
   */
  private async checkFISMACompliance(action: VaultAction): Promise<any> {
    const prompt = `
    Evaluate this financial action for FISMA security compliance:

    Action: ${JSON.stringify(action, null, 2)}

    Assess:
    1. Security control implementation
    2. Continuous monitoring
    3. Risk assessment
    4. Incident response readiness
    5. Access controls
    6. Data encryption
    7. Audit logging

    Return JSON with FISMA compliance assessment.
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Check ethical compliance and social impact
   */
  private async checkEthicalCompliance(action: VaultAction): Promise<any> {
    const prompt = `
    Evaluate this action for ethical compliance and social impact:

    Action: ${JSON.stringify(action, null, 2)}

    Consider:
    1. Cultural sensitivity and respect
    2. Social impact and equity
    3. Vulnerable population protection
    4. Consent and autonomy
    5. Transparency and trust
    6. Community benefit
    7. Potential for harm

    Return JSON with ethical compliance assessment.
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Aggregate multiple compliance results into final decision
   */
  private async aggregateComplianceResults(
    results: any[],
  ): Promise<GovernanceDecision> {
    const prompt = `
    As a regulatory compliance aggregator, synthesize these compliance assessments into a final governance decision:

    Compliance Results: ${JSON.stringify(results, null, 2)}
    Jurisdiction: ${this.jurisdiction}

    Aggregate considering:
    1. Most restrictive compliance requirement
    2. Cumulative risk factors
    3. Required actions across all frameworks
    4. Monitoring requirements
    5. Overall confidence level

    Return final governance decision JSON with approval, risk level, and comprehensive recommendations.
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Initialize compliance frameworks based on jurisdiction
   */
  private initializeComplianceFrameworks(): any {
    return {
      EU: {
        gdpr: true,
        iso42001: true,
        eu_ai_act: true,
        digital_services_act: true,
      },
      US: {
        fisma: true,
        iso42001: true,
        ccpa: true,
      },
      GLOBAL: {
        iso42001: true,
        ungp: true, // UN Guiding Principles
      },
    };
  }

  /**
   * Summarize actions for reporting
   */
  private summarizeActions(actions: VaultAction[]): any {
    return {
      total: actions.length,
      by_type: actions.reduce((acc, action) => {
        acc[action.action_type] = (acc[action.action_type] || 0) + 1;
        return acc;
      }, {} as any),
      ai_involved: actions.filter((a) => a.metadata.ai_involvement).length,
      cross_border: actions.filter(
        (a) => a.metadata.data_processing?.cross_border,
      ).length,
    };
  }

  /**
   * Summarize decisions for reporting
   */
  private summarizeDecisions(decisions: GovernanceDecision[]): any {
    return {
      total: decisions.length,
      approved: decisions.filter((d) => d.approved).length,
      by_risk_level: decisions.reduce((acc, decision) => {
        acc[decision.risk_level] = (acc[decision.risk_level] || 0) + 1;
        return acc;
      }, {} as any),
      violations: decisions.reduce((acc, d) => acc + d.violations.length, 0),
    };
  }

  /**
   * Invoke Claude model via Bedrock
   */
  private async invokeClaude(prompt: string): Promise<string> {
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      body,
      contentType: "application/json",
    });

    try {
      const response = await this.bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return responseBody.content[0].text;
    } catch (error) {
      logger.error("Claude invocation failed:", error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.removeAllListeners();
  }
}
