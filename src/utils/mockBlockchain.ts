/**
 * Mock Midnight Network Integration
 * For development/testing without actual Midnight Network connection
 * Replace with real SDK calls in production
 */

// Simple hash function for browser
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Mock blockchain ledger (in-memory storage)
export const mockBlockchain = {
  diplomas: new Map<string, any>(),
  usedNullifiers: new Set<string>(),
  authorizedIssuers: new Set<string>([
    '0x1234567890ABCDEF1234567890ABCDEF12345678', // MIT
    '0x2345678901BCDEF02345678901BCDEF023456789', // Stanford
  ]),

  // Issue diploma (mint)
  issueDiploma(data: any) {
    if (!this.authorizedIssuers.has(data.issuerAddress)) {
      throw new Error('Issuer not authorized')
    }
    if (this.diplomas.has(data.certificateHash)) {
      throw new Error('Diploma already issued')
    }
    this.diplomas.set(data.certificateHash, {
      ...data,
      status: 1, // valid
      timestamp: Date.now(),
    })
    return { success: true, hash: `0x${Math.random().toString(16).slice(2)}` }
  },

  // Verify degree (check proof)
  verifyDegree(proof: any): boolean {
    // Check certificate exists
    if (!this.diplomas.has(proof.certificateHash)) {
      return false
    }

    const diploma = this.diplomas.get(proof.certificateHash)

    // Check not revoked
    if (diploma.status === 0) {
      return false
    }

    // Check nullifier not used
    if (this.usedNullifiers.has(proof.nullifier)) {
      return false
    }

    // Mark nullifier as used
    this.usedNullifiers.add(proof.nullifier)

    return true
  },

  // Revoke diploma
  revokeDiploma(certificateHash: string, issuerAddress: string): boolean {
    if (!this.diplomas.has(certificateHash)) {
      return false
    }

    const diploma = this.diplomas.get(certificateHash)

    if (diploma.issuerAddress !== issuerAddress) {
      return false // Only issuer can revoke
    }

    diploma.status = 0 // revoked
    this.diplomas.set(certificateHash, diploma)
    return true
  },

  // Check diploma status
  getDiplomaStatus(certificateHash: string): number {
    if (!this.diplomas.has(certificateHash)) {
      return 0
    }
    return this.diplomas.get(certificateHash).status
  },

  // Check if issuer is authorized
  isAuthorizedIssuer(address: string): boolean {
    return this.authorizedIssuers.has(address)
  },

  // Check diploma validity (not revoked)
  checkDiplomaValidity(certificateHash: string): boolean {
    if (!this.diplomas.has(certificateHash)) {
      return false
    }
    return this.diplomas.get(certificateHash).status === 1
  },

  // Check if nullifier used
  isNullifierUsed(nullifier: string): boolean {
    return this.usedNullifiers.has(nullifier)
  },

  // Add authorized issuer (admin only)
  addAuthorizedIssuer(address: string): void {
    this.authorizedIssuers.add(address)
  },

  // Get all diplomas (for UI)
  getAllDiplomas(): any[] {
    return Array.from(this.diplomas.values())
  },

  // Clear blockchain (for testing)
  reset(): void {
    this.diplomas.clear()
    this.usedNullifiers.clear()
    this.authorizedIssuers.clear()
    this.authorizedIssuers.add('0x1234567890ABCDEF1234567890ABCDEF12345678')
  },
}

/**
 * Mock API responses for development
 */
export const mockAPI = {
  // Simulate diploma issuance transaction
  async issueDiploma(payload: any) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const result = mockBlockchain.issueDiploma(payload)
    return { success: true, txHash: result.hash }
  },

  // Simulate proof verification transaction
  async submitVerificationProof(proof: any) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const isValid = mockBlockchain.verifyDegree(proof)
    return { success: true, isValid }
  },

  // Simulate diploma revocation
  async revokeDiploma(certificateHash: string, issuerAddress: string) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const success = mockBlockchain.revokeDiploma(
      certificateHash,
      issuerAddress
    )
    return { success, txHash: `0x${Math.random().toString(16).slice(2)}` }
  },

  // Get diploma details
  async getDiplomaRecord(certificateHash: string) {
    if (mockBlockchain.diplomas.has(certificateHash)) {
      return mockBlockchain.diplomas.get(certificateHash)
    }
    return null
  },

  // Check diploma status
  async checkDiplomaValidity(certificateHash: string) {
    return mockBlockchain.checkDiplomaValidity(certificateHash)
  },

  // Verify issuer
  async verifyIssuanceAuthority(address: string) {
    return mockBlockchain.isAuthorizedIssuer(address)
  },
}

/**
 * Transaction simulator
 * Simulates blockchain transactions for testing
 */
export class MockTransaction {
  constructor(public data: any) {}

  async execute() {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { txHash: `0x${Math.random().toString(16).slice(2).toUpperCase()}` }
  }
}
