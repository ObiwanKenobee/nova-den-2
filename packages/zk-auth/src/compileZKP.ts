import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface CircuitConfig {
  name: string;
  circomPath: string;
  outputDir: string;
  ptauFile?: string;
  optimization?: number;
}

export interface CompilationResult {
  success: boolean;
  wasmPath?: string;
  zkeyPath?: string;
  vkeyPath?: string;
  error?: string;
  compilationTime: number;
}

export class ZKPCompiler {
  private circuitsDir: string;
  private buildDir: string;
  private ptauDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.circuitsDir = path.join(baseDir, "circuits");
    this.buildDir = path.join(this.circuitsDir, "build");
    this.ptauDir = path.join(this.circuitsDir, "ptau");

    this.ensureDirectories();
  }

  async compileCircuit(config: CircuitConfig): Promise<CompilationResult> {
    const startTime = Date.now();

    try {
      console.log(`Compiling circuit: ${config.name}`);

      // Create output directory
      const outputPath = path.join(this.buildDir, config.name);
      fs.mkdirSync(outputPath, { recursive: true });

      // Step 1: Compile circom to r1cs
      console.log("Step 1: Compiling circom to r1cs...");
      const r1csPath = path.join(outputPath, `${config.name}.r1cs`);
      const wasmPath = path.join(outputPath, `${config.name}.wasm`);
      const symPath = path.join(outputPath, `${config.name}.sym`);

      execSync(
        `circom ${config.circomPath} --r1cs --wasm --sym -o ${outputPath}`,
        {
          stdio: "inherit",
        },
      );

      // Step 2: Generate witness calculator
      console.log("Step 2: Generating witness calculator...");
      const jsDir = path.join(outputPath, `${config.name}_js`);
      if (fs.existsSync(jsDir)) {
        execSync(
          `node ${path.join(jsDir, "generate_witness.js")} ${path.join(jsDir, `${config.name}.wasm`)} input.json witness.wtns`,
          {
            cwd: outputPath,
            stdio: "inherit",
          },
        ).toString();
      }

      // Step 3: Setup phase (if ptau file provided)
      let zkeyPath: string | undefined;
      let vkeyPath: string | undefined;

      if (config.ptauFile) {
        console.log("Step 3: Setting up proving and verification keys...");

        zkeyPath = path.join(outputPath, `${config.name}.zkey`);
        vkeyPath = path.join(outputPath, `${config.name}_vkey.json`);

        // Powers of tau ceremony
        const ptauPath = path.join(this.ptauDir, config.ptauFile);
        if (!fs.existsSync(ptauPath)) {
          console.log("Generating powers of tau...");
          await this.generatePowerOfTau(ptauPath);
        }

        // Phase 1: Setup
        execSync(`snarkjs groth16 setup ${r1csPath} ${ptauPath} ${zkeyPath}`, {
          stdio: "inherit",
        });

        // Extract verification key
        execSync(
          `snarkjs zkey export verificationkey ${zkeyPath} ${vkeyPath}`,
          {
            stdio: "inherit",
          },
        );

        console.log("Circuit compilation completed successfully!");
      }

      const compilationTime = Date.now() - startTime;

      return {
        success: true,
        wasmPath,
        zkeyPath,
        vkeyPath,
        compilationTime,
      };
    } catch (error) {
      const compilationTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        compilationTime,
      };
    }
  }

  async compileRitualCircuit(): Promise<CompilationResult> {
    const config: CircuitConfig = {
      name: "zkRitual",
      circomPath: path.join(this.circuitsDir, "zkRitual.circom"),
      outputDir: this.buildDir,
      ptauFile: "powersOfTau28_hez_final_14.ptau",
      optimization: 1,
    };

    return await this.compileCircuit(config);
  }

  async compileProximityCircuit(): Promise<CompilationResult> {
    // Compile proximity verification circuit
    const proximityCircuit = `
pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template ProximityProof() {
    signal input locationHash;
    signal input timestamp;
    signal private input latitude;
    signal private input longitude;
    signal private input accuracy;
    signal output isValid;
    
    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== latitude;
    poseidon.inputs[1] <== longitude;
    poseidon.inputs[2] <== timestamp;
    
    component eq = IsEqual();
    eq.in[0] <== poseidon.out;
    eq.in[1] <== locationHash;
    
    isValid <== eq.out;
}

component main = ProximityProof();
`;

    // Write circuit file
    const circuitPath = path.join(this.circuitsDir, "zkProximity.circom");
    fs.writeFileSync(circuitPath, proximityCircuit);

    const config: CircuitConfig = {
      name: "zkProximity",
      circomPath: circuitPath,
      outputDir: this.buildDir,
      ptauFile: "powersOfTau28_hez_final_12.ptau",
    };

    return await this.compileCircuit(config);
  }

  async compileConsensunsCircuit(): Promise<CompilationResult> {
    // Compile elder consensus verification circuit
    const consensusCircuit = `
pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template ConsensusProof() {
    signal input elderCount;
    signal input approvalThreshold;
    signal private input elderApprovals[10]; // Max 10 elders
    signal private input elderWeights[10];
    signal output isValid;
    
    component weightedSum = WeightedSum(10);
    for (var i = 0; i < 10; i++) {
        weightedSum.values[i] <== elderApprovals[i];
        weightedSum.weights[i] <== elderWeights[i];
    }
    
    component gte = GreaterEqThan(16);
    gte.in[0] <== weightedSum.out;
    gte.in[1] <== approvalThreshold;
    
    isValid <== gte.out;
}

template WeightedSum(n) {
    signal input values[n];
    signal input weights[n];
    signal output out;
    
    var total = 0;
    for (var i = 0; i < n; i++) {
        total += values[i] * weights[i];
    }
    out <== total;
}

component main = ConsensusProof();
`;

    // Write circuit file
    const circuitPath = path.join(this.circuitsDir, "zkConsensus.circom");
    fs.writeFileSync(circuitPath, consensusCircuit);

    const config: CircuitConfig = {
      name: "zkConsensus",
      circomPath: circuitPath,
      outputDir: this.buildDir,
      ptauFile: "powersOfTau28_hez_final_12.ptau",
    };

    return await this.compileCircuit(config);
  }

  private async generatePowerOfTau(outputPath: string): Promise<void> {
    console.log("Generating powers of tau ceremony...");

    const ptauDir = path.dirname(outputPath);
    fs.mkdirSync(ptauDir, { recursive: true });

    // Phase 1: New ceremony
    const phase1Path = path.join(ptauDir, "phase1.ptau");
    execSync(`snarkjs powersoftau new bn128 14 ${phase1Path} -v`, {
      stdio: "inherit",
    });

    // Phase 1: Contribute
    const phase1ContribPath = path.join(ptauDir, "phase1_contrib.ptau");
    execSync(
      `snarkjs powersoftau contribute ${phase1Path} ${phase1ContribPath} --name="VaultTap Ceremony" -v`,
      {
        stdio: "inherit",
        input: Buffer.from("VaultTap random entropy for ritual proofs\n"),
      },
    );

    // Phase 1: Prepare for phase 2
    execSync(
      `snarkjs powersoftau prepare phase2 ${phase1ContribPath} ${outputPath} -v`,
      {
        stdio: "inherit",
      },
    );

    // Clean up intermediate files
    fs.unlinkSync(phase1Path);
    fs.unlinkSync(phase1ContribPath);

    console.log(`Powers of tau ceremony completed: ${outputPath}`);
  }

  private ensureDirectories(): void {
    [this.circuitsDir, this.buildDir, this.ptauDir].forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
    });
  }

  // Utility methods
  getCircuitPath(name: string): string {
    return path.join(this.buildDir, name);
  }

  listCompiledCircuits(): string[] {
    if (!fs.existsSync(this.buildDir)) {
      return [];
    }

    return fs.readdirSync(this.buildDir).filter((item) => {
      const itemPath = path.join(this.buildDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  }

  getCircuitInfo(name: string): any {
    const circuitPath = path.join(this.buildDir, name);
    if (!fs.existsSync(circuitPath)) {
      return null;
    }

    const info: any = { name, path: circuitPath };

    // Check for required files
    const wasmPath = path.join(circuitPath, `${name}.wasm`);
    const zkeyPath = path.join(circuitPath, `${name}.zkey`);
    const vkeyPath = path.join(circuitPath, `${name}_vkey.json`);

    info.hasWasm = fs.existsSync(wasmPath);
    info.hasZkey = fs.existsSync(zkeyPath);
    info.hasVkey = fs.existsSync(vkeyPath);
    info.isReady = info.hasWasm && info.hasZkey && info.hasVkey;

    if (info.hasVkey) {
      try {
        info.verificationKey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
      } catch (error) {
        info.vkeyError = error;
      }
    }

    return info;
  }

  async cleanBuild(circuitName?: string): Promise<void> {
    if (circuitName) {
      const circuitPath = path.join(this.buildDir, circuitName);
      if (fs.existsSync(circuitPath)) {
        fs.rmSync(circuitPath, { recursive: true, force: true });
      }
    } else {
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(this.buildDir, { recursive: true });
    }
  }
}

// Main compilation function
export async function compileAllCircuits(): Promise<CompilationResult[]> {
  const compiler = new ZKPCompiler();

  console.log("Starting VaultTap ZK circuit compilation...");

  const results: CompilationResult[] = [];

  // Compile main ritual circuit
  console.log("\n=== Compiling Ritual Proof Circuit ===");
  const ritualResult = await compiler.compileRitualCircuit();
  results.push(ritualResult);

  // Compile proximity circuit
  console.log("\n=== Compiling Proximity Proof Circuit ===");
  const proximityResult = await compiler.compileProximityCircuit();
  results.push(proximityResult);

  // Compile consensus circuit
  console.log("\n=== Compiling Consensus Proof Circuit ===");
  const consensusResult = await compiler.compileConsensunsCircuit();
  results.push(consensusResult);

  console.log("\n=== Compilation Summary ===");
  results.forEach((result, index) => {
    const circuitNames = ["Ritual", "Proximity", "Consensus"];
    const status = result.success ? "✅ SUCCESS" : "❌ FAILED";
    const time = (result.compilationTime / 1000).toFixed(2);

    console.log(`${circuitNames[index]} Circuit: ${status} (${time}s)`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  return results;
}

// Export compiler instance
export default ZKPCompiler;

// Run compilation if called directly
if (require.main === module) {
  compileAllCircuits().catch(console.error);
}
