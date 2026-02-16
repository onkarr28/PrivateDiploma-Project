# PrivateDiploma 🎓

Privacy-preserving diploma issuance and verification on the Midnight Network using zero-knowledge proofs.

![Banner](https://img.shields.io/badge/Blockchain-Midnight%20Network-blueviolet)
![Status](https://img.shields.io/badge/Status-Beta-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Project Description

PrivateDiploma allows universities to issue digital diplomas and lets students prove to employers that a degree is valid **without revealing any personal data**.

Roles supported:
- **University (Issuer)** – issues and, if needed, revokes diplomas
- **Student (Prover)** – holds private data and generates ZK proofs
- **Employer (Verifier)** – verifies proofs on-chain without seeing raw data

Key properties:
- Only **hashes and commitments** are stored on-chain
- Student name, grades, transcript and ID remain **fully off-chain**
- Verification is a simple **true/false** answer: “Is this diploma valid?”

---

## Project Vision

The vision of PrivateDiploma is to become a privacy-first credential layer for universities, students, and employers on the Midnight Network. Instead of exposing full transcripts or personal details, the system proves only what is necessary: **that a valid diploma exists** and was issued by a legitimate university. Long term, the same pattern can be extended to transcripts, professional certificates, and compliance records while keeping identities and grades fully private.

---

## Demo Video

For a complete end-to-end walkthrough of the PrivateDiploma experience (University → Student → Employer), watch the demo video:

- Full project demo: https://drive.google.com/file/d/1-bNr3W2WkwqQMbzULrA5XJxLu19Nb4qB/view?usp=sharing

---

## Deployment Details (Contract)

- **Contract name:** `PrivateDiploma`
- **Contract source:** `contracts/PrivateDiploma.compact`
- **Deployed contract address (testnet/local):**

  `contract_81aac1479224e8896ff26cf220354553e382701d`

- **Network:** Midnight testnet/local (`VITE_NETWORK_ID=0`)
- **RPC:** `http://localhost:9944`

Environment variables:

```bash
VITE_CONTRACT_ADDRESS=contract_81aac1479224e8896ff26cf220354553e382701d
VITE_MIDNIGHT_RPC_URL=http://localhost:9944
VITE_RPC_URL=http://localhost:9944
VITE_NETWORK_ID=0
VITE_ENABLE_BLOCKCHAIN=true
```

---

## Architecture

### High-Level Flow

1. **University** issues a diploma → contract stores only hashed commitments
2. **Student** keeps real data locally and generates a zero-knowledge proof
3. **Employer** submits the proof to the contract → gets `valid / invalid`

```text
University ── issues ──▶ PrivateDiploma Contract ◀─ verifies ── Employer
           (hashes)          (hashes + proofs)        (proof JSON)
                       ▲
                       │
                   Student
                 (local data
                 → ZK proof)
```

### Tech Stack

| Layer        | Technology                                   |
|-------------|-----------------------------------------------|
| Blockchain  | Midnight Network (testnet/local)              |
| Contracts   | Compact language (`PrivateDiploma.compact`)   |
| Frontend    | React 18, TypeScript, Vite                    |
| Styling     | Tailwind CSS                                  |
| Crypto/ZK   | SHA-256 style hashing, proof-style workflow   |

---

## Smart Contract (Conceptual)

On-chain record (conceptual):

```text
DiplomaRecord {
  certificateHash         // hash of (universityId + studentId + timestamp)
  issuerAddress           // university address
  issuanceTimestamp       // when diploma was issued
  status                  // 1 = valid, 0 = revoked
  studentDataCommitment   // commitment to (name + grades + metadata)
  degreeTypeHash          // hash of degree type
  departmentHash          // hash of department
}
```

Main behaviours:
- **issueDiploma** – issuer stores a new `DiplomaRecord`
- **revokeDiploma** – issuer marks a diploma as revoked
- **submitVerificationProof** – verifies a proof and records a nullifier
- **checkDiplomaValidity** – read-only validity check

Only **commitments and hashes** are stored; raw student data never touches the chain.

---

## Privacy Model

**On-chain (public):**
- Hashes of identifiers and grades
- Issuer address
- Timestamps and status flags
- Nullifiers (to prevent proof reuse)

**Off-chain (private):**
- Student name and ID
- Detailed marks and transcript
- Any additional personal information

Verification guarantees:
- If a proof passes, the employer only learns: “A valid diploma exists for this anonymous commitment issued by this university.”
- They **never** see the underlying identity or marks.

---

## Project Structure

```text
midnight project/
├── contracts/
│   └── PrivateDiploma.compact         # Compact smart contract
├── frontend/
│   └── src/
│   ├── pages/
│   │   ├── Landing.tsx                # Role selection & overview
│   │   ├── UniversityDashboard.tsx    # Issuance flows
│   │   ├── StudentDashboard.tsx       # Credential view + proof generation
│   │   └── EmployerVerification.tsx   # Proof verification UI
│   ├── components/
│   │   ├── WalletConnector.tsx
│   │   ├── DiplomaIssuanceForm.tsx
│   │   ├── DiplomaList.tsx
│   │   ├── StudentCredentialCard.tsx
│   │   └── ZKProofGenerator.tsx
│   ├── utils/
│   │   ├── MidnightProvider.tsx       # App-wide Midnight context
│   │   ├── MidnightNetworkService.ts  # Local ledger + cryptography
│   │   ├── midnightWallet.ts          # Wallet + Local Ledger Provider
│   │   └── transactionManager.ts      # Transaction lifecycle helpers
│   ├── App.tsx                        # Root React app
│   └── main.tsx                       # Vite entrypoint
├── contracts/PrivateDiploma.compact   # Contract source
├── Dockerfile                         # Production image
├── docker-compose.yml                 # Containerized deployment
├── nginx.conf                         # Nginx config for static hosting
├── package.json
└── vite.config.ts
```

---

## Installation & Setup Guide

### Prerequisites

- Node.js 18+
- npm 9+
- Modern Chromium-based browser

### Install & Run (Dev)

```bash
git clone https://github.com/onkarr28/Midnight-RiseIn.git
cd "midnight project"
npm install

# Start dev server (Vite)
npm run dev
```

The app will start on the first free HTTPS port (typically `https://localhost:3000` or `https://localhost:3003`).

### Build

```bash
npm run build    # Type-check + production build
npm run preview  # Preview production bundle
```

### Run with Docker (Prod-like)

```bash
cd "midnight project"

# Optional: override from environment
set CONTRACT_ADDRESS=contract_81aac1479224e8896ff26cf220354553e382701d
set ENABLE_BLOCKCHAIN=false

docker compose up -d --build
# App available at: http://localhost:3003
```

---

## Wallet Integration

The frontend is designed to work with either:

1. **Lace Midnight / Midnight wallet extension** – when installed
2. **Local Ledger Provider** – automatic fallback when no extension is found

Behaviour:
- Tries to detect `window.midnight.mnLace` / Cardano wallets
- If none are available, it uses a **Local Ledger Provider** that:
  - Simulates a 2‑second encrypted handshake
  - Generates a realistic Midnight-style address
  - Persists the session in `localStorage`

From the UI’s perspective, both paths expose:
- Connected address
- Network (testnet/local)
- Ability to sign and submit diploma “transactions” through the app flows

---

## App Flows

### University

- Connect wallet / Local Ledger Provider
- Fill in student + degree fields
- Submit diploma
- UI shows:
  - Transaction hash
  - Block number–style value
  - Confirmation status

### Student

- See all issued diplomas linked to the connected address
- Generate a proof object for a selected diploma
- Download / copy proof JSON for sharing

### Employer

- Paste or upload proof JSON from the candidate
- Submit for verification
- Get a **yes/no** answer and basic metadata (issuer, age) – no private fields

---

## UI Screenshots & Walkthrough

- **Landing Page** – role selection for University, Student, Employer with Midnight-branded hero section.
- **University Dashboard** – issuance form, issued diploma list, transaction progress and hashes.
- **Student Dashboard** – “My Credentials” list, selected credential details, and “Generate ZK Proof” flow.
- **Employer Verification** – proof upload/paste area, verification result card, and certificate hash details.

For a full animated walkthrough of all screens, see the [Demo Video](#demo-video) section.

---

## Limitations & Caveats

- The DApp currently runs against a **local/testnet-style environment**; full mainnet deployment would require:
  - Live Midnight node / indexer / proof server
  - Real Midnight SDK and provider wiring
- Cryptographic primitives follow the Midnight style but are intentionally simplified for this submission.
- Local Ledger Provider is a high‑fidelity local ledger simulation, not a custodial wallet.

These constraints are identical in spirit to the Echo reference project: front‑end and contract design are production‑grade; on‑chain connectivity can be swapped in when full public SDK and infrastructure are available.

---

## Future Scope

- **Full Midnight SDK Integration** – replace the Local Ledger Provider with live Midnight nodes and deployed contracts on public testnet/mainnet.
- **Extended Credential Types** – support transcripts, micro-credentials, and professional certificates using the same ZK pattern.
- **Revocation & Governance UI** – richer views for revocation history, multi-signer university governance, and audit logs.
- **Multi-chain Bridges** – explore bridging verified Midnight diplomas into other ecosystems (e.g., Cardano) as verifiable credentials.
- **Employer APIs** – add REST/GraphQL endpoints so HR systems can verify proofs automatically without using the UI.

---

## License

MIT – see repository for license details.

---

## Credits

- Midnight Network and Compact language documentation
- Echo reference DApp for network/provider architecture patterns


**Built on Midnight Network** 🌙
**Using Zero-Knowledge Proofs** 🔐
**For Complete Privacy** 🛡️
