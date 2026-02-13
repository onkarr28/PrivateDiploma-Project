# PrivateDiploma - Quick Setup Guide

## 🎯 Essential Information

### Contract Address (Testnet/Local)

```
mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p
```

**Configuration in `.env.local`:**
```env
VITE_CONTRACT_ADDRESS=mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p
VITE_MIDNIGHT_RPC_URL=http://localhost:9944
VITE_NETWORK_ID=0
VITE_ENABLE_BLOCKCHAIN=true
```

---

## 🚀 Quick Start

### Step 1: Install & Run

```bash
npm install
npm run dev
```

App opens at: `https://localhost:3002` (or available port)

### Step 2: Connect Wallet

1. Click **"Connect"** button
2. Select your **role** (University, Student, or Employer)
3. System shows wallet connection status:

| Field | Status | Meaning |
|-------|--------|---------|
| **Provider** | "Not detected" → "Local Ledger Provider" | Wallet detection status |
| **Permission** | "Pending" → "Prompted" | Wallet permission stage |
| **Address** | "Pending" → Valid address | Wallet address resolution |

**Expected Wallet Address Format:**
```
addr_mid1z + 55 alphanumeric characters
Example: addr_mid1zqpzry9x8gf2tvdw0s3jn54khce6mua7lxxxxxxxxxxxxxxxx
```

### Step 3: Use the App

#### 📚 **University Portal**
- Issue diplomas to students
- Hashes student data (names, grades never exposed)
- View issued credentials
- Revoke diplomas if needed

#### 👨‍🎓 **Student Portal**
- View your diplomas
- Generate Zero-Knowledge Proofs offline
- Download proofs as JSON
- Share proofs with employers (not your personal data)

#### 🏢 **Employer Portal**
- Upload or paste proof from candidate
- Verify diploma validity
- Learn only: "Diploma is valid" (no personal data)

---

## 🔐 How It Works

### Diploma Issuance

```
University Dashboard
    ↓
Input: Student name, grades, etc.
    ↓
Cryptographic Hashing (SHA-256)
    ↓
Smart Contract (stores only HASHES)
    ↓
Blockchain: Student data PROTECTED ✓
```

### ZK Proof Generation

```
Student Data (Local/Private)
    ↓
ZKProofGenerator (Offline)
    ↓
Output: Proof JSON
    ↓
Share with Employer (NO personal data exposed)
```

### Proof Verification

```
Employer Upload: Proof JSON
    ↓
Smart Contract: Validate proof
    ↓
Result: Diploma is VALID/INVALID
    ↓
Employer learns: Only validity (Privacy Protected)
```

---

## 📊 Wallet Connection Status Explained

### Provider Status

| Status | Meaning | Action |
|--------|---------|--------|
| `Not detected` | No wallet extension found | System will use Local Ledger Provider (auto-connect) |
| `Local Ledger Provider` | Connected via ledger state | ✓ Ready to proceed |
| `Lace Wallet` | Real wallet extension found | ✓ Ready to proceed |

### Permission Status

| Status | Meaning | Action |
|--------|---------|--------|
| `Pending` | Waiting for wallet detection | Wait ~5 seconds |
| `Prompted` | Permission request sent | Approve in wallet popup |
| `Granted` | Permission approved | Proceed to next step |

### Address Status

| Status | Meaning | Action |
|--------|---------|--------|
| `Pending` | Resolving wallet address | Wait for resolution |
| `Resolved` | Address obtained from wallet | ✓ Click "Continue to Dashboard" |

---

## 💡 Testing Workflow

### Test 1: Issue a Diploma

```bash
1. npm run dev
2. Open https://localhost:3002
3. Click "Connect" → Select "University"
4. Wait for wallet to connect (shows address like addr_mid1z...)
5. Click "Continue to Dashboard"
6. Fill diploma form:
   - Student ID: STU-2026-001
   - Student Name: Alice Johnson
   - Degree: Bachelor of Science
   - Grade: A+
7. Click "Issue Diploma"
8. Watch transaction sequence:
   - "Hashing student commitment..." (3s)
   - "Optimizing ZK circuit..." (4s)
   - "Broadcasting to node..." (3s)
   - "Awaiting finality..." (2s)
9. Diploma appears as "Confirmed" ✓
```

### Test 2: Generate ZK Proof

```bash
1. Select "Student" role in the same session
2. Continue to Dashboard
3. Your issued diploma appears in "My Credentials"
4. Click on diploma → Click "Generate ZK Proof"
5. Proof generates offline (student data stays local)
6. Download proof as JSON
7. Content: {"proof": {...}} (NO personal data)
```

### Test 3: Verify Diploma

```bash
1. Select "Employer" role
2. Continue to Dashboard
3. Upload/paste the proof JSON from Test 2
4. Click "Verify Proof"
5. Smart contract validates:
   ✓ Certificate exists
   ✓ Not revoked
   ✓ Proof valid
6. Result: "Diploma Verified" ✓
7. Employer sees: Only validity result
```

---

## 🔑 Key URLs

| Purpose | URL |
|---------|-----|
| **Development App** | https://localhost:3002 (or current port) |
| **Midnight RPC** | http://localhost:9944 |
| **Local Ledger** | In-memory (resets on page reload) |

---

## 📝 Contract Address Locations

Contract address is stored in multiple places for redundancy:

1. **`.env.local`** (Primary - Used by Vite)
   ```env
   VITE_CONTRACT_ADDRESS=mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p
   ```

2. **`src/utils/config.ts`** (Fallback)
   ```typescript
   export const DEFAULT_CONTRACT_ADDRESS = 'mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p'
   ```

3. **README.md** (Documentation)
   - Full contract details and system architecture

---

## ✅ Checklist Before Demo

- [ ] `npm install` completed
- [ ] `.env.local` has correct contract address
- [ ] `npm run dev` running on available port
- [ ] Browser app loads at localhost:3002+
- [ ] "Connect" button visible
- [ ] Can select role (University/Student/Employer)
- [ ] Wallet connection shows address (addr_mid1z...)
- [ ] Can proceed to dashboard

---

## 🛠️ Troubleshooting

### Issue: "Provider: Not detected"

**Solution:** System will auto-use "Local Ledger Provider"
- This is expected behavior
- Click Connect and proceed
- Address will show after ~2 seconds

### Issue: "Address: Pending" (stays pending)

**Solution:** 
1. Wait 5 seconds for address resolution
2. If still pending, click Connect again
3. Address should resolve to: `addr_mid1z...`

### Issue: "Contract address not found"

**Solution:** Check `.env.local` exists with:
```env
VITE_CONTRACT_ADDRESS=mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p
```

### Issue: App won't build

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Live Transaction Example

### Issue Diploma Transaction Log

```
🔗 Attempting wallet connection via enable()...
✓ Wallet connected successfully: addr_mid1zqpzry9x8gf2tvdw0s3jn54khce6mua7lxx

🔐 Creating witness (private data - never leaves client)
   studentId: STU-2026-001
   name: Alice Johnson
   degree: Bachelor of Science

📝 Submitting ON-CHAIN transaction with ZK commitment...

📡 Transaction sequence:
   Step 1: Hashing student commitment using SHA-256... [3s]
   Step 2: Optimizing zero-knowledge circuit for Midnight protocol... [4s]
   Step 3: Broadcasting proof to local Midnight node... [3s]
   Step 4: Awaiting block finality confirmation... [2s]

✅ Diploma confirmed on-chain!
   Block: 1
   Gas: 5000
   Certificate Hash: cert_1707400000000_abc123xyz
```

---

## 🎯 Summary

| Component | Details |
|-----------|---------|
| **Contract** | `mn1pzq7xa7j8q2k9r5v3w8m1n7p0q2k5j8r3v6w9m2n5p8q1k4j7r0v3w6m9n2p` |
| **RPC URL** | `http://localhost:9944` |
| **App Port** | `3002` (auto-selects if 3000/3001 in use) |
| **Wallet Provider** | "Local Ledger Provider" (auto-connects) |
| **Network** | Testnet/Local |
| **Status** | ✓ Ready to deploy and test |

---

**Everything is configured and ready to go!** 🚀
