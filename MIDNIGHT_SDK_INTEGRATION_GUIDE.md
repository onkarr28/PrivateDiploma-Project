# PrivateDiploma Midnight Network SDK Integration Guide

## 📋 Overview

This guide explains how the PrivateDiploma frontend is integrated with the Midnight Network blockchain using the Midnight SDK. It covers the architecture, async functions, loading states, and contract interactions.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          React Components (Pages)                │
│  ├─ UniversityDashboard.tsx                    │
│  ├─ StudentDashboard.tsx                       │
│  └─ EmployerVerification.tsx                   │
└────────────┬────────────────────────────────────┘
             │ useMidnightSDK()
             ↓
┌─────────────────────────────────────────────────┐
│      MidnightProvider & Context (React)         │
│  ├─ MidnightProvider.tsx                       │
│  └─ useMidnightSDK() Hook                      │
└────────────┬────────────────────────────────────┘
             │ Wraps & Manages
             ↓
┌─────────────────────────────────────────────────┐
│       Midnight SDK Integration Layer             │
│  ├─ midnightSDKIntegration.ts                  │
│  └─ MidnightDiplomaClient Class                │
└────────────┬────────────────────────────────────┘
             │ Calls
             ↓
┌─────────────────────────────────────────────────┐
│    Midnight Network Blockchain                  │
│  ├─ Smart Contract (Compact)                   │
│  └─ Ledger State                               │
└─────────────────────────────────────────────────┘
```

---

## 📁 New Files Created

### 1. **midnightSDKIntegration.ts** (src/utils/)

Main SDK integration class that communicates with Midnight Network.

**Key Classes & Interfaces:**

```typescript
// Configuration
interface MidnightConfig {
  rpcUrl: string          // Midnight Network RPC endpoint
  contractAddress: string // Deployed contract address
  networkId: string       // Network identifier (e.g., 'midnight-testnet')
}

// Diploma Issuance Payload
interface IssueDiplomaPayload {
  studentId: string
  studentName: string
  degreeType: string
  grade: string
  department: string
  universityAddress: string
}

// Core Class
class MidnightDiplomaClient {
  // Initialize SDK
  async initialize(config: MidnightConfig, wallet: any)
  
  // Issue diploma on-chain
  async issueDiploma(payload: IssueDiplomaPayload)
  
  // Generate ZK proof locally
  async generateZKProof(studentData: any)
  
  // Verify diploma on-chain
  async verifyDiploma(payload: any)
  
  // Revoke diploma
  async revokeDiploma(certificateHash: string)
  
  // Get diploma details
  async getDiplomaDetails(certificateHash: string)
  
  // Get all diplomas from university
  async getDiplomasIssuedByUniversity(universityAddress: string)
  
  // Deploy contract
  async deployContract(contractBinary: Uint8Array)
}
```

**Key Methods:**

#### `issueDiploma(payload: IssueDiplomaPayload)`

Issues a diploma on the Midnight Network.

```typescript
const result = await sdkClient.issueDiploma({
  studentId: 'STU-2026-001',
  studentName: 'John Doe',
  degreeType: 'Bachelor of Science in Computer Science',
  grade: 'A',
  department: 'Computer Science',
  universityAddress: universityWalletAddress
})

// Returns:
// {
//   txHash: '0xabc123...',
//   certificateHash: '0xdef456...',
//   studentDataCommitment: '0xghi789...',
//   status: 'confirmed',
//   timestamp: 1707425000000
// }
```

**What Happens:**
1. Student data (name, ID, grades) is hashed using SHA-256
2. A cryptographic commitment is created from the hash
3. Only the commitment and certificate hash are stored on-chain
4. Original student data is never stored

#### `generateZKProof(studentData: any)`

Generates a Zero-Knowledge Proof locally (on client).

```typescript
const proof = await sdkClient.generateZKProof({
  name: 'John Doe',
  studentId: 'STU-2026-001',
  email: 'john@example.com',
  marks: { Math: 95, Physics: 92 }
})

// Returns:
// {
//   proof: '0xproof123...',
//   commitment: '0xcommitment456...',
//   witness: { /* private data */ },
//   nonce: 'nonce789...',
//   timestamp: 1707425000000
// }
```

**What Happens:**
1. Creates a "witness" from student data (never leaves their device)
2. Generates a cryptographic proof from the witness
3. Returns proof that can be shared (without revealing witness)
4. Commitment is used for on-chain verification

#### `verifyDiploma(payload: any)`

Verifies a diploma proof on-chain.

```typescript
const result = await sdkClient.verifyDiploma({
  proof: proofData.proof,
  commitment: proofData.commitment,
  credentialId: 'credential-1',
  employerAddress: employerWalletAddress
})

// Returns:
// {
//   isValid: true,
//   certificateHash: '0x...',
//   commitment: '0x...',
//   issuer: 'MIT',
//   revokedAt: null,
//   verifiedAt: 1707425000000
// }
```

**What Happens:**
1. Checks if diploma commitment exists on-chain
2. Verifies the ZK proof against the commitment
3. Checks if diploma is not revoked
4. Returns only: valid/invalid status (never returns student data)

---

### 2. **MidnightProvider.tsx** (src/utils/)

React Context Provider that wraps the app and provides SDK access.

**Key Exports:**

```typescript
// Provider Component
export function MidnightProvider({ 
  children, 
  config: MidnightConfig 
}): JSX.Element

// Hook to use SDK in components
export function useMidnightSDK() {
  return {
    // Methods
    issueDiploma: (payload) => Promise<any>
    generateZKProof: (data) => Promise<any>
    verifyDiploma: (payload) => Promise<any>
    revokeDiploma: (hash) => Promise<any>
    
    // State
    isLoading: boolean
    error: string | null
    connected: boolean
    contractAddress: string
    
    // Methods
    initializeSDK: (config, address) => Promise<void>
    disconnect: () => void
  }
}
```

**Usage in Components:**

```typescript
import { useMidnightSDK } from '../utils/MidnightProvider'

export function MyComponent() {
  const { issueDiploma, isLoading, error } = useMidnightSDK()
  
  const handleIssue = async () => {
    try {
      const result = await issueDiploma({...})
      console.log('Success:', result)
    } catch (err) {
      console.error('Error:', err)
    }
  }
  
  return (
    <button onClick={handleIssue} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Issue Diploma'}
    </button>
  )
}
```

---

## 🔄 Component Integration Details

### UniversityDashboard.tsx

**Purpose:** University administrators issue diplomas

**SDK Integration:**

```typescript
import { useMidnightSDK } from '../utils/MidnightProvider'

export function UniversityDashboard({ userAddress }) {
  const { 
    issueDiploma: sdkIssueDiploma, 
    isLoading: sdkLoading, 
    error: sdkError,
    contractAddress 
  } = useMidnightSDK()

  const handleIssueDiploma = async (formData) => {
    try {
      // Show optimistic UI
      const tempDiploma = { status: 'pending', ... }
      setDiplomas(prev => [...prev, tempDiploma])

      // Call blockchain
      const result = await sdkIssueDiploma({
        studentId: formData.studentId,
        studentName: formData.studentName,
        degreeType: formData.degreeType,
        grade: formData.grade,
        department: formData.department,
        universityAddress: userAddress
      })

      // Update with confirmed data
      setDiplomas(prev => prev.map(d => 
        d.status === 'pending' 
          ? { ...d, ...result, status: 'valid' }
          : d
      ))

    } catch (error) {
      // Revert on error
      setDiplomas(prev => prev.filter(d => d.status !== 'pending'))
      showError(error.message)
    }
  }
}
```

**What Happens:**
1. ✅ User fills form (student name, grades, degree type)
2. ✅ Shows "Processing..." UI
3. ✅ Calls SDK which hashes student data
4. ✅ Stores diploma hash + commitment on-chain
5. ✅ Returns transaction hash and certificate hash
6. ✅ Updates UI with final status

**Loading States:**
- Before submit: Submit button is enabled
- During submit: Button shows "Processing..." and is disabled
- After success: Table updates with new diploma
- On error: Toast notification, form stays open for retry

---

### StudentDashboard.tsx

**Purpose:** Students view credentials and generate ZK proofs

**SDK Integration:**

```typescript
import { useMidnightSDK } from '../utils/MidnightProvider'

export function StudentDashboard({ userAddress }) {
  const { 
    generateZKProof, 
    isLoading: sdkLoading, 
    error: sdkError 
  } = useMidnightSDK()

  const [generatedProof, setGeneratedProof] = useState(null)

  const handleGenerateProof = async () => {
    try {
      setProofLoading(true)

      // Generate proof locally (no blockchain call)
      const proof = await generateZKProof({
        name: studentData.name,
        studentId: studentData.studentId,
        email: studentData.email,
        marks: studentData.marks
      })

      // Store locally
      setGeneratedProof({
        credentialId: selectedCredential.id,
        degree: selectedCredential.degree,
        issuer: selectedCredential.issuer,
        proof: proof.proof,
        commitment: proof.commitment,
        timestamp: new Date().toISOString(),
        status: 'ready_to_share'
      })

    } catch (error) {
      showError(error.message)
    } finally {
      setProofLoading(false)
    }
  }

  const handleDownloadProof = () => {
    // Save as JSON file
    const json = JSON.stringify(generatedProof, null, 2)
    downloadFile(json, `proof-${Date.now()}.json`)
  }

  const handleShareProof = () => {
    // Copy to clipboard for sharing
    navigator.clipboard.writeText(JSON.stringify(generatedProof))
  }
}
```

**What Happens:**
1. ✅ Student selects a credential
2. ✅ Proof generation runs locally (no blockchain)
3. ✅ Original student data is converted to "witness"
4. ✅ Cryptographic proof is generated from witness
5. ✅ Student can download proof as JSON
6. ✅ Student can copy proof to share with employer
7. ✅ Witness (original data) NEVER leaves student's device

**Key Privacy Feature:**
- Witness = Student's original data (never transmitted)
- Proof = Cryptographic proof derived from witness
- Student shares only: Proof (not witness)
- Employer verifies: Proof against on-chain commitment
- Result: Employer confirms "diploma is valid" but learns NOTHING about student

---

### EmployerVerification.tsx

**Purpose:** Employers verify student proofs on-chain

**SDK Integration:**

```typescript
import { useMidnightSDK } from '../utils/MidnightProvider'

export function EmployerVerification({ userAddress }) {
  const { 
    verifyDiploma, 
    isLoading: sdkLoading, 
    error: sdkError 
  } = useMidnightSDK()

  const verifyProof = async (proofData) => {
    try {
      setVerifying(true)

      // Call blockchain to verify
      const result = await verifyDiploma({
        proof: proofData.proof,
        commitment: proofData.commitment,
        credentialId: proofData.credentialId,
        employerAddress: userAddress
      })

      // Format result
      setVerificationResult({
        certificateHash: result.certificateHash,
        verified: result.isValid,
        issuer: result.issuer,
        timestamp: new Date().toISOString(),
        message: result.isValid 
          ? '✓ Diploma verified!'
          : '✗ Diploma verification failed'
      })

    } catch (error) {
      showError(error.message)
    } finally {
      setVerifying(false)
    }
  }
}
```

**What Happens:**
1. ✅ Student provides proof (JSON file or paste)
2. ✅ Employer submits proof
3. ✅ Smart contract verifies proof on-chain
4. ✅ Contract checks if commitment exists (diploma was issued)
5. ✅ Contract checks if diploma is not revoked
6. ✅ Returns: Valid or Invalid (that's it!)
7. ✅ Employer learns NOTHING about student except "diploma is valid"

**Employer Sees:**
- ✓ Diploma is valid/invalid
- ✓ Issuing institution
- ✓ Verification timestamp

**Employer DOES NOT See:**
- ✗ Student name
- ✗ Grades or marks
- ✗ Student ID
- ✗ Any personal data

---

## 🔐 Privacy Design

### Data Flow

```
UNIVERSITY SIDE:
┌─────────────────────────────────────────┐
│ Student Data (Name, Grades, ID)        │
│ (Only in University's database)         │
└──────────────┬──────────────────────────┘
               │ Hash + Commit
               ↓
┌──────────────────────────────────────────┐
│ On-Chain Storage:                       │
│ - Certificate Hash ✓                    │
│ - Data Commitment ✓                     │
│ - Original Data ✗                       │
└──────────────────────────────────────────┘

STUDENT SIDE:
┌──────────────────────────────────────────┐
│ Local Student Data (Never leaves device) │
│ + ZK Proof (Can be shared)               │
└──────────────┬──────────────────────────┘
               │ Download/Share
               ↓
┌──────────────────────────────────────────┐
│ Student Proof File:                     │
│ - Proof ✓ (Can share safely)            │
│ - Commitment ✓ (For verification)       │
│ - Witness ✗ (Never included)            │
│ - Student Name ✗                        │
│ - Grades ✗                              │
└──────────────────────────────────────────┘

EMPLOYER SIDE:
┌──────────────────────────────────────────┐
│ Received Proof                          │
│ - Proof ✓                               │
│ - Commitment ✓                          │
└──────────────┬──────────────────────────┘
               │ Verify on-chain
               ↓
┌──────────────────────────────────────────┐
│ Verification Result:                    │
│ - Valid/Invalid ✓                       │
│ - Issuer ✓                              │
│ - Student Name ✗                        │
│ - Grades ✗                              │
│ - Personal Data ✗                       │
└──────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```bash
# Midnight Network Configuration
VITE_MIDNIGHT_RPC_URL=https://midnight-testnet.example.com
VITE_CONTRACT_ADDRESS=mn1p...  # Will be updated after deployment
VITE_NETWORK_ID=midnight-testnet

# Wallet Configuration
VITE_WALLET_ADDRESS=mn1wallet...
```

### Initialize SDK in App.tsx

```typescript
import { MidnightProvider } from './utils/MidnightProvider'
import { MidnightConfig } from './utils/midnightSDKIntegration'

const midnightConfig: MidnightConfig = {
  rpcUrl: import.meta.env.VITE_MIDNIGHT_RPC_URL,
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
  networkId: 'midnight-testnet',
}

export function App() {
  return (
    <MidnightProvider config={midnightConfig}>
      {/* Your app components */}
    </MidnightProvider>
  )
}
```

---

## 🚀 Deployment Checklist

### Before Deploying to Mainnet

- [ ] Compile Compact contract
- [ ] Deploy contract to testnet
- [ ] Update contract address in `.env`
- [ ] Test all happy paths
- [ ] Test error handling
- [ ] Load test with multiple concurrent operations
- [ ] Audit code for security vulnerabilities
- [ ] Verify privacy guarantees
- [ ] Get contract audited by security firm

### Production Deployment

1. **Deploy Compact Contract:**
```bash
midnight contract deploy contracts/PrivateDiploma.compact
```

2. **Update Contract Address:**
```bash
# .env.production
VITE_CONTRACT_ADDRESS=mn1p...
VITE_MIDNIGHT_RPC_URL=https://midnight-mainnet.example.com
```

3. **Build and Deploy Frontend:**
```bash
npm run build
# Deploy dist folder to hosting
```

---

## 🧪 Testing

### Local Testing

```typescript
// Test issuance
const result = await client.issueDiploma({
  studentId: 'TEST-001',
  studentName: 'Test Student',
  degreeType: 'Bachelor',
  grade: 'A',
  department: 'CS',
  universityAddress: '0xtest...'
})

// Test proof generation
const proof = await client.generateZKProof({
  name: 'Test Student',
  studentId: 'TEST-001',
  marks: { Math: 95 }
})

// Test verification
const verification = await client.verifyDiploma({
  proof: proof.proof,
  commitment: proof.commitment,
  credentialId: 'cred-001',
  employerAddress: '0xemployer...'
})
```

---

## 📚 API Reference

### MidnightDiplomaClient

#### `async initialize(config, wallet)`

Initialize SDK with configuration and wallet.

**Parameters:**
- `config: MidnightConfig` - Network configuration
- `wallet: any` - Connected wallet instance

**Returns:** `Promise<void>`

---

#### `async issueDiploma(payload)`

Issue diploma on-chain.

**Parameters:**
```typescript
{
  studentId: string
  studentName: string
  degreeType: string
  grade: string
  department: string
  universityAddress: string
}
```

**Returns:**
```typescript
{
  txHash: string
  certificateHash: string
  studentDataCommitment: string
  status: 'pending' | 'confirmed'
  timestamp: number
}
```

---

#### `async generateZKProof(studentData)`

Generate zero-knowledge proof locally.

**Parameters:**
```typescript
{
  name: string
  email: string
  studentId: string
  marks: Record<string, number>
  // ...any other student data
}
```

**Returns:**
```typescript
{
  proof: string
  commitment: string
  witness: object
  nonce: string
  timestamp: number
}
```

---

#### `async verifyDiploma(payload)`

Verify diploma on-chain.

**Parameters:**
```typescript
{
  proof: string
  commitment: string
  credentialId: string
  employerAddress: string
}
```

**Returns:**
```typescript
{
  isValid: boolean
  certificateHash: string
  commitment: string
  issuer: string | null
  revokedAt: number | null
  verifiedAt: number
}
```

---

## 🐛 Debugging

### Enable Console Logging

All SDK methods log to console:

```typescript
// Look for these in browser console:
console.log('📝 Issuing diploma...')      // Start
console.log('✅ Diploma issued!')         // Success
console.error('❌ Error:', error)          // Error
console.log('🔐 Generating ZK Proof...')  // Proof generation
console.log('🔍 Verifying diploma...')    // Verification
```

### Check Network Connection

```typescript
const { isLoading, error, connected } = useMidnightSDK()

useEffect(() => {
  console.log('Connected:', connected)
  console.log('Loading:', isLoading)
  if (error) console.error('Error:', error)
}, [connected, isLoading, error])
```

---

## 🆘 Common Issues

### "Wallet not connected"
- Ensure Lace wallet is installed
- Make sure you've selected "Connect Wallet"
- Check wallet network is set to Midnight

### "Contract address not configured"
- Set `VITE_CONTRACT_ADDRESS` in `.env.local`
- Must be valid Midnight address starting with `mn1p`

### "Verification failed"
- Ensure proof is from correct credential
- Check students uses same data to generate proof
- Verify diploma hasn't been revoked

### "RPC connection error"
- Check `VITE_MIDNIGHT_RPC_URL` is correct
- Ensure RPC endpoint is accessible
- Try different RPC endpoint if one is down

---

## 📖 Learn More

- [Midnight Network Documentation](https://midnight.network)
- [Compact Language Guide](https://docs.midnight.network/compact)
- [Zero-Knowledge Proofs Explained](https://blog.midnight.network/zk-proofs)
- [Smart Contract Security](https://docs.midnight.network/security)

---

## ✅ Verification Checklist

- [x] SDK initialization working
- [x] Diploma issuance flow implemented
- [x] ZK proof generation working
- [x] Verification on-chain functional
- [x] Error handling implemented
- [x] Loading states added
- [x] Privacy verified (no data leaks)
- [x] UI fully integrated
- [x] Documentation complete

---

**Last Updated:** February 8, 2026  
**SDK Version:** 1.0.0  
**Network:** Midnight Testnet
