# On-Chain Transaction Implementation Guide

## Overview

This guide explains how PrivateDiploma implements real on-chain transactions on the Midnight Network using Zero-Knowledge Proofs (ZKPs) to maintain privacy while ensuring verifiability.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                                                             │
│  ┌────────────────┐      ┌──────────────────┐             │
│  │   University   │      │     Student      │             │
│  │   Dashboard    │      │    Dashboard     │             │
│  └────────┬───────┘      └────────┬─────────┘             │
│           │                       │                        │
│           └───────────┬───────────┘                        │
│                       │                                     │
│                       ▼                                     │
│           ┌───────────────────────┐                        │
│           │ MidnightProvider      │                        │
│           │ (React Context)       │                        │
│           └───────────┬───────────┘                        │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
┌─────────────────────┐  ┌────────────────────────┐
│ TransactionManager  │  │ MidnightWalletManager  │
│                     │  │                        │
│ • Gas estimation    │  │ • Wallet connection    │
│ • TX signing        │  │ • Message signing      │
│ • Status monitoring │  │ • Balance queries      │
└──────────┬──────────┘  └────────────┬───────────┘
           │                          │
           └────────┬─────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Midnight Network RPC  │
        │                       │
        │  • Submit TX          │
        │  • Query ledger       │
        │  • Get receipts       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Blockchain Ledger   │
        │                       │
        │  Only commitment      │
        │  stored (private)     │
        └───────────────────────┘
```

---

## Key Components

### 1. Transaction Manager (`transactionManager.ts`)

**Purpose:** Handles all blockchain transactions with ZKP integration

**Key Functions:**

#### `submitDiplomaTransaction(witness, privateKey?)`
```typescript
// Issue a diploma on-chain with privacy
const txResult = await submitDiplomaTransaction({
  studentId: "STU001",
  studentName: "Alice Smith",  // Kept private!
  degreeType: "BSc Computer Science",
  grade: "A",
  department: "CS",
  issueDate: "2026-02-08",
  universityAddress: "0xUniversity..."
});

// Returns:
// {
//   txHash: "0xabc123...",
//   status: "pending",
//   certificateHash: "0xcommitment...",  // Only this goes on-chain!
//   timestamp: 1707393600000
// }
```

**What happens:**
1. ✅ Generates commitment from witness (one-way hash)
2. ✅ Creates nullifier for revocation tracking
3. ✅ Estimates gas fees
4. ✅ Signs transaction with wallet
5. ✅ Broadcasts to Midnight Network
6. ✅ Monitors status (pending → confirmed/failed)

**Privacy:** Only the commitment is stored on-chain. The witness (student name, grades, ID) **never leaves the client**.

---

#### `verifyDiplomaTransaction(zkProof)`
```typescript
// Verify a diploma using ZK proof
const txResult = await verifyDiplomaTransaction({
  proof: "0xzkproof...",        // ZK proof data
  publicInputs: ["0x123..."],    // Public commitments
  commitment: "0xabc...",        // Original commitment
  nullifier: "0xdef..."          // Prevents double-spending
});

// Returns:
// {
//   txHash: "0xdef456...",
//   status: "pending",
//   timestamp: 1707393700000
// }
```

**What happens:**
1. ✅ Validates ZK proof structure locally
2. ✅ Estimates gas for verification
3. ✅ Encodes verification data (proof + commitment)
4. ✅ Submits transaction to contract
5. ✅ Smart contract verifies proof on-chain
6. ✅ Returns verification result

**Privacy:** The verifier learns **nothing** about the student's personal data. They only see:
- ✓ Proof is valid
- ✓ Diploma was issued by trusted university
- ✓ Diploma is not revoked

---

### 2. Gas Estimation

#### `estimateGasForIssuance(commitment)`
```typescript
const gasEstimate = await estimateGasForIssuance(commitment);

// Returns:
// {
//   gasLimit: "250000",              // Max gas allowed
//   gasPrice: "1000000000",          // Wei per gas unit
//   estimatedFee: "250000000000000", // Estimated cost
//   maxFee: "300000000000000"        // Max cost (with 20% buffer)
// }
```

**Gas breakdown:**
- Base gas: 150,000 (contract execution)
- Data gas: commitment.length × 68 (per byte)
- ZK proof gas: 50,000 (proof verification)
- **Total:** ~250,000 gas units

#### `estimateGasForVerification(zkProof)`
```typescript
const gasEstimate = await estimateGasForVerification(zkProof);

// Returns similar structure with:
// - Base: 100,000
// - Proof data: proof.length × 16
// - ZK verification: 80,000
// - Total: ~200,000 gas units
```

---

### 3. Transaction Status Monitoring

#### `monitorTransaction(txHash, result)`
```typescript
// Automatically polls for transaction status
monitorTransaction(txHash, result);

// Polls every 10 seconds for up to 10 minutes
// Updates result object when status changes:
// - pending → confirmed (with block number, gas used)
// - pending → failed (with error)
```

**Status flow:**
```
pending (submitted)
    ↓
    ├─→ confirmed (success)
    │   • Block number assigned
    │   • Gas used recorded
    │   • Certificate hash finalized
    │
    └─→ failed (reverted)
        • Transaction rejected
        • Gas still consumed
        • Refund (minus gas)
```

#### Subscribe to updates:
```typescript
const unsubscribe = monitorTransaction(txHash, (status) => {
  console.log('Status:', status.status);
  
  if (status.status === 'confirmed') {
    console.log('Block:', status.blockNumber);
    console.log('Gas used:', status.gasUsed);
    unsubscribe(); // Stop monitoring
  }
});
```

---

## Privacy Implementation

### Commitment Generation
```typescript
// PRIVATE witness (never leaves client)
const witness = {
  studentId: "STU001",
  studentName: "Alice Smith",  // 🔒 Private
  degreeType: "BSc CS",
  grade: "A",                   // 🔒 Private
  department: "CS",
  issueDate: "2026-02-08",
  universityAddress: "0x..."
};

// Generate commitment (one-way hash)
const commitment = await generateCommitment(witness);
// → "0xabc123..." (only this goes on-chain)

// PUBLIC data on blockchain:
// {
//   commitment: "0xabc123...",
//   nullifier: "0xdef456...",
//   timestamp: 1707393600000,
//   blockNumber: 1234567
// }
```

**Key principle:** The blockchain stores a **cryptographic commitment** to the data, not the data itself.

### Zero-Knowledge Proof Verification
```typescript
// Student generates proof locally
const zkProof = await generateZKProof(witness);
// zkProof contains:
// - proof: Cryptographic proof
// - commitment: Same as on-chain
// - witness: Private (NOT included in proof)

// Employer verifies proof
const isValid = await verifyDiplomaTransaction(zkProof);

// Employer learns:
// ✓ Diploma is valid
// ✓ Issued by trusted university
// ✓ Not revoked
// 
// Employer does NOT learn:
// ✗ Student name
// ✗ Grades
// ✗ Student ID
// ✗ Exact issue date
```

---

## Integration Guide

### Step 1: Initialize Transaction Manager
```typescript
import { initializeTransactionManager } from './transactionManager';

// In MidnightProvider
initializeTransactionManager({
  rpcUrl: 'https://rpc.midnight.network',
  contractAddress: '0xYourContract...',
  networkId: 'testnet'
});
```

### Step 2: Issue Diploma (University)
```tsx
// In UniversityDashboard.tsx
import { useMidnightSDK } from '../utils/MidnightProvider';

const { submitDiplomaTransaction, monitorTransaction } = useMidnightSDK();

const handleIssueDiploma = async (formData) => {
  // 1. Create witness (private data)
  const witness = {
    studentId: formData.studentId,
    studentName: formData.studentName,  // 🔒 Stays local
    degreeType: formData.degreeType,
    grade: formData.grade,              // 🔒 Stays local
    department: formData.department,
    issueDate: new Date().toISOString(),
    universityAddress: userAddress
  };

  // 2. Submit transaction
  const txResult = await submitDiplomaTransaction(witness);
  console.log('TX Hash:', txResult.txHash);

  // 3. Monitor status
  const unsubscribe = monitorTransaction(txResult.txHash, (status) => {
    if (status.status === 'confirmed') {
      console.log('✓ Diploma confirmed on-chain!');
      console.log('Block:', status.blockNumber);
      console.log('Gas:', status.gasUsed);
      unsubscribe();
    }
  });
};
```

### Step 3: Generate Proof (Student)
```tsx
// In StudentDashboard.tsx
const { generateZKProof } = useMidnightSDK();

const handleGenerateProof = async (credential) => {
  // Generate proof locally (witness never transmitted)
  const proof = await generateZKProof({
    studentId: credential.id,
    studentName: credential.name,    // 🔒 Private
    degreeType: credential.degree,
    grade: credential.grade,         // 🔒 Private
    // ... other private fields
  });

  // Share only the proof (not the witness)
  shareProof(proof);
};
```

### Step 4: Verify Diploma (Employer)
```tsx
// In EmployerVerification.tsx
const { verifyDiplomaTransaction } = useMidnightSDK();

const handleVerify = async (proofJson) => {
  const zkProof = JSON.parse(proofJson);

  // Submit verification transaction
  const txResult = await verifyDiplomaTransaction(zkProof);

  // Monitor verification
  monitorTransaction(txResult.txHash, (status) => {
    if (status.status === 'confirmed') {
      console.log('✓ Diploma verified on-chain!');
      // Employer learns diploma is valid
      // But NOT student's personal data
    }
  });
};
```

---

## Transaction Lifecycle

### 1. Submission Phase
```
User Action (Issue Diploma)
    ↓
Create Witness (private data)
    ↓
Generate Commitment (hash)
    ↓
Estimate Gas Fees
    ↓
Sign Transaction (wallet)
    ↓
Broadcast to Network
    ↓
Receive TX Hash
```

### 2. Pending Phase
```
Transaction in Mempool
    ↓
Waiting for Block Inclusion
    ↓
Polling Status (every 10s)
    ↓
Check Receipt
```

### 3. Confirmation Phase
```
Block Mined
    ↓
Transaction Included
    ↓
Gas Fees Deducted
    ↓
Receipt Available
    ↓
Status → Confirmed
    ↓
Update UI
```

---

## Error Handling

### Common Errors

#### 1. Insufficient Gas
```typescript
// Error: "Transaction ran out of gas"
// Solution: Increase gas limit

const gasEstimate = await estimateGasForIssuance(commitment);
const txData = {
  // ...
  gas: (parseInt(gasEstimate.gasLimit) * 1.2).toString() // 20% buffer
};
```

#### 2. Transaction Reverted
```typescript
// Error: "Transaction reverted by smart contract"
// Reasons:
// - Invalid proof
// - Diploma already exists
// - Unauthorized issuer
// - Contract paused

// Check before submitting:
const exists = await queryDiplomaByCommitment(commitment);
if (exists) {
  throw new Error('Diploma already issued');
}
```

#### 3. Wallet Not Connected
```typescript
// Error: "Wallet not connected"
// Solution: Connect wallet first

const account = midnightWalletManager.getAccount();
if (!account) {
  throw new Error('Please connect your wallet');
}
```

---

## Best Practices

### 1. Always Monitor Transactions
```typescript
// ❌ Bad: Fire and forget
await submitDiplomaTransaction(witness);

// ✅ Good: Monitor until confirmed
const tx = await submitDiplomaTransaction(witness);
monitorTransaction(tx.txHash, handleStatus);
```

### 2. Show Gas Estimates to Users
```typescript
// Let users know the cost
const gasEstimate = await estimateGasForIssuance(commitment);
console.log(`Estimated fee: ${formatFee(gasEstimate.estimatedFee)} DUST`);
```

### 3. Handle All States
```typescript
monitorTransaction(txHash, (status) => {
  switch (status.status) {
    case 'pending':
      showPendingUI();
      break;
    case 'confirmed':
      showSuccessUI();
      break;
    case 'failed':
      showErrorUI();
      break;
  }
});
```

### 4. Never Log Private Data
```typescript
// ❌ Bad: Logs sensitive data
console.log('Issuing diploma for:', witness);

// ✅ Good: Logs only commitment
console.log('Commitment:', commitment.slice(0, 16) + '...');
```

---

## Testing

### Local Testing
```typescript
// Mock transaction submission
const mockTx = await submitDiplomaTransaction(witness);
// Simulates 5-10 second confirmation
```

### Testnet Testing
```
1. Connect to Midnight testnet
2. Get testnet tokens (faucet)
3. Issue diploma (real transaction)
4. Wait for confirmation
5. Verify gas usage
6. Check explorer
```

### Mainnet Deployment
```
1. Deploy contract to mainnet
2. Update config with mainnet RPC
3. Test with small amount first
4. Monitor for 24 hours
5. Scale up gradually
```

---

## Explorer Integration

View your transactions:
```
https://explorer.midnight.network/tx/{txHash}
```

**What's visible:**
- Transaction hash
- Block number
- Gas used
- From/To addresses
- Commitment (hash only)
- Timestamp

**What's NOT visible:**
- Student name
- Grades
- Student ID
- Department
- Any witness data

---

## Summary

✅ **Privacy:** Witness data never leaves client  
✅ **Transparency:** All commitments on public ledger  
✅ **Verifiability:** Anyone can verify proofs  
✅ **Gas Efficient:** Optimized for low fees  
✅ **Monitoring:** Real-time transaction status  
✅ **Security:** Wallet-signed transactions only  

The system achieves the perfect balance: **public verifiability with private data**.
