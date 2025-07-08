import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { EventEmitter } from "events";
import { logger } from "./utils/logger";
import { z } from "zod";

// Schemas for validation
const RitualContextSchema = z.object({
  cultural_background: z.string(),
  geographic_region: z.string(),
  language: z.string(),
  traditional_practices: z.array(z.string()),
  sacred_times: z.array(z.string()).optional(),
  community_hierarchy: z
    .object({
      elders: z.array(z.string()),
      witnesses: z.array(z.string()),
    })
    .optional(),
});

const RitualAnalysisSchema = z.object({
  authenticity_score: z.number().min(0).max(1),
  cultural_appropriateness: z.number().min(0).max(1),
  spiritual_significance: z.number().min(0).max(1),
  community_acceptance: z.number().min(0).max(1),
  risk_factors: z.array(z.string()),
  recommendations: z.array(z.string()),
  alternative_rituals: z.array(z.string()).optional(),
});

export interface RitualContext {
  cultural_background: string;
  geographic_region: string;
  language: string;
  traditional_practices: string[];
  sacred_times?: string[];
  community_hierarchy?: {
    elders: string[];
    witnesses: string[];
  };
}

export interface RitualAnalysis {
  authenticity_score: number;
  cultural_appropriateness: number;
  spiritual_significance: number;
  community_acceptance: number;
  risk_factors: string[];
  recommendations: string[];
  alternative_rituals?: string[];
}

export interface RitualVerificationRequest {
  user_id: string;
  ritual_type: string;
  cultural_context: RitualContext;
  voice_transcript?: string;
  gesture_data?: any;
  location_data?: {
    latitude: number;
    longitude: number;
    sacred_site?: boolean;
  };
  timestamp: Date;
  witnesses?: string[];
}

export class RitualAgent extends EventEmitter {
  private bedrock: BedrockRuntimeClient;
  private modelId: string = "anthropic.claude-3-sonnet-20240229-v1:0";

  constructor(region: string = "us-east-1") {
    super();
    this.bedrock = new BedrockRuntimeClient({ region });
  }

  /**
   * Analyze ritual for cultural authenticity and appropriateness
   */
  async analyzeRitual(
    request: RitualVerificationRequest,
  ): Promise<RitualAnalysis> {
    try {
      logger.info(`Analyzing ritual for user ${request.user_id}`, {
        ritual_type: request.ritual_type,
        cultural_background: request.cultural_context.cultural_background,
      });

      // Validate input
      const validatedContext = RitualContextSchema.parse(
        request.cultural_context,
      );

      const analysis = await this.performCulturalAnalysis(
        request,
        validatedContext,
      );

      // Validate output
      const validatedAnalysis = RitualAnalysisSchema.parse(analysis);

      logger.info(`Ritual analysis completed for user ${request.user_id}`, {
        authenticity_score: validatedAnalysis.authenticity_score,
        cultural_appropriateness: validatedAnalysis.cultural_appropriateness,
      });

      this.emit("ritualAnalyzed", {
        user_id: request.user_id,
        analysis: validatedAnalysis,
      });

      return validatedAnalysis;
    } catch (error) {
      logger.error("Ritual analysis failed:", error);
      throw new Error("Failed to analyze ritual");
    }
  }

  /**
   * Generate synthetic cultural context for users without formal identity
   */
  async generateSyntheticCulturalContext(
    narrative: string,
    behavioral_patterns: any[],
    community_interactions: any[],
  ): Promise<RitualContext> {
    try {
      const prompt = this.buildSyntheticContextPrompt(
        narrative,
        behavioral_patterns,
        community_interactions,
      );

      const response = await this.invokeClaude(prompt);
      const context = JSON.parse(response);

      const validatedContext = RitualContextSchema.parse(context);

      logger.info("Generated synthetic cultural context", {
        cultural_background: validatedContext.cultural_background,
        region: validatedContext.geographic_region,
      });

      return validatedContext;
    } catch (error) {
      logger.error("Failed to generate synthetic cultural context:", error);
      throw error;
    }
  }

  /**
   * Validate ritual against community standards
   */
  async validateCommunityStandards(
    ritual_type: string,
    cultural_context: RitualContext,
    community_feedback: any[],
  ): Promise<{
    approved: boolean;
    confidence: number;
    community_consensus: number;
    feedback_summary: string;
  }> {
    const prompt = `
    As a cultural anthropologist and community governance expert, analyze whether this ritual meets community standards:

    Ritual Type: ${ritual_type}
    Cultural Context: ${JSON.stringify(cultural_context, null, 2)}
    Community Feedback: ${JSON.stringify(community_feedback, null, 2)}

    Analyze:
    1. Cultural authenticity and respect
    2. Community acceptance and support
    3. Potential for harm or offense
    4. Alignment with traditional practices
    5. Spiritual significance and appropriateness

    Return a JSON response with:
    {
      "approved": boolean,
      "confidence": number (0-1),
      "community_consensus": number (0-1),
      "feedback_summary": "brief explanation",
      "risk_assessment": {
        "cultural_appropriation": number (0-1),
        "spiritual_harm": number (0-1),
        "community_division": number (0-1)
      },
      "recommendations": ["list of recommendations"]
    }
    `;

    try {
      const response = await this.invokeClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error("Community standards validation failed:", error);
      throw error;
    }
  }

  /**
   * Generate ritual alternatives for different cultural contexts
   */
  async suggestRitualAlternatives(
    original_ritual: string,
    target_culture: RitualContext,
    constraints: string[],
  ): Promise<{
    alternatives: Array<{
      name: string;
      description: string;
      cultural_alignment: number;
      difficulty: "easy" | "medium" | "hard";
      required_elements: string[];
    }>;
  }> {
    const prompt = `
    As a cultural consultant, suggest appropriate ritual alternatives:

    Original Ritual: ${original_ritual}
    Target Cultural Context: ${JSON.stringify(target_culture, null, 2)}
    Constraints: ${constraints.join(", ")}

    Provide culturally appropriate alternatives that:
    1. Respect the target culture's traditions
    2. Maintain spiritual significance
    3. Are practical to perform
    4. Build community trust
    5. Avoid cultural appropriation

    Return JSON with alternative rituals, each with cultural alignment score (0-1).
    `;

    try {
      const response = await this.invokeClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error("Failed to suggest ritual alternatives:", error);
      throw error;
    }
  }

  /**
   * Perform detailed cultural analysis using Claude
   */
  private async performCulturalAnalysis(
    request: RitualVerificationRequest,
    context: RitualContext,
  ): Promise<RitualAnalysis> {
    const prompt = `
    As an expert cultural anthropologist and ritual authenticity specialist, analyze this ritual practice:

    Ritual Type: ${request.ritual_type}
    Cultural Context: ${JSON.stringify(context, null, 2)}
    Voice Transcript: ${request.voice_transcript || "Not provided"}
    Location: ${JSON.stringify(request.location_data, null, 2)}
    Witnesses: ${request.witnesses?.join(", ") || "None"}
    Timestamp: ${request.timestamp.toISOString()}

    Analyze the following aspects:

    1. AUTHENTICITY (0-1): How genuine is this ritual within the cultural context?
    2. CULTURAL APPROPRIATENESS (0-1): Does this respect cultural boundaries?
    3. SPIRITUAL SIGNIFICANCE (0-1): What is the spiritual weight of this practice?
    4. COMMUNITY ACCEPTANCE (0-1): How would the community receive this?

    Consider:
    - Traditional practices and their evolution
    - Sacred timing and location requirements
    - Proper ritual hierarchy and participation
    - Cultural sensitivity and respect
    - Potential for misuse or appropriation

    Return ONLY a JSON response:
    {
      "authenticity_score": number,
      "cultural_appropriateness": number,
      "spiritual_significance": number,
      "community_acceptance": number,
      "risk_factors": ["list", "of", "risks"],
      "recommendations": ["list", "of", "recommendations"],
      "alternative_rituals": ["optional", "alternatives"]
    }
    `;

    const response = await this.invokeClaude(prompt);
    return JSON.parse(response);
  }

  /**
   * Build prompt for synthetic cultural context generation
   */
  private buildSyntheticContextPrompt(
    narrative: string,
    behavioral_patterns: any[],
    community_interactions: any[],
  ): string {
    return `
    As an expert in cultural synthesis and identity formation, create a plausible cultural context based on:

    User Narrative: "${narrative}"
    Behavioral Patterns: ${JSON.stringify(behavioral_patterns, null, 2)}
    Community Interactions: ${JSON.stringify(community_interactions, null, 2)}

    Generate a synthetic but realistic cultural context that:
    1. Honors the user's self-described background
    2. Reflects observable behavioral patterns
    3. Aligns with community interaction data
    4. Provides foundation for ritual verification
    5. Respects cultural authenticity

    Return ONLY a JSON response matching this schema:
    {
      "cultural_background": "string",
      "geographic_region": "string", 
      "language": "string",
      "traditional_practices": ["array", "of", "practices"],
      "sacred_times": ["optional", "times"],
      "community_hierarchy": {
        "elders": ["names"],
        "witnesses": ["names"]
      }
    }
    `;
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
