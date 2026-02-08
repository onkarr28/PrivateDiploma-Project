/**
 * Diploma Management System
 * Handles diploma issuance, verification, and revocation with persistent storage
 */

export interface DiplomaData {
  id: string;
  studentName: string;
  studentId: string;
  degree: string;
  field: string;
  marks: number;
  graduationDate: string;
  universityName: string;
  universityAddress: string;
}

export interface DiplomaRecord {
  id: string;
  hash: string;
  diplomaDataHash: string;
  issuedBy: string;
  issuedAt: number;
  isRevoked: boolean;
  revokedAt?: number;
  nullifier: string;
  proofCount: number;
}

export interface StudentDiploma {
  id: string;
  hash: string;
  diplomaData: DiplomaData;
  issuedAt: number;
  isRevoked: boolean;
  proofs: ZKProof[];
}

export interface ZKProof {
  id: string;
  diplomaId: string;
  proof: string;
  nullifier: string;
  createdAt: number;
  verifiedAt?: number;
  verifiedBy?: string;
  isValid: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  diplomaHash: string;
  message: string;
  verifiedAt: number;
  employerVerified: string;
}

class DiplomaManager {
  private diplomaRecords: Map<string, DiplomaRecord> = new Map();
  private studentDiplomas: Map<string, StudentDiploma[]> = new Map();
  private zKProofs: Map<string, ZKProof[]> = new Map();
  private verifications: Map<string, VerificationResult[]> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Issue a new diploma
   */
  async issueDiploma(
    diplomaData: DiplomaData,
    universityAddress: string
  ): Promise<DiplomaRecord> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const diplomaHash = this.hashDiplomaData(diplomaData);
        const diplomaRecord: DiplomaRecord = {
          id: this.generateId(),
          hash: diplomaHash,
          diplomaDataHash: this.hashDiplomaData(diplomaData),
          issuedBy: universityAddress,
          issuedAt: Date.now(),
          isRevoked: false,
          nullifier: this.generateNullifier(),
          proofCount: 0,
        };

        this.diplomaRecords.set(diplomaRecord.id, diplomaRecord);

        // Store diploma for student
        const studentId = diplomaData.studentId;
        const studentDiploma: StudentDiploma = {
          id: diplomaRecord.id,
          hash: diplomaHash,
          diplomaData,
          issuedAt: diplomaRecord.issuedAt,
          isRevoked: false,
          proofs: [],
        };

        if (!this.studentDiplomas.has(studentId)) {
          this.studentDiplomas.set(studentId, []);
        }
        this.studentDiplomas.get(studentId)!.push(studentDiploma);

        this.saveToStorage();
        this.notifyListeners();
        resolve(diplomaRecord);
      }, 1500);
    });
  }

  /**
   * Get diploma record by ID
   */
  getDiplomaRecord(id: string): DiplomaRecord | undefined {
    return this.diplomaRecords.get(id);
  }

  /**
   * Get all diploma records (for university)
   */
  getAllDiplomaRecords(): DiplomaRecord[] {
    return Array.from(this.diplomaRecords.values());
  }

  /**
   * Get student's diplomas
   */
  getStudentDiplomas(studentId: string): StudentDiploma[] {
    return this.studentDiplomas.get(studentId) || [];
  }

  /**
   * Generate ZK proof
   */
  async generateZKProof(diplomaId: string, studentId: string): Promise<ZKProof> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const studentDiplomas = this.studentDiplomas.get(studentId) || [];
        const diploma = studentDiplomas.find((d) => d.id === diplomaId);

        if (!diploma) {
          throw new Error('Diploma not found');
        }

        const proof: ZKProof = {
          id: this.generateId(),
          diplomaId,
          proof: this.generateProof(),
          nullifier: this.generateNullifier(),
          createdAt: Date.now(),
          isValid: true,
        };

        if (!this.zKProofs.has(diplomaId)) {
          this.zKProofs.set(diplomaId, []);
        }
        this.zKProofs.get(diplomaId)!.push(proof);

        // Update diploma record proof count
        const record = this.diplomaRecords.get(diplomaId);
        if (record) {
          record.proofCount++;
        }

        // Add proof to student's diploma
        diploma.proofs.push(proof);

        this.saveToStorage();
        this.notifyListeners();
        resolve(proof);
      }, 2000);
    });
  }

  /**
   * Verify ZK proof
   */
  async verifyZKProof(
    diplomaId: string,
    proof: ZKProof,
    employerAddress: string
  ): Promise<VerificationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record = this.diplomaRecords.get(diplomaId);

        if (!record || record.isRevoked) {
          const result: VerificationResult = {
            isValid: false,
            diplomaHash: '',
            message: 'Diploma not found or has been revoked',
            verifiedAt: Date.now(),
            employerVerified: employerAddress,
          };
          resolve(result);
          return;
        }

        // Verify proof signature
        const isValid = this.verifyProof(proof, record);
        const result: VerificationResult = {
          isValid,
          diplomaHash: record.hash,
          message: isValid
            ? 'Diploma verified successfully ✓'
            : 'Proof verification failed ✗',
          verifiedAt: Date.now(),
          employerVerified: employerAddress,
        };

        if (isValid) {
          proof.verifiedAt = Date.now();
          proof.verifiedBy = employerAddress;
        }

        // Store verification
        if (!this.verifications.has(diplomaId)) {
          this.verifications.set(diplomaId, []);
        }
        this.verifications.get(diplomaId)!.push(result);

        this.saveToStorage();
        this.notifyListeners();
        resolve(result);
      }, 1500);
    });
  }

  /**
   * Revoke a diploma
   */
  async revokeDiploma(diplomaId: string, universityAddress: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record = this.diplomaRecords.get(diplomaId);
        if (record && record.issuedBy === universityAddress) {
          record.isRevoked = true;
          record.revokedAt = Date.now();
          this.saveToStorage();
          this.notifyListeners();
        }
        resolve();
      }, 1000);
    });
  }

  /**
   * Get verification results for a diploma
   */
  getVerifications(diplomaId: string): VerificationResult[] {
    return this.verifications.get(diplomaId) || [];
  }

  /**
   * Get all verified diplomas (for employer)
   */
  getAllVerifications(): VerificationResult[] {
    const all: VerificationResult[] = [];
    this.verifications.forEach((results) => {
      all.push(...results);
    });
    return all.sort((a, b) => b.verifiedAt - a.verifiedAt);
  }

  /**
   * Listen for changes
   */
  onChange(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      totalDiplomas: this.diplomaRecords.size,
      revokedDiplomas: Array.from(this.diplomaRecords.values()).filter((d) => d.isRevoked)
        .length,
      totalProofs: Array.from(this.zKProofs.values()).reduce((sum, arr) => sum + arr.length, 0),
      totalVerifications: Array.from(this.verifications.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
    };
  }

  // Private helper methods

  private hashDiplomaData(data: DiplomaData | any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  private generateProof(): string {
    return `proof_${Date.now()}_${Math.random().toString(36).substring(2, 40)}`;
  }

  private generateNullifier(): string {
    return `null_${Math.random().toString(36).substring(2, 40)}`;
  }

  private generateId(): string {
    return `did_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private verifyProof(proof: ZKProof, record: DiplomaRecord): boolean {
    // Simulate proof verification
    // In real implementation, this would verify the ZK proof cryptographically
    return !record.isRevoked && proof.isValid;
  }

  private saveToStorage(): void {
    const data = {
      diplomaRecords: Array.from(this.diplomaRecords.entries()),
      studentDiplomas: Array.from(this.studentDiplomas.entries()),
      zKProofs: Array.from(this.zKProofs.entries()),
      verifications: Array.from(this.verifications.entries()),
    };
    localStorage.setItem('diplomaSystemData', JSON.stringify(data));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('diplomaSystemData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.diplomaRecords = new Map(data.diplomaRecords);
        this.studentDiplomas = new Map(data.studentDiplomas);
        this.zKProofs = new Map(data.zKProofs);
        this.verifications = new Map(data.verifications);
      } catch (e) {
        console.error('Failed to load diploma data from storage', e);
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }
}

// Singleton instance
export const diplomaManager = new DiplomaManager();
