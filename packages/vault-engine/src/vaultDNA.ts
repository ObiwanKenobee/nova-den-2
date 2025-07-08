import { createHash, randomBytes } from "crypto";

export interface VaultGenotype {
  vaultId: string;
  creatorId: string;
  vaultType: string;
  participants: string[];
  unlockConditions: any[];
  ritualRequirements: any[];
  geographicContext: any[];
  behaviorPatterns?: BehaviorPattern[];
  memoryFragments?: MemoryFragment[];
}

export interface BehaviorPattern {
  type:
    | "transaction_frequency"
    | "unlock_pattern"
    | "geographic_movement"
    | "participant_interaction"
    | "ritual_adherence";
  frequency: number;
  confidence: number;
  traits: string[];
  timestamps: Date[];
}

export interface MemoryFragment {
  id: string;
  type: "transaction" | "ritual" | "consensus" | "emergency" | "cultural";
  content: any;
  timestamp: Date;
  participants: string[];
  significance: number; // 0-1
  culturalContext?: string;
}

export interface DNASequence {
  sequence: string;
  type: "structural" | "behavioral" | "cultural" | "geographic" | "temporal";
  markers: string[];
  expression: number; // How strongly this trait is expressed (0-1)
}

export interface VaultGenome {
  dna: string;
  sequences: DNASequence[];
  traits: VaultTrait[];
  adaptations: VaultAdaptation[];
  mutations: VaultMutation[];
  generationInfo: {
    generation: number;
    parentVaults: string[];
    createdAt: Date;
    evolutionScore: number;
  };
}

export interface VaultTrait {
  name: string;
  category: "security" | "social" | "economic" | "cultural" | "resilience";
  strength: number; // 0-1
  dominance: "dominant" | "recessive" | "co-dominant";
  inheritance: "genetic" | "learned" | "environmental";
  markers: string[];
}

export interface VaultAdaptation {
  trigger: string;
  response: string;
  effectiveness: number;
  learnedAt: Date;
  reinforcements: number;
}

export interface VaultMutation {
  type: "beneficial" | "neutral" | "detrimental";
  location: string; // which part of DNA sequence
  oldSequence: string;
  newSequence: string;
  causedBy: "random" | "stress" | "adaptation" | "inheritance";
  impact: number; // -1 to 1
  timestamp: Date;
}

export class VaultDNAEngine {
  private readonly SEQUENCE_LENGTH = 64;
  private readonly MARKER_COUNT = 16;

  async generateVaultDNA(genotype: VaultGenotype): Promise<string> {
    // Create base DNA sequence from genotype
    const baseSequence = await this.createBaseSequence(genotype);

    // Add behavioral markers
    const behaviorSequence = await this.addBehaviorMarkers(
      baseSequence,
      genotype,
    );

    // Add cultural markers
    const culturalSequence = await this.addCulturalMarkers(
      behaviorSequence,
      genotype,
    );

    // Add geographic markers
    const geographicSequence = await this.addGeographicMarkers(
      culturalSequence,
      genotype,
    );

    // Generate final DNA string
    return this.encodeDNASequence(geographicSequence);
  }

  async analyzeVaultGenome(dna: string): Promise<VaultGenome> {
    // Decode DNA sequence
    const sequences = this.decodeDNASequence(dna);

    // Extract traits from sequences
    const traits = await this.extractTraits(sequences);

    // Identify adaptations
    const adaptations = await this.identifyAdaptations(sequences);

    // Detect mutations
    const mutations = await this.detectMutations(sequences);

    // Determine generation info
    const generationInfo = await this.analyzeGeneration(dna);

    return {
      dna,
      sequences,
      traits,
      adaptations,
      mutations,
      generationInfo,
    };
  }

  async evolveVaultDNA(
    parentDNA: string,
    behaviorHistory: BehaviorPattern[],
    environmentalFactors: any,
  ): Promise<string> {
    // Decode parent DNA
    const parentGenome = await this.analyzeVaultGenome(parentDNA);

    // Apply behavioral evolution
    const evolvedSequences = await this.applyBehavioralEvolution(
      parentGenome.sequences,
      behaviorHistory,
    );

    // Apply environmental adaptations
    const adaptedSequences = await this.applyEnvironmentalAdaptation(
      evolvedSequences,
      environmentalFactors,
    );

    // Introduce random mutations
    const mutatedSequences = await this.introduceMutations(adaptedSequences);

    // Generate new DNA
    return this.encodeDNASequence(mutatedSequences);
  }

  private async createBaseSequence(
    genotype: VaultGenotype,
  ): Promise<DNASequence[]> {
    const sequences: DNASequence[] = [];

    // Structural sequence based on vault type and basic config
    const structuralMarkers = [
      genotype.vaultType,
      `participants_${genotype.participants.length}`,
      `unlocks_${genotype.unlockConditions.length}`,
      `rituals_${genotype.ritualRequirements.length}`,
    ];

    sequences.push({
      sequence: this.hashToSequence(structuralMarkers.join("_")),
      type: "structural",
      markers: structuralMarkers,
      expression: 1.0,
    });

    // Behavioral sequence from unlock patterns
    const behaviorMarkers = genotype.unlockConditions.map(
      (condition) => `${condition.type}_${condition.required}`,
    );

    if (behaviorMarkers.length > 0) {
      sequences.push({
        sequence: this.hashToSequence(behaviorMarkers.join("_")),
        type: "behavioral",
        markers: behaviorMarkers,
        expression: 0.8,
      });
    }

    return sequences;
  }

  private async addBehaviorMarkers(
    sequences: DNASequence[],
    genotype: VaultGenotype,
  ): Promise<DNASequence[]> {
    const result = [...sequences];

    // Add ritual behavior markers
    if (genotype.ritualRequirements.length > 0) {
      const ritualMarkers = genotype.ritualRequirements.map(
        (ritual) => `${ritual.type}_${ritual.verificationMethod}`,
      );

      result.push({
        sequence: this.hashToSequence(ritualMarkers.join("_")),
        type: "cultural",
        markers: ritualMarkers,
        expression: 0.9,
      });
    }

    // Add existing behavior patterns if available
    if (genotype.behaviorPatterns) {
      for (const pattern of genotype.behaviorPatterns) {
        const patternMarkers = [
          pattern.type,
          `freq_${Math.round(pattern.frequency * 100)}`,
          `conf_${Math.round(pattern.confidence * 100)}`,
        ];

        result.push({
          sequence: this.hashToSequence(patternMarkers.join("_")),
          type: "behavioral",
          markers: patternMarkers,
          expression: pattern.confidence,
        });
      }
    }

    return result;
  }

  private async addCulturalMarkers(
    sequences: DNASequence[],
    genotype: VaultGenotype,
  ): Promise<DNASequence[]> {
    const result = [...sequences];

    // Extract cultural contexts from rituals
    const culturalContexts = genotype.ritualRequirements
      .map((ritual) => ritual.culturalContext)
      .filter(Boolean);

    if (culturalContexts.length > 0) {
      const uniqueContexts = [...new Set(culturalContexts)];
      const culturalMarkers = uniqueContexts.map((context) =>
        this.normalizeCulturalContext(context),
      );

      result.push({
        sequence: this.hashToSequence(culturalMarkers.join("_")),
        type: "cultural",
        markers: culturalMarkers,
        expression: 0.7,
      });
    }

    return result;
  }

  private async addGeographicMarkers(
    sequences: DNASequence[],
    genotype: VaultGenotype,
  ): Promise<DNASequence[]> {
    const result = [...sequences];

    if (genotype.geographicContext.length > 0) {
      const geoMarkers = genotype.geographicContext.map((geo) => {
        if (geo.regions) {
          return geo.regions.map((r: string) => `region_${r}`).join("_");
        }
        if (geo.coordinates) {
          return `lat_${Math.round(geo.coordinates.lat)}_lng_${Math.round(geo.coordinates.lng)}`;
        }
        return "geo_unknown";
      });

      result.push({
        sequence: this.hashToSequence(geoMarkers.join("_")),
        type: "geographic",
        markers: geoMarkers,
        expression: 0.6,
      });
    }

    return result;
  }

  private hashToSequence(input: string): string {
    // Convert hash to DNA-like sequence using ATCG alphabet
    const hash = createHash("sha256").update(input).digest("hex");
    const bases = ["A", "T", "C", "G"];

    let sequence = "";
    for (let i = 0; i < this.SEQUENCE_LENGTH; i++) {
      const hexChar = hash[i % hash.length];
      const baseIndex = parseInt(hexChar, 16) % 4;
      sequence += bases[baseIndex];
    }

    return sequence;
  }

  private encodeDNASequence(sequences: DNASequence[]): string {
    // Combine all sequences into final DNA string
    const combined = sequences.map((seq) => seq.sequence).join("");

    // Add version and type prefixes
    const version = "v1";
    const timestamp = Date.now().toString(36);

    return `${version}_${timestamp}_${combined}`;
  }

  private decodeDNASequence(dna: string): DNASequence[] {
    // Parse DNA string back to sequences
    const parts = dna.split("_");
    if (parts.length < 3) {
      throw new Error("Invalid DNA format");
    }

    const [version, timestamp, ...sequenceParts] = parts;
    const combinedSequence = sequenceParts.join("_");

    // Split combined sequence back to individual sequences
    const sequences: DNASequence[] = [];
    const sequenceLength = this.SEQUENCE_LENGTH;

    for (let i = 0; i < combinedSequence.length; i += sequenceLength) {
      const sequence = combinedSequence.slice(i, i + sequenceLength);
      if (sequence.length === sequenceLength) {
        sequences.push({
          sequence,
          type: this.inferSequenceType(sequence, i / sequenceLength),
          markers: [],
          expression: 1.0,
        });
      }
    }

    return sequences;
  }

  private inferSequenceType(
    sequence: string,
    index: number,
  ): DNASequence["type"] {
    // Infer sequence type based on position and content
    const types: DNASequence["type"][] = [
      "structural",
      "behavioral",
      "cultural",
      "geographic",
      "temporal",
    ];

    return types[index % types.length];
  }

  private async extractTraits(sequences: DNASequence[]): Promise<VaultTrait[]> {
    const traits: VaultTrait[] = [];

    for (const sequence of sequences) {
      const traitStrength = this.calculateTraitStrength(sequence);

      switch (sequence.type) {
        case "structural":
          traits.push({
            name: "structural_integrity",
            category: "security",
            strength: traitStrength,
            dominance: "dominant",
            inheritance: "genetic",
            markers: [sequence.sequence.slice(0, 8)],
          });
          break;

        case "behavioral":
          traits.push({
            name: "behavioral_consistency",
            category: "social",
            strength: traitStrength,
            dominance: "co-dominant",
            inheritance: "learned",
            markers: [sequence.sequence.slice(8, 16)],
          });
          break;

        case "cultural":
          traits.push({
            name: "cultural_adherence",
            category: "cultural",
            strength: traitStrength,
            dominance: "dominant",
            inheritance: "environmental",
            markers: [sequence.sequence.slice(16, 24)],
          });
          break;

        case "geographic":
          traits.push({
            name: "geographic_affinity",
            category: "resilience",
            strength: traitStrength,
            dominance: "recessive",
            inheritance: "environmental",
            markers: [sequence.sequence.slice(24, 32)],
          });
          break;
      }
    }

    return traits;
  }

  private calculateTraitStrength(sequence: DNASequence): number {
    // Calculate trait strength based on sequence complexity and expression
    const baseComplexity = this.calculateSequenceComplexity(sequence.sequence);
    return Math.min(1.0, baseComplexity * sequence.expression);
  }

  private calculateSequenceComplexity(sequence: string): number {
    // Measure sequence complexity using entropy
    const bases = ["A", "T", "C", "G"];
    const counts = bases.map((base) => sequence.split(base).length - 1);

    const total = sequence.length;
    let entropy = 0;

    for (const count of counts) {
      if (count > 0) {
        const probability = count / total;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy / 2; // Normalize to 0-1 range
  }

  private async identifyAdaptations(
    sequences: DNASequence[],
  ): Promise<VaultAdaptation[]> {
    // Identify adaptive patterns in sequences
    const adaptations: VaultAdaptation[] = [];

    // Look for repeated patterns that suggest learned behaviors
    for (const sequence of sequences) {
      const patterns = this.findRepeatingPatterns(sequence.sequence);

      for (const pattern of patterns) {
        adaptations.push({
          trigger: `pattern_${pattern.pattern}`,
          response: `adaptation_${pattern.count}`,
          effectiveness: Math.min(1.0, pattern.count / 10),
          learnedAt: new Date(Date.now() - pattern.count * 86400000), // Mock timing
          reinforcements: pattern.count,
        });
      }
    }

    return adaptations;
  }

  private findRepeatingPatterns(
    sequence: string,
  ): Array<{ pattern: string; count: number }> {
    const patterns: Map<string, number> = new Map();
    const minPatternLength = 3;
    const maxPatternLength = 8;

    for (let len = minPatternLength; len <= maxPatternLength; len++) {
      for (let i = 0; i <= sequence.length - len; i++) {
        const pattern = sequence.slice(i, i + len);
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }

    return Array.from(patterns.entries())
      .filter(([, count]) => count > 2)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  private async detectMutations(
    sequences: DNASequence[],
  ): Promise<VaultMutation[]> {
    // Detect potential mutations in sequences
    const mutations: VaultMutation[] = [];

    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];

      // Look for unusual patterns that suggest mutations
      const anomalies = this.detectSequenceAnomalies(sequence.sequence);

      for (const anomaly of anomalies) {
        mutations.push({
          type: this.classifyMutationType(anomaly),
          location: `sequence_${i}_position_${anomaly.position}`,
          oldSequence: anomaly.expected,
          newSequence: anomaly.actual,
          causedBy: "random",
          impact: anomaly.impact,
          timestamp: new Date(),
        });
      }
    }

    return mutations;
  }

  private detectSequenceAnomalies(sequence: string): Array<{
    position: number;
    expected: string;
    actual: string;
    impact: number;
  }> {
    const anomalies: Array<{
      position: number;
      expected: string;
      actual: string;
      impact: number;
    }> = [];

    // Simple anomaly detection - look for unusual base distributions
    const baseDistribution = this.calculateBaseDistribution(sequence);
    const expectedDistribution = 0.25; // Equal distribution

    Object.entries(baseDistribution).forEach(([base, frequency], index) => {
      if (Math.abs(frequency - expectedDistribution) > 0.15) {
        anomalies.push({
          position: index * 16, // Mock position
          expected: "T", // Mock expected base
          actual: base,
          impact: (frequency - expectedDistribution) * 2,
        });
      }
    });

    return anomalies;
  }

  private calculateBaseDistribution(sequence: string): Record<string, number> {
    const bases = ["A", "T", "C", "G"];
    const distribution: Record<string, number> = {};

    for (const base of bases) {
      const count = sequence.split(base).length - 1;
      distribution[base] = count / sequence.length;
    }

    return distribution;
  }

  private classifyMutationType(anomaly: any): VaultMutation["type"] {
    if (anomaly.impact > 0.1) return "beneficial";
    if (anomaly.impact < -0.1) return "detrimental";
    return "neutral";
  }

  private async analyzeGeneration(dna: string): Promise<any> {
    // Extract generation info from DNA timestamp and structure
    const parts = dna.split("_");
    const timestamp = parts[1];

    return {
      generation: 1, // Would be calculated based on parent analysis
      parentVaults: [], // Would be extracted from DNA history
      createdAt: new Date(parseInt(timestamp, 36)),
      evolutionScore: Math.random(), // Mock score
    };
  }

  private async applyBehavioralEvolution(
    sequences: DNASequence[],
    behaviorHistory: BehaviorPattern[],
  ): Promise<DNASequence[]> {
    // Evolve sequences based on behavior patterns
    const evolved = [...sequences];

    for (const pattern of behaviorHistory) {
      if (pattern.confidence > 0.8) {
        // Strong behavioral pattern - modify relevant sequences
        const relevantSequences = evolved.filter(
          (seq) => seq.type === "behavioral",
        );

        for (const seq of relevantSequences) {
          seq.expression = Math.min(1.0, seq.expression + 0.1);
          seq.markers.push(`evolved_${pattern.type}`);
        }
      }
    }

    return evolved;
  }

  private async applyEnvironmentalAdaptation(
    sequences: DNASequence[],
    environmentalFactors: any,
  ): Promise<DNASequence[]> {
    // Adapt sequences based on environmental pressures
    return sequences.map((seq) => ({
      ...seq,
      expression: seq.expression * (environmentalFactors.pressure || 1.0),
    }));
  }

  private async introduceMutations(
    sequences: DNASequence[],
  ): Promise<DNASequence[]> {
    // Introduce random mutations
    const mutationRate = 0.001; // 0.1% mutation rate

    return sequences.map((seq) => {
      let mutatedSequence = seq.sequence;

      for (let i = 0; i < mutatedSequence.length; i++) {
        if (Math.random() < mutationRate) {
          const bases = ["A", "T", "C", "G"];
          const newBase = bases[Math.floor(Math.random() * bases.length)];
          mutatedSequence =
            mutatedSequence.slice(0, i) +
            newBase +
            mutatedSequence.slice(i + 1);
        }
      }

      return {
        ...seq,
        sequence: mutatedSequence,
      };
    });
  }

  private normalizeCulturalContext(context: string): string {
    // Normalize cultural context strings for consistency
    return context
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 16);
  }

  // Public utility methods
  async compareVaultGenomes(
    dna1: string,
    dna2: string,
  ): Promise<{
    similarity: number;
    commonTraits: string[];
    differences: string[];
  }> {
    const genome1 = await this.analyzeVaultGenome(dna1);
    const genome2 = await this.analyzeVaultGenome(dna2);

    const similarity = this.calculateGenomeSimilarity(genome1, genome2);
    const commonTraits = this.findCommonTraits(genome1, genome2);
    const differences = this.findGenomeDifferences(genome1, genome2);

    return { similarity, commonTraits, differences };
  }

  private calculateGenomeSimilarity(
    genome1: VaultGenome,
    genome2: VaultGenome,
  ): number {
    // Calculate similarity based on shared sequences and traits
    let matchingSequences = 0;

    for (const seq1 of genome1.sequences) {
      for (const seq2 of genome2.sequences) {
        if (this.sequenceSimilarity(seq1.sequence, seq2.sequence) > 0.8) {
          matchingSequences++;
          break;
        }
      }
    }

    return (
      matchingSequences /
      Math.max(genome1.sequences.length, genome2.sequences.length)
    );
  }

  private sequenceSimilarity(seq1: string, seq2: string): number {
    if (seq1.length !== seq2.length) return 0;

    let matches = 0;
    for (let i = 0; i < seq1.length; i++) {
      if (seq1[i] === seq2[i]) matches++;
    }

    return matches / seq1.length;
  }

  private findCommonTraits(
    genome1: VaultGenome,
    genome2: VaultGenome,
  ): string[] {
    const traits1 = new Set(genome1.traits.map((t) => t.name));
    const traits2 = new Set(genome2.traits.map((t) => t.name));

    return Array.from(traits1).filter((trait) => traits2.has(trait));
  }

  private findGenomeDifferences(
    genome1: VaultGenome,
    genome2: VaultGenome,
  ): string[] {
    const differences: string[] = [];

    // Compare sequence types
    const types1 = new Set(genome1.sequences.map((s) => s.type));
    const types2 = new Set(genome2.sequences.map((s) => s.type));

    for (const type of types1) {
      if (!types2.has(type)) {
        differences.push(`Missing sequence type: ${type} in genome2`);
      }
    }

    for (const type of types2) {
      if (!types1.has(type)) {
        differences.push(`Missing sequence type: ${type} in genome1`);
      }
    }

    return differences;
  }
}

// Convenience function for generating vault DNA
export async function generateVaultDNA(
  genotype: VaultGenotype,
): Promise<string> {
  const engine = new VaultDNAEngine();
  return await engine.generateVaultDNA(genotype);
}

// Convenience function for analyzing vault DNA
export async function analyzeVaultDNA(dna: string): Promise<VaultGenome> {
  const engine = new VaultDNAEngine();
  return await engine.analyzeVaultGenome(dna);
}

export { VaultDNAEngine };
