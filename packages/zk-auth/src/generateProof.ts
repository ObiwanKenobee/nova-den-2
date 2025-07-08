import * as snarkjs from "snarkjs";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from "crypto";

export interface RitualProofInputs {
  ritualSecret: string;
  voicePattern: number[];
  gestureHash: string;
  culturalContext: string;
  participantCount: number;
  elderPrivateKey: string;
  nonce: string;
  ritualCommitment: string;
  elderApproval: string;
  communityHash: string;
  timestamp: number;
}

export interface ProximityProofInputs {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  locationHash: string;
}

export interface ConsensusProofInputs {
  elderApprovals: number[];
  elderWeights: number[];
  elderCount: number;
  approvalThreshold: number;
}

export interface ZKProof {
  proof: any;
  publicSignals: string[];
  verificationKey: any;
  circuitType: "ritual" | "proximity" | "consensus";
  timestamp: Date;
  proofId: string;
}

export class ProofGenerator {
  private circuitsPath: string;

  constructor(circuitsPath?: string) {
    this.circuitsPath =
      circuitsPath || path.join(process.cwd(), "circuits", "build");
  }

  async generateRitualProof(inputs: RitualProofInputs): Promise<ZKProof> {
    try {
      const circuitPath = path.join(this.circuitsPath, "zkRitual");
      const wasmPath = path.join(circuitPath, "zkRitual.wasm");
      const zkeyPath = path.join(circuitPath, "zkRitual.zkey");
      const vkeyPath = path.join(circuitPath, "zkRitual_vkey.json");

      // Validate inputs
      this.validateRitualInputs(inputs);

      // Prepare circuit inputs
      const circuitInputs = {
        ritualCommitment: inputs.ritualCommitment,
        elderApproval: inputs.elderApproval,
        communityHash: inputs.communityHash,
        timestamp: inputs.timestamp.toString(),
        ritualSecret: inputs.ritualSecret,
        voicePattern: inputs.voicePattern.map((v) => v.toString()),
        gestureHash: inputs.gestureHash,
        culturalContext: inputs.culturalContext,
        participantCount: inputs.participantCount.toString(),
        elderPrivateKey: inputs.elderPrivateKey,
        nonce: inputs.nonce,
      };

      console.log("Generating ritual proof...");

      // Generate witness
      const { witness } = await snarkjs.wtns.calculate(circuitInputs, wasmPath);

      // Generate proof
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        zkeyPath,
        witness,
      );

      // Load verification key
      const verificationKey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

      const zkProof: ZKProof = {
        proof,
        publicSignals,
        verificationKey,
        circuitType: "ritual",
        timestamp: new Date(),
        proofId: this.generateProofId("ritual"),
      };

      console.log("Ritual proof generated successfully");
      return zkProof;
    } catch (error) {
      console.error("Failed to generate ritual proof:", error);
      throw new Error(`Ritual proof generation failed: ${error}`);
    }
  }

  async generateProximityProof(inputs: ProximityProofInputs): Promise<ZKProof> {
    try {
      const circuitPath = path.join(this.circuitsPath, "zkProximity");
      const wasmPath = path.join(circuitPath, "zkProximity.wasm");
      const zkeyPath = path.join(circuitPath, "zkProximity.zkey");
      const vkeyPath = path.join(circuitPath, "zkProximity_vkey.json");

      // Validate inputs
      this.validateProximityInputs(inputs);

      // Prepare circuit inputs
      const circuitInputs = {
        locationHash: inputs.locationHash,
        timestamp: inputs.timestamp.toString(),
        latitude: Math.floor(inputs.latitude * 1000000).toString(), // Scale for integer
        longitude: Math.floor(inputs.longitude * 1000000).toString(),
        accuracy: inputs.accuracy.toString(),
      };

      console.log("Generating proximity proof...");

      // Generate witness
      const { witness } = await snarkjs.wtns.calculate(circuitInputs, wasmPath);

      // Generate proof
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        zkeyPath,
        witness,
      );

      // Load verification key
      const verificationKey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

      const zkProof: ZKProof = {
        proof,
        publicSignals,
        verificationKey,
        circuitType: "proximity",
        timestamp: new Date(),
        proofId: this.generateProofId("proximity"),
      };

      console.log("Proximity proof generated successfully");
      return zkProof;
    } catch (error) {
      console.error("Failed to generate proximity proof:", error);
      throw new Error(`Proximity proof generation failed: ${error}`);
    }
  }

  async generateConsensusProof(inputs: ConsensusProofInputs): Promise<ZKProof> {
    try {
      const circuitPath = path.join(this.circuitsPath, "zkConsensus");
      const wasmPath = path.join(circuitPath, "zkConsensus.wasm");
      const zkeyPath = path.join(circuitPath, "zkConsensus.zkey");
      const vkeyPath = path.join(circuitPath, "zkConsensus_vkey.json");

      // Validate inputs
      this.validateConsensusInputs(inputs);

      // Pad arrays to circuit size (10 elders max)
      const paddedApprovals = [...inputs.elderApprovals];
      const paddedWeights = [...inputs.elderWeights];

      while (paddedApprovals.length < 10) {
        paddedApprovals.push(0);
        paddedWeights.push(0);
      }

      // Prepare circuit inputs
      const circuitInputs = {
        elderCount: inputs.elderCount.toString(),
        approvalThreshold: inputs.approvalThreshold.toString(),
        elderApprovals: paddedApprovals.map((a) => a.toString()),
        elderWeights: paddedWeights.map((w) => w.toString()),
      };

      console.log("Generating consensus proof...");

      // Generate witness
      const { witness } = await snarkjs.wtns.calculate(circuitInputs, wasmPath);

      // Generate proof
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        zkeyPath,
        witness,
      );

      // Load verification key
      const verificationKey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

      const zkProof: ZKProof = {
        proof,
        publicSignals,
        verificationKey,
        circuitType: "consensus",
        timestamp: new Date(),
        proofId: this.generateProofId("consensus"),
      };

      console.log("Consensus proof generated successfully");
      return zkProof;
    } catch (error) {
      console.error("Failed to generate consensus proof:", error);
      throw new Error(`Consensus proof generation failed: ${error}`);
    }
  }

  // Helper functions for creating proof inputs
  createRitualCommitment(
    ritualSecret: string,
    voicePattern: number[],
    gestureHash: string,
    culturalContext: string,
    nonce: string,
  ): string {
    // Use poseidon hash to create commitment
    const { poseidon } = require("circomlib");

    // Convert inputs to field elements
    const inputs = [
      this.stringToField(ritualSecret),
      ...voicePattern.slice(0, 4).map((v) => BigInt(v)),
      this.stringToField(gestureHash),
      this.stringToField(culturalContext),
      this.stringToField(nonce),
    ];

    const commitment = poseidon(inputs);
    return commitment.toString();
  }

  createElderApproval(
    elderPrivateKey: string,
    ritualCommitment: string,
    timestamp: number,
  ): string {
    // Create elder signature using poseidon hash
    const { poseidon } = require("circomlib");

    const inputs = [
      this.stringToField(elderPrivateKey),
      BigInt(ritualCommitment),
      BigInt(timestamp),
    ];

    const approval = poseidon(inputs);
    return approval.toString();
  }

  createLocationHash(
    latitude: number,
    longitude: number,
    timestamp: number,
  ): string {
    // Create location commitment
    const { poseidon } = require("circomlib");

    const inputs = [
      BigInt(Math.floor(latitude * 1000000)),
      BigInt(Math.floor(longitude * 1000000)),
      BigInt(timestamp),
    ];

    const hash = poseidon(inputs);
    return hash.toString();
  }

  generateVoicePattern(audioData?: Buffer): number[] {
    // Generate or extract voice pattern from audio
    if (audioData) {
      // In a real implementation, this would analyze the audio
      return this.extractVoiceFeatures(audioData);
    } else {
      // Generate mock voice pattern
      return [
        Math.floor(Math.random() * 100) + 50, // Pitch
        Math.floor(Math.random() * 100) + 50, // Rhythm
        Math.floor(Math.random() * 100) + 50, // Intensity
        Math.floor(Math.random() * 100) + 50, // Emotional tone
      ];
    }
  }

  generateGestureHash(videoData?: Buffer): string {
    // Generate or extract gesture hash from video
    if (videoData) {
      // In a real implementation, this would analyze the video
      return this.extractGestureSequence(videoData);
    } else {
      // Generate mock gesture hash
      return randomBytes(32).toString("hex");
    }
  }

  generateNonce(): string {
    return randomBytes(16).toString("hex");
  }

  private validateRitualInputs(inputs: RitualProofInputs): void {
    if (!inputs.ritualSecret) throw new Error("Ritual secret is required");
    if (!inputs.voicePattern || inputs.voicePattern.length !== 4) {
      throw new Error("Voice pattern must have exactly 4 elements");
    }
    if (!inputs.gestureHash) throw new Error("Gesture hash is required");
    if (!inputs.culturalContext)
      throw new Error("Cultural context is required");
    if (inputs.participantCount < 1)
      throw new Error("At least 1 participant required");
    if (!inputs.elderPrivateKey)
      throw new Error("Elder private key is required");
    if (!inputs.nonce) throw new Error("Nonce is required");
  }

  private validateProximityInputs(inputs: ProximityProofInputs): void {
    if (Math.abs(inputs.latitude) > 90) throw new Error("Invalid latitude");
    if (Math.abs(inputs.longitude) > 180) throw new Error("Invalid longitude");
    if (inputs.accuracy < 0) throw new Error("Accuracy must be positive");
    if (!inputs.locationHash) throw new Error("Location hash is required");
  }

  private validateConsensusInputs(inputs: ConsensusProofInputs): void {
    if (inputs.elderApprovals.length !== inputs.elderWeights.length) {
      throw new Error("Elder approvals and weights must have same length");
    }
    if (inputs.elderApprovals.length > 10) {
      throw new Error("Maximum 10 elders supported");
    }
    if (inputs.elderCount < 1) throw new Error("At least 1 elder required");
    if (inputs.approvalThreshold < 0)
      throw new Error("Approval threshold must be positive");
  }

  private stringToField(str: string): bigint {
    // Convert string to field element
    const bytes = Buffer.from(str, "utf8");
    let result = BigInt(0);

    for (let i = 0; i < Math.min(bytes.length, 31); i++) {
      result = result * BigInt(256) + BigInt(bytes[i]);
    }

    return result;
  }

  private generateProofId(type: string): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString("hex");
    return `${type}_${timestamp}_${random}`;
  }

  private extractVoiceFeatures(audioData: Buffer): number[] {
    // Mock voice feature extraction
    // In a real implementation, this would use audio processing libraries
    const features = [];

    // Simulate FFT analysis
    for (let i = 0; i < 4; i++) {
      const chunk = audioData.slice(
        (i * audioData.length) / 4,
        ((i + 1) * audioData.length) / 4,
      );
      let sum = 0;
      for (const byte of chunk) {
        sum += byte;
      }
      features.push((sum % 100) + 20); // Normalize to 20-120 range
    }

    return features;
  }

  private extractGestureSequence(videoData: Buffer): string {
    // Mock gesture sequence extraction
    // In a real implementation, this would use computer vision
    const hash = require("crypto").createHash("sha256");
    hash.update(videoData);
    return hash.digest("hex");
  }

  // Batch proof generation
  async generateMultipleProofs(
    requests: Array<{
      type: "ritual" | "proximity" | "consensus";
      inputs: any;
    }>,
  ): Promise<ZKProof[]> {
    const proofs: ZKProof[] = [];

    for (const request of requests) {
      try {
        let proof: ZKProof;

        switch (request.type) {
          case "ritual":
            proof = await this.generateRitualProof(request.inputs);
            break;
          case "proximity":
            proof = await this.generateProximityProof(request.inputs);
            break;
          case "consensus":
            proof = await this.generateConsensusProof(request.inputs);
            break;
          default:
            throw new Error(`Unknown proof type: ${request.type}`);
        }

        proofs.push(proof);
      } catch (error) {
        console.error(`Failed to generate ${request.type} proof:`, error);
        // Continue with other proofs even if one fails
      }
    }

    return proofs;
  }

  // Proof serialization for storage/transmission
  serializeProof(proof: ZKProof): string {
    return JSON.stringify({
      ...proof,
      timestamp: proof.timestamp.toISOString(),
    });
  }

  deserializeProof(serializedProof: string): ZKProof {
    const parsed = JSON.parse(serializedProof);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
    };
  }
}

// Export convenience functions
export async function generateRitualProof(
  inputs: RitualProofInputs,
): Promise<ZKProof> {
  const generator = new ProofGenerator();
  return await generator.generateRitualProof(inputs);
}

export async function generateProximityProof(
  inputs: ProximityProofInputs,
): Promise<ZKProof> {
  const generator = new ProofGenerator();
  return await generator.generateProximityProof(inputs);
}

export async function generateConsensusProof(
  inputs: ConsensusProofInputs,
): Promise<ZKProof> {
  const generator = new ProofGenerator();
  return await generator.generateConsensusProof(inputs);
}

export { ProofGenerator };
