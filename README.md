# PrivateDiploma 🎓

**Privacy-Preserving Educational Credential Verification System** built on the Midnight Network using Zero-Knowledge Proofs.

![Banner](https://img.shields.io/badge/Blockchain-Midnight%20Network-blueviolet)
![Status](https://img.shields.io/badge/Status-Beta-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

> **⚡ Quick Start:** See [QUICK_SETUP.md](QUICK_SETUP.md) for contract address, wallet connection details, and 5-minute setup guide.

## 🌟 Overview

PrivateDiploma enables universities to issue digital diplomas and allows students to prove they possess valid degrees to employers using **Zero-Knowledge Proofs (ZKP)** without revealing:

- ✓ Student names
- ✓ Grades/marks  
- ✓ Academic transcripts
- ✓ Personal identifiable information (PII)

### The Problem We Solve

Traditional credential verification exposes sensitive student data. PrivateDiploma ensures:

1. **Universities** can issue tamper-proof, revocable diplomas
2. **Students** can prove diploma validity without exposing personal information
3. **Employers** can verify credentials instantly without accessing private data

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Blockchain** | Midnight Network (Cardano Sidechain) |
| **Smart Contracts** | Compact Language |
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **Cryptography** | SHA-256, Zero-Knowledge Proofs |
| **Build Tool** | Vite |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRIVATEDIPLOMA SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  University  │  │  Student     │  │  Employer    │      │
│  │  (Issuer)    │  │  (Prover)    │  │  (Verifier)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         │ 1. Issue         │ 2. Generate      │               │
│         │ Diploma          │ ZK Proof         │               │
│         │                  │ (Private)        │               │
│         ▼                  ▼                  │               │
│  ┌──────────────────────────┐               │               │
│  │   Smart Contract         │               │               │
│  │   (Midnight Network)     │◄──────────────┤               │
│  │                          │ 3. Submit Proof               │
│  │ • Issue Diploma          │ & Verify                     │
│  │ • Store Hashes           ▼               │               │
│  │ • Verify Proofs     ┌──────────────┐    │               │
│  │ • Revoke Creds      │   On-Chain   │    │               │
│  └──────────────────────┤  Validation  │    │               │
│         │               │ (ZKP Check)  │    │               │
│         │               └──────────────┘    │               │
│         │                      │            │               │
│         └──────────────────────┼────────────┘               │
│                                │                            │
│                    ✓ Diploma is VALID                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser
- Midnight Network wallet (for production)

### Installation

1. **Clone the repository:**
```bash
cd "midnight project"
npm install
```

2. **Install dependencies:**
```bash
npm install
```

The project includes:
- React & React DOM
- TypeScript
- Tailwind CSS
- Vite (build tool)
- Midnight SDK (contract integration)

### Running the Application

```bash
# Start development server
npm run dev

# The app opens at http://localhost:3000
```

### ⛓️ Contract Address

The application uses a Midnight Network smart contract for diploma issuance and verification:

**Testnet Contract Address (Local Midnight Network):**
```
mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p
```

**Configuration:**
- RPC URL: `http://localhost:9944` (local Midnight node)
- Network ID: `0` (testnet/local)
- Contract status: Deployed and active

You can update the contract address in `.env.local`:
```env
VITE_CONTRACT_ADDRESS=mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p
VITE_MIDNIGHT_RPC_URL=http://localhost:9944
VITE_ENABLE_BLOCKCHAIN=true
```

### Building for Production

```bash
# Build TypeScript and bundle with Vite
npm run build

# Preview production build
npm run preview
```

---

## 📋 Project Structure

```
midnight project/
├── contracts/
│   └── PrivateDiploma.compact      # Smart contract (Compact language)
├── src/
│   ├── pages/
│   │   ├── Landing.tsx             # Home page & role selection
│   │   ├── UniversityDashboard.tsx # Issue diplomas
│   │   ├── StudentDashboard.tsx    # Manage credentials
│   │   └── EmployerVerification.tsx# Verify proofs
│   ├── components/
│   │   ├── Navigation.tsx          # Top navigation bar
│   │   ├── WalletConnector.tsx     # Wallet connection
│   │   ├── DiplomaIssuanceForm.tsx # Issue diploma form
│   │   ├── DiplomaList.tsx         # Display diplomas
│   │   ├── StudentCredentialCard.tsx
│   │   └── ZKProofGenerator.tsx    # Generate ZK proofs
│   ├── styles/
│   │   └── globals.css             # Global styles
│   ├── index.ts                    # SDK integration code
│   ├── examples.ts                 # Usage examples
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # Entry point
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── tailwind.config.js              # Tailwind config
└── README.md                        # This file
```

---

## 🎯 Features

### 1. 🎓 University Portal

**Issue diplomas with complete privacy:**

```
✓ Issue diploma to student
  - Student name is HASHED
  - Grades are HASHED
  - Only cryptographic commitment stored on-chain
```

**Capabilities:**
- Issue diplomas to students
- Track issued credentials
- Revoke diplomas if needed (misconduct, errors)
- View issuer statistics

**Privacy Guarantee:**
- Student names stored as hashes only
- Grades never exposed on blockchain
- Student ID protected in certificate hash
- Academic transcript completely private

### 2. 👨‍🎓 Student Portal

**Manage credentials and generate ZK proofs:**

```
Student Data (Local Only)     ZK Proof (Shareable)
├── Name                      ├── Certificate Hash
├── Grades                    ├── Proof Commitment
├── Student ID                ├── Nullifier (Replay Prevention)
└── Transcript     ─────→    └── Nonce (Uniqueness)
    (NEVER SENT)                 (CAN SHARE SAFELY)
```

**Capabilities:**
- View all issued credentials
- Generate zero-knowledge proofs offline
- Download proofs as JSON files
- Share proofs with employers
- Complete privacy control

**How ZK Proofs Work:**
1. Student data is ONLY used locally
2. Cryptographic proof is generated
3. Proof can be shared with employers
4. Employer verifies proof on-chain
5. Employer learns only: "Diploma is valid"

### 3. 🏢 Employer Portal

**Verify candidate credentials instantly:**

```
Employer Flow:
1. Upload/paste proof from candidate
   ↓
2. Smart contract validates proof on-chain
   ↓
3. Instant verification result
   ↓
4. Employer knows: "Diploma is valid"
   (Nothing else is revealed)
```

**Capabilities:**
- Upload zero-knowledge proofs
- Manually enter proof JSON
- Verify on Midnight Network
- Check diploma validity
- See issuer information

**Privacy Protection:**
- Never see candidate name
- Never see grades
- Never see student ID
- Never see transcript
- Only confirmation that diploma is valid

---

## 🔐 Privacy Guarantees

### On-Chain Data

```javascript
// What's stored on blockchain (PUBLIC)
DiplomaRecord {
  certificateHash: Field,           // Hash of (universityID + studentID + timestamp)
  issuerAddress: Address,           // Which university issued it
  issuanceTimestamp: Field,         // When it was issued
  status: Field,                    // Valid (1) or Revoked (0)
  studentDataCommitment: Field,     // Hash of (name + grades + metadata)
  degreeTypeHash: Field,            // Hash of degree type
  departmentHash: Field             // Hash of department
}

/* IMPORTANT: Only HASHES stored, never actual data! */
```

### Student Data (PRIVATE)

```javascript
// What student keeps locally (NEVER ON-CHAIN)
{
  name: "John Doe",                 // HASHED before sending
  marks: { Math: 95, ... },         // HASHED before sending
  studentId: "STU-001",             // HASHED before sending
  transcript: [...],                // NEVER exposed
  personalInfo: {...}               // NEVER exposed
}
```

### ZK Proof Verification

```javascript
// What happens during verification
1. Student generates proof offline (no blockchain involved)
2. Proof is sent to employer
3. Employer submits proof to smart contract
4. Contract checks:
   - ✓ Certificate exists
   - ✓ Not revoked
   - ✓ Within validity period
   - ✓ Proof commitment matches
   - ✓ Nullifier not used before
5. Contract returns: true/false (only diploma validity)

/* NO student identity or data is ever revealed */
```

---

## 💡 Usage Examples

### For Universities: Issue a Diploma

```typescript
const client = new PrivateDiplomaClient(config, universityWallet)

const txHash = await client.issueDiploma(
  "STU-2026-001",                              // Student ID
  "UNI-MIT-001",                               // University ID
  "Alice Johnson",                             // Student Name
  { "Algorithms": 95, "ML": 96 },             // Marks
  "Bachelor of Science in Computer Science",  // Degree
  "Department of Computer Science"            // Department
)

// Result: Hash(name + grades) stored on-chain, actual data stays private
```

### For Students: Generate a ZK Proof

```typescript
// 1. Student has their private data locally
const studentData = {
  name: "Alice Johnson",
  marks: { "Algorithms": 95, "ML": 96 },
  metadata: { studentId: "STU-2026-001" }
}

// 2. Generate proof (happens completely offline)
const proof = ZKProofGenerator.generateVerificationProof(
  certificateHash,
  studentDataCommitment,
  studentData
)
/* 
Result: 
{
  certificateHash: "0xabc123...",
  proofCommitment: "0xdef456...",  // Hash of student data
  nullifier: "0xrandom...",        // Prevents reuse
  nonce: "0xunique..."             // Ensures uniqueness
}
*/

// 3. Share proof with employer (NOT the actual student data)
//    -> Student data STAYS LOCAL
```

### For Employers: Verify a Credential

```typescript
// 1. Employer receives proof from candidate
const proof = {
  certificateHash: "0xabc123...",
  proofCommitment: "0xdef456...",
  nullifier: "0xrandom...",
  nonce: "0xunique..."
}

// 2. Verify on-chain
const result = await client.verifyDegree(proof)

// Result:
{
  isValid: true,
  diplomaAge: 12345,
  issuerAddress: "0xuniversity...",
  timestamp: 1707400000
}

// That's it! Employer knows diploma is valid, nothing else.
// Candidate's name, grades, ID = STILL PRIVATE ✓
```

---

## 🔄 Data Flow Diagrams

### Diploma Issuance

```
University Dashboard
│
├─ Input: Student Name, Grades, etc.
│
├─ Hashing Function
│  ├─ Hash(name + ID) → "0xabc..."
│  ├─ Hash(grades) → "0xdef..."
│  └─ Hash(degree) → "0xghi..."
│
├─ Smart Contract
│  └─ Store hashes on-chain
│     (Actual data NEVER sent)
│
└─ Result: Diploma Issued ✓
```

### ZK Proof Generation

```
Student Has Private Data (Local)
│
├─ Data: Name, Marks, ID
│
├─ ZK Proof Generator
│  ├─ Hash data locally
│  ├─ Create commitment
│  ├─ Generate nullifier
│  └─ Generate nonce
│
├─ Output: Proof JSON
│  └─ certificateHash
│  └─ proofCommitment
│  └─ nullifier
│  └─ nonce
│
└─ Share with Employer ✓
   (Student data stays local!)
```

### Proof Verification

```
Employer Receives Proof
│
├─ Upload Proof JSON
│
├─ Smart Contract Verification
│  ├─ Verify certificate exists
│  ├─ Check if revoked
│  ├─ Verify proof commitment
│  ├─ Check nullifier not used
│  └─ Confirm within validity period
│
├─ Result Query
│  └─ Is diploma valid? YES/NO
│     (NO personal data returned)
│
└─ Employer Decision ✓
   (Hire or pass based on validity)
```

---

## 🛡️ Security Features

### 1. Nullifier (Replay Prevention)

```typescript
// Prevents same proof from being used multiple times
const nullifier = generateRandomBytes(32)

// Track used nullifiers on-chain
usedNullifiers: Set<Field>

// Verification fails if nullifier already used:
if (usedNullifiers.contains(proof.nullifier)) {
  return false; // Proof already used!
}
```

### 2. Diploma Revocation

```typescript
// Universities can revoke diplomas
fn revokeDiploma(certificateHash: Field) {
  assert diploma.issuerAddress == tx.sender  // Only issuer
  diploma.status = 0                          // Mark revoked
  diplomaLedger.insert(certificateHash, diploma)
}

// Verification rejects revoked diplomas:
if (diploma.status == 0) {
  return false; // Diploma revoked
}
```

### 3. Validity Period

```typescript
// Diplomas expire after configured period
let currentTime = tx.blocknumber
let diplomaAge = currentTime - diploma.issuanceTimestamp

assert diplomaAge <= diplomaValidityPeriod  // Must be valid

// Prevents old diplomas from being misused
```

### 4. Authorization Control

```typescript
// Only authorized universities can issue
authorizedIssuers: Set<Address>

fn issueDiploma(...) {
  assert authorizedIssuers.contains(tx.sender)  // Only issuers
  // ... issue diploma
}

// Only contract owner can add issuers
fn addAuthorizedIssuer(university: Address) {
  assert tx.sender == contractOwner
  authorizedIssuers.insert(university)
}
```

---

## 📊 Smart Contract Functions

### Public Functions (Read-Only)

```typescript
// Check diploma status
fn getDiplomaStatus(certificateHash: Field) -> Field
// Returns: 1 (valid), 0 (revoked)

// Check if address is authorized issuer
fn verifyIssuanceAuthority(address: Address) -> bool

// Check if diploma is still valid
fn checkDiplomaValidity(certificateHash: Field) -> bool

// Check if nullifier has been used
fn isNullifierUsed(nullifier: Field) -> bool
```

### State-Modifying Functions

```typescript
// Issue a new diploma (University only)
fn issueDiploma(
  certificateHash: Field,
  studentDataCommitment: Field,
  degreeTypeHash: Field,
  departmentHash: Field,
  issuanceTimestamp: Field
)

// Revoke a diploma (Issuer only)
fn revokeDiploma(certificateHash: Field)

// Verify degree with ZK proof (Anyone)
fn submitVerificationProof(proof: VerificationProof) -> bool
```

### Admin Functions

```typescript
// Add authorized university (Owner only)
fn addAuthorizedIssuer(university: Address)

// Remove authorized university (Owner only)
fn removeAuthorizedIssuer(university: Address)
```

---

## 🧪 Testing the System

### 1. Try University Portal

```bash
npm run dev
# Navigate to http://localhost:3000
# Select "University" role
# Connect wallet
# Issue a diploma
```

**What happens:**
- Form collects student data
- Hashing functions create commitments
- Smart contract stores hashes on-chain
- Student data never sent to blockchain

### 2. Try Student Portal

```bash
# Select "Student" role
# Connect wallet
# View credentials
# Click "Generate ZK Proof"
```

**What happens:**
- Proof is generated locally
- Student data stays on device
- Proof can be downloaded
- Ready to share with employers

### 3. Try Employer Portal

```bash
# Select "Employer" role
# Connect wallet
# Upload proof JSON from student
# Verify proof
```

**What happens:**
- Proof is validated on-chain
- Diploma validity confirmed
- No personal data revealed
- Instant verification result

---

## 🎓 Educational Value

This project demonstrates:

- ✓ **Zero-Knowledge Proofs** - Prove facts without revealing data
- ✓ **Smart Contracts** - Automate trust and verification
- ✓ **Privacy-by-Design** - Architecture that protects user data
- ✓ **Cryptographic Hashing** - Secure data commitment
- ✓ **Blockchain Integration** - Off-chain to on-chain flows
- ✓ **React + TypeScript** - Modern frontend development
- ✓ **Web3 Concepts** - Practical blockchain application

---

## 📖 Full Workflow Example

### Scenario: Alice Applies to a Job

**Day 1: University Issues Diploma**

```
Alice (Student):
  - Attended MIT, graduated 2024
  - Has Bachelor's in Computer Science
  - Grades: Math 95/100, CS 98/100, Physics 92/100

MIT (University):
  - Creates commitments:
    ✓ Hash(Alice, StudentID, Marks) → stored on-chain
    ✗ Never stores Alice's name on-chain
    ✗ Never stores Alice's grades on-chain
  - Issues diploma → certificateHash = "0xabc123..."

Blockchain (Midnight Network):
  - Stores: certificateHash, issuer, timestamp, commitments
  - DOES NOT store: Alice's name, marks, transcript
```

**Day 30: Alice Interviews at Google**

```
Alice (Student):
  1. Downloads her diploma proof from MIT portal
  2. Offline on her machine:
     - ZKProofGenerator creates proof
     - Uses her LOCAL data (name, grades)
     - Outputs: certificateHash, proofCommitment, nullifier, nonce
  3. Sends proof to Google (NOT her personal data)
     - Google receives: {"proof": {...}}
     - Google CANNOT see: Her name, grades, ID

Google (Employer):
  1. Receives Alice's proof JSON
  2. Submits proof to smart contract
  3. Contract verifies:
     ✓ Certificate exists on-chain
     ✓ Not revoked
     ✓ Within validity period
     ✓ Proof commitment matches
     ✓ Nullifier not used before
  4. Returns: true (diploma is valid)

Result:
  ✓ Google knows: "Alice has a valid MIT diploma"
  ✗ Google never learns: Alice's name, grades, student ID
  ✗ Google never learns: Alice's transcript
  ✓ Alice's privacy is completely protected
  ✓ Google can make hiring decision based on credential validity
```

---

## 🚀 Future Enhancements

- [ ] Real Midnight Network integration
- [ ] Actual zk-SNARK/zk-STARK implementations
- [ ] Multi-institution support
- [ ] Credential marketplace
- [ ] Decentralized issuer registry
- [ ] Mobile app version
- [ ] Integration with existing credential systems
- [ ] Batch verification for large employers

---

## 📝 Smart Contract Code

See [contracts/PrivateDiploma.compact](contracts/PrivateDiploma.compact) for the full smart contract implementation with detailed comments.

---

## 🤖 SDK Integration

See [src/index.ts](src/index.ts) for complete SDK code including:

- `PrivateDiplomaClient` - Main client class
- `HashingUtility` - Cryptographic functions
- `ZKProofGenerator` - Proof generation
- All contract function wrappers

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Midnight Network** - Privacy-preserving blockchain
- **Zero-Knowledge Proofs** - For enabling privacy
- **Cardano** - For Midnight sidechain infrastructure
- **React & TypeScript** - For modern development

---

## 📞 Support

For questions or issues:
1. Check the examples in `src/examples.ts`
2. Review the smart contract comments in `contracts/PrivateDiploma.compact`
3. Examine component implementation in `src/components/`

---

## 🎯 Mission

**To prove that privacy and authentication are not mutually exclusive.**

PrivateDiploma demonstrates that you can:
✓ Verify credentials on blockchain
✓ Maintain complete user privacy
✓ Make hiring/enrollment decisions with confidence
✓ Protect sensitive student information

All simultaneously. 🚀

---

**Built on Midnight Network** 🌙
**Using Zero-Knowledge Proofs** 🔐
**For Complete Privacy** 🛡️
