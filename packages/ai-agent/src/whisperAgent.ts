import OpenAI from "openai";
import { EventEmitter } from "events";
import { logger } from "./utils/logger";

export interface VoiceAnalysisResult {
  transcription: string;
  confidence: number;
  speaker_id: string;
  emotional_tone: string;
  ritual_match_score: number;
  authenticity_score: number;
}

export interface RitualPhrase {
  id: string;
  phrase: string;
  language: string;
  cultural_context: string;
  verification_threshold: number;
}

export class WhisperAgent extends EventEmitter {
  private openai: OpenAI;
  private ritualPhrases: Map<string, RitualPhrase> = new Map();

  constructor(apiKey: string) {
    super();
    this.openai = new OpenAI({ apiKey });
    this.initializeRitualPhrases();
  }

  /**
   * Analyze voice recording for ritual verification
   */
  async analyzeVoiceRitual(
    audioBuffer: Buffer,
    expectedRitual: string,
    userId: string,
  ): Promise<VoiceAnalysisResult> {
    try {
      logger.info(`Analyzing voice ritual for user ${userId}`);

      // Transcribe audio using Whisper
      const transcription = await this.transcribeAudio(audioBuffer);

      // Analyze transcription for ritual patterns
      const ritualAnalysis = await this.analyzeRitualPattern(
        transcription.text,
        expectedRitual,
      );

      // Verify speaker identity (simplified)
      const speakerVerification = await this.verifySpeaker(audioBuffer, userId);

      // Analyze emotional tone
      const emotionalAnalysis = await this.analyzeEmotionalTone(
        transcription.text,
      );

      const result: VoiceAnalysisResult = {
        transcription: transcription.text,
        confidence: transcription.confidence || 0.8,
        speaker_id: speakerVerification.speaker_id,
        emotional_tone: emotionalAnalysis.dominant_emotion,
        ritual_match_score: ritualAnalysis.match_score,
        authenticity_score: speakerVerification.authenticity_score,
      };

      logger.info(`Voice analysis completed for user ${userId}`, { result });
      this.emit("analysisComplete", { userId, result });

      return result;
    } catch (error) {
      logger.error("Voice analysis failed:", error);
      throw new Error("Voice ritual analysis failed");
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<{
    text: string;
    confidence?: number;
  }> {
    try {
      const file = new File([audioBuffer], "audio.wav", { type: "audio/wav" });

      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
        language: "en", // Can be made dynamic
        temperature: 0.2,
      });

      return {
        text: transcription.text,
        confidence: 0.9, // Whisper doesn't provide confidence scores directly
      };
    } catch (error) {
      logger.error("Transcription failed:", error);
      throw error;
    }
  }

  /**
   * Analyze ritual pattern in transcribed text
   */
  private async analyzeRitualPattern(
    text: string,
    expectedRitual: string,
  ): Promise<{ match_score: number; detected_ritual?: string }> {
    const ritual = this.ritualPhrases.get(expectedRitual);

    if (!ritual) {
      return { match_score: 0 };
    }

    // Use OpenAI for semantic similarity analysis
    const prompt = `
    Analyze the following text for ritual/ceremonial language patterns:
    
    Text: "${text}"
    Expected ritual context: "${ritual.cultural_context}"
    Expected phrase pattern: "${ritual.phrase}"
    
    Provide a match score from 0-100 based on:
    1. Semantic similarity to expected phrase
    2. Presence of ritual/ceremonial language
    3. Cultural context appropriateness
    4. Emotional sincerity
    
    Respond with only a JSON object: {"match_score": number, "reasoning": "brief explanation"}
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 150,
      });

      const analysis = JSON.parse(
        response.choices[0].message.content || '{"match_score": 0}',
      );

      return {
        match_score: analysis.match_score / 100, // Normalize to 0-1
        detected_ritual: analysis.detected_ritual,
      };
    } catch (error) {
      logger.error("Ritual pattern analysis failed:", error);
      return { match_score: 0 };
    }
  }

  /**
   * Verify speaker identity (simplified implementation)
   */
  private async verifySpeaker(
    audioBuffer: Buffer,
    userId: string,
  ): Promise<{ speaker_id: string; authenticity_score: number }> {
    // In production, this would use speaker recognition services
    // For now, we'll simulate based on audio characteristics

    const audioLength = audioBuffer.length;
    const simulatedAuthenticity = Math.min(0.9, audioLength / 100000);

    return {
      speaker_id: userId,
      authenticity_score: simulatedAuthenticity,
    };
  }

  /**
   * Analyze emotional tone of speech
   */
  private async analyzeEmotionalTone(text: string): Promise<{
    dominant_emotion: string;
    confidence: number;
  }> {
    const prompt = `
    Analyze the emotional tone of this text:
    "${text}"
    
    Identify the dominant emotion from: calm, reverent, anxious, confident, uncertain, joyful, solemn
    
    Respond with only a JSON object: {"dominant_emotion": "emotion", "confidence": number_0_to_1}
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 50,
      });

      const analysis = JSON.parse(
        response.choices[0].message.content ||
          '{"dominant_emotion": "neutral", "confidence": 0.5}',
      );

      return analysis;
    } catch (error) {
      logger.error("Emotional tone analysis failed:", error);
      return { dominant_emotion: "neutral", confidence: 0.5 };
    }
  }

  /**
   * Initialize common ritual phrases
   */
  private initializeRitualPhrases(): void {
    const phrases: RitualPhrase[] = [
      {
        id: "harvest_blessing",
        phrase: "May the earth's bounty nourish our community",
        language: "en",
        cultural_context: "agricultural blessing ritual",
        verification_threshold: 0.7,
      },
      {
        id: "elder_witness",
        phrase: "By the wisdom of our ancestors, I witness this exchange",
        language: "en",
        cultural_context: "elder testimony ritual",
        verification_threshold: 0.8,
      },
      {
        id: "cooperative_bond",
        phrase: "In unity we prosper, in division we fall",
        language: "en",
        cultural_context: "cooperative agreement ritual",
        verification_threshold: 0.6,
      },
      {
        id: "relief_distribution",
        phrase: "From abundance to need, we share with dignity",
        language: "en",
        cultural_context: "humanitarian aid ritual",
        verification_threshold: 0.5,
      },
    ];

    phrases.forEach((phrase) => {
      this.ritualPhrases.set(phrase.id, phrase);
    });

    logger.info(`Initialized ${phrases.length} ritual phrases`);
  }

  /**
   * Add custom ritual phrase
   */
  addRitualPhrase(phrase: RitualPhrase): void {
    this.ritualPhrases.set(phrase.id, phrase);
    logger.info(`Added ritual phrase: ${phrase.id}`);
  }

  /**
   * Get available ritual phrases
   */
  getRitualPhrases(): RitualPhrase[] {
    return Array.from(this.ritualPhrases.values());
  }

  /**
   * Train speaker model (placeholder for future implementation)
   */
  async trainSpeakerModel(
    userId: string,
    audioSamples: Buffer[],
  ): Promise<void> {
    logger.info(
      `Training speaker model for user ${userId} with ${audioSamples.length} samples`,
    );
    // This would train a speaker recognition model
    // For now, we'll just log the training request
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.removeAllListeners();
    this.ritualPhrases.clear();
  }
}
