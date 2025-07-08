import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export interface EncryptionConfig {
  algorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
  keyDerivation: "PBKDF2" | "Argon2" | "scrypt";
  iterations?: number;
  saltLength?: number;
  tagLength?: number;
}

export interface EncryptedVault {
  algorithm: string;
  salt: Buffer;
  iv: Buffer;
  tag: Buffer;
  encryptedData: Buffer;
  keyDerivation: string;
  iterations: number;
  metadata: {
    originalSize: number;
    encryptedAt: Date;
    version: string;
  };
}

export interface SecretSharing {
  threshold: number;
  totalShares: number;
  shares: SecretShare[];
}

export interface SecretShare {
  index: number;
  data: Buffer;
  checksum: string;
}

export class VaultEncryption {
  private config: EncryptionConfig;

  constructor(config: EncryptionConfig = {}) {
    this.config = {
      algorithm: "AES-256-GCM",
      keyDerivation: "scrypt",
      iterations: 100000,
      saltLength: 32,
      tagLength: 16,
      ...config,
    };
  }

  async encryptVault(
    data: Buffer,
    passphrase: string,
    additionalData?: Buffer,
  ): Promise<EncryptedVault> {
    // Generate salt and IV
    const salt = randomBytes(this.config.saltLength!);
    const iv = randomBytes(12); // 96-bit IV for GCM

    // Derive key from passphrase
    const key = await this.deriveKey(passphrase, salt);

    // Encrypt data using AES-256-GCM
    const { encryptedData, tag } = await this.encryptAESGCM(
      data,
      key,
      iv,
      additionalData,
    );

    return {
      algorithm: this.config.algorithm!,
      salt,
      iv,
      tag,
      encryptedData,
      keyDerivation: this.config.keyDerivation!,
      iterations: this.config.iterations!,
      metadata: {
        originalSize: data.length,
        encryptedAt: new Date(),
        version: "1.0",
      },
    };
  }

  async decryptVault(
    encryptedVault: EncryptedVault,
    passphrase: string,
    additionalData?: Buffer,
  ): Promise<Buffer> {
    // Derive key from passphrase using stored parameters
    const key = await this.deriveKey(
      passphrase,
      encryptedVault.salt,
      encryptedVault.iterations,
    );

    // Decrypt data
    const decryptedData = await this.decryptAESGCM(
      encryptedVault.encryptedData,
      key,
      encryptedVault.iv,
      encryptedVault.tag,
      additionalData,
    );

    // Verify decrypted size matches expected
    if (decryptedData.length !== encryptedVault.metadata.originalSize) {
      throw new Error("Decrypted data size mismatch");
    }

    return decryptedData;
  }

  async createSecretShares(
    data: Buffer,
    threshold: number,
    totalShares: number,
  ): Promise<SecretSharing> {
    if (threshold > totalShares) {
      throw new Error("Threshold cannot exceed total shares");
    }

    if (threshold < 2) {
      throw new Error("Threshold must be at least 2");
    }

    // Use Shamir's Secret Sharing algorithm
    const shares = await this.shamirSecretSharing(data, threshold, totalShares);

    return {
      threshold,
      totalShares,
      shares,
    };
  }

  async reconstructFromShares(shares: SecretShare[]): Promise<Buffer> {
    if (shares.length < 2) {
      throw new Error("At least 2 shares required for reconstruction");
    }

    // Verify share integrity
    for (const share of shares) {
      const expectedChecksum = this.calculateChecksum(share.data);
      if (share.checksum !== expectedChecksum) {
        throw new Error(`Share ${share.index} failed integrity check`);
      }
    }

    // Reconstruct secret using Lagrange interpolation
    return await this.shamirReconstruct(shares);
  }

  private async deriveKey(
    passphrase: string,
    salt: Buffer,
    iterations?: number,
  ): Promise<Buffer> {
    const iterCount = iterations || this.config.iterations!;

    switch (this.config.keyDerivation) {
      case "scrypt":
        return (await scryptAsync(passphrase, salt, 32)) as Buffer;

      case "PBKDF2":
        const { pbkdf2 } = await import("crypto");
        const pbkdf2Async = promisify(pbkdf2);
        return await pbkdf2Async(passphrase, salt, iterCount, 32, "sha256");

      case "Argon2":
        // Note: In production, use argon2 library
        // For now, fall back to scrypt
        return (await scryptAsync(passphrase, salt, 32)) as Buffer;

      default:
        throw new Error(
          `Unsupported key derivation: ${this.config.keyDerivation}`,
        );
    }
  }

  private async encryptAESGCM(
    data: Buffer,
    key: Buffer,
    iv: Buffer,
    additionalData?: Buffer,
  ): Promise<{ encryptedData: Buffer; tag: Buffer }> {
    const { createCipheriv } = await import("crypto");

    const cipher = createCipheriv("aes-256-gcm", key, iv);

    if (additionalData) {
      cipher.setAAD(additionalData);
    }

    const encryptedChunks: Buffer[] = [];
    encryptedChunks.push(cipher.update(data));
    encryptedChunks.push(cipher.final());

    const tag = cipher.getAuthTag();
    const encryptedData = Buffer.concat(encryptedChunks);

    return { encryptedData, tag };
  }

  private async decryptAESGCM(
    encryptedData: Buffer,
    key: Buffer,
    iv: Buffer,
    tag: Buffer,
    additionalData?: Buffer,
  ): Promise<Buffer> {
    const { createDecipheriv } = await import("crypto");

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    if (additionalData) {
      decipher.setAAD(additionalData);
    }

    const decryptedChunks: Buffer[] = [];
    decryptedChunks.push(decipher.update(encryptedData));
    decryptedChunks.push(decipher.final());

    return Buffer.concat(decryptedChunks);
  }

  private async shamirSecretSharing(
    secret: Buffer,
    threshold: number,
    totalShares: number,
  ): Promise<SecretShare[]> {
    // Simple implementation of Shamir's Secret Sharing
    // In production, use a proper cryptographic library

    const shares: SecretShare[] = [];
    const polynomial = this.generatePolynomial(secret, threshold - 1);

    for (let i = 1; i <= totalShares; i++) {
      const shareValue = this.evaluatePolynomial(polynomial, i);
      const shareData = this.encodeShare(i, shareValue);

      shares.push({
        index: i,
        data: shareData,
        checksum: this.calculateChecksum(shareData),
      });
    }

    return shares;
  }

  private generatePolynomial(secret: Buffer, degree: number): Buffer[] {
    const polynomial: Buffer[] = [secret];

    for (let i = 0; i < degree; i++) {
      polynomial.push(randomBytes(secret.length));
    }

    return polynomial;
  }

  private evaluatePolynomial(polynomial: Buffer[], x: number): Buffer {
    // Evaluate polynomial at point x using finite field arithmetic
    // Simplified implementation - in production use proper GF(256) arithmetic

    let result = Buffer.alloc(polynomial[0].length);

    for (let i = 0; i < polynomial.length; i++) {
      const term = Buffer.alloc(polynomial[i].length);

      for (let j = 0; j < polynomial[i].length; j++) {
        // Simplified finite field multiplication
        let coeff = polynomial[i][j];
        for (let k = 0; k < i; k++) {
          coeff = this.gfMultiply(coeff, x);
        }
        term[j] = coeff;
      }

      for (let j = 0; j < result.length; j++) {
        result[j] = this.gfAdd(result[j], term[j]);
      }
    }

    return result;
  }

  private gfAdd(a: number, b: number): number {
    return a ^ b; // XOR for GF(256) addition
  }

  private gfMultiply(a: number, b: number): number {
    // Simplified GF(256) multiplication
    // In production, use proper lookup tables
    let result = 0;

    while (b > 0) {
      if (b & 1) {
        result ^= a;
      }
      a <<= 1;
      if (a & 0x100) {
        a ^= 0x11b; // Irreducible polynomial for GF(256)
      }
      b >>= 1;
    }

    return result & 0xff;
  }

  private encodeShare(index: number, value: Buffer): Buffer {
    const indexBuffer = Buffer.alloc(4);
    indexBuffer.writeUInt32BE(index);
    return Buffer.concat([indexBuffer, value]);
  }

  private async shamirReconstruct(shares: SecretShare[]): Promise<Buffer> {
    // Lagrange interpolation to reconstruct the secret
    // Simplified implementation for demonstration

    const points = shares.map((share) => ({
      x: share.data.readUInt32BE(0),
      y: share.data.slice(4),
    }));

    const secret = Buffer.alloc(points[0].y.length);

    for (let i = 0; i < points[0].y.length; i++) {
      let sum = 0;

      for (let j = 0; j < points.length; j++) {
        let numerator = 1;
        let denominator = 1;

        for (let k = 0; k < points.length; k++) {
          if (j !== k) {
            numerator = this.gfMultiply(numerator, points[k].x);
            denominator = this.gfMultiply(
              denominator,
              this.gfAdd(points[j].x, points[k].x),
            );
          }
        }

        const lagrangeCoeff = this.gfDivide(numerator, denominator);
        const term = this.gfMultiply(points[j].y[i], lagrangeCoeff);
        sum = this.gfAdd(sum, term);
      }

      secret[i] = sum;
    }

    return secret;
  }

  private gfDivide(a: number, b: number): number {
    // Division in GF(256) is multiplication by multiplicative inverse
    const inverse = this.gfInverse(b);
    return this.gfMultiply(a, inverse);
  }

  private gfInverse(a: number): number {
    // Extended Euclidean algorithm for GF(256)
    // Simplified implementation
    if (a === 0) throw new Error("Cannot invert zero");

    for (let i = 1; i < 256; i++) {
      if (this.gfMultiply(a, i) === 1) {
        return i;
      }
    }

    throw new Error("Inverse not found");
  }

  private calculateChecksum(data: Buffer): string {
    const { sha256 } = require("@noble/hashes/sha256");
    return Buffer.from(sha256(data)).toString("hex");
  }

  // Utility methods
  async generateVaultKeys(
    vaultId: string,
    participantKeys: string[],
  ): Promise<{
    masterKey: Buffer;
    participantShares: SecretShare[];
    metadata: any;
  }> {
    // Generate master key for vault
    const masterKey = randomBytes(32);

    // Create secret shares for participants
    const threshold = Math.ceil(participantKeys.length * 0.6); // 60% threshold
    const shares = await this.createSecretShares(
      masterKey,
      threshold,
      participantKeys.length,
    );

    return {
      masterKey,
      participantShares: shares.shares,
      metadata: {
        vaultId,
        threshold,
        totalParticipants: participantKeys.length,
        createdAt: new Date(),
      },
    };
  }

  async rotateVaultKey(
    oldEncryptedVault: EncryptedVault,
    oldPassphrase: string,
    newPassphrase: string,
  ): Promise<EncryptedVault> {
    // Decrypt with old key
    const decryptedData = await this.decryptVault(
      oldEncryptedVault,
      oldPassphrase,
    );

    // Re-encrypt with new key
    return await this.encryptVault(decryptedData, newPassphrase);
  }

  validateEncryptedVault(encryptedVault: EncryptedVault): boolean {
    try {
      // Check required fields
      if (
        !encryptedVault.algorithm ||
        !encryptedVault.salt ||
        !encryptedVault.iv ||
        !encryptedVault.tag ||
        !encryptedVault.encryptedData
      ) {
        return false;
      }

      // Check algorithm support
      const supportedAlgorithms = ["AES-256-GCM", "ChaCha20-Poly1305"];
      if (!supportedAlgorithms.includes(encryptedVault.algorithm)) {
        return false;
      }

      // Check field sizes
      if (encryptedVault.salt.length !== 32) return false;
      if (encryptedVault.iv.length !== 12) return false;
      if (encryptedVault.tag.length !== 16) return false;

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Convenience function for simple vault encryption
export async function encryptVault(
  data: Buffer,
  passphrase: string,
  config?: EncryptionConfig,
): Promise<Buffer> {
  const encryption = new VaultEncryption(config);
  const encryptedVault = await encryption.encryptVault(data, passphrase);

  // Serialize encrypted vault to buffer
  return Buffer.from(JSON.stringify(encryptedVault));
}

// Convenience function for simple vault decryption
export async function decryptVault(
  encryptedBuffer: Buffer,
  passphrase: string,
): Promise<Buffer> {
  const encryptedVault = JSON.parse(
    encryptedBuffer.toString(),
  ) as EncryptedVault;

  // Convert string buffers back to Buffer objects
  encryptedVault.salt = Buffer.from(encryptedVault.salt);
  encryptedVault.iv = Buffer.from(encryptedVault.iv);
  encryptedVault.tag = Buffer.from(encryptedVault.tag);
  encryptedVault.encryptedData = Buffer.from(encryptedVault.encryptedData);

  const encryption = new VaultEncryption();
  return await encryption.decryptVault(encryptedVault, passphrase);
}

export { VaultEncryption };
