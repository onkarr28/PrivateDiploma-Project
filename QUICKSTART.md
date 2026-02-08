# 🚀 Quick Start Guide

## 30 Seconds to Running

### Windows Users

1. Double-click `setup.bat`
2. Wait for "Setup Complete!"
3. Type: `npm run dev`
4. App opens automatically

### Mac/Linux Users

```bash
bash setup.sh
npm run dev
```

---

## 🎯 What You'll See

### Landing Page
- Choose your role: 🎓 University | 👨‍🎓 Student | 🏢 Employer
- Auto-connects with mock wallet

### University Dashboard
- **Issue Diploma**: Enter student info → hashed and stored
- **Diploma List**: All issued credentials
- **Revoke Option**: Can revoke if needed

### Student Dashboard  
- **View Credentials**: All diplomas
- **Generate ZK Proof**: One-click proof generation
- **Download**: Save proof as JSON

### Employer Verification
- **Upload Proof**: Drag & drop JSON
- **Auto Verify**: Checks on mock blockchain
- **See Results**: Valid or Invalid ✓

---

## 🔐 Privacy Demo

### Follow This Flow

```
1. University Issues Diploma
   └─ Enter: "Alice", grades, ID
   └─ Stores: Hash(Alice), Hash(grades), Hash(ID)
   └─ Alice's data NEVER on blockchain ✓

2. Student Generates Proof
   └─ Uses local Alice data
   └─ Creates cryptographic proof
   └─ Downloads proof.json
   └─ Data still LOCAL, never sent ✓

3. Employer Verifies
   └─ Gets proof.json from Alice
   └─ Submits to blockchain
   └─ Learns: "Valid diploma" ✓
   └─ Learns NOTHING else: No name, grades, ID ✓
```

---

## ⚙️ System Details

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Blockchain**: Mock (Midnight Network ready)
- **Icons**: Lucide React

### Key Files
```
src/
├── pages/          → 4 main pages
├── components/     → 6 reusable components  
├── utils/          → Mock blockchain
├── styles/         → Tailwind + custom CSS
└── index.ts        → SDK integration
```

### Smart Contract
```
contracts/
└── PrivateDiploma.compact
    ├── Issue diplomas
    ├── Verify proofs
    ├── Revoke creds
    └── Track hashes
```

---

## 🧪 Try These Features

### 1️⃣ Issue a Diploma (2 min)
```
1. Go to: http://localhost:3000
2. Select: "University" role
3. Click: "Connect Wallet"
4. Form appears, fill:
   - Student ID: STU-2026-001
   - Student Name: John Doe
   - Degree: Bachelor of Science...
   - Department: Computer Science
5. Click: "Issue Diploma"
6. See: Diploma added to list ✓
```

**What Happened?**
- Student name/grades were hashed
- Hash (not actual data) stored on mock blockchain
- Certificate hash created
- Diploma marked as valid

---

### 2️⃣ Generate ZK Proof (2 min)
```
1. Select: "Student" role
2. Connect Wallet
3. See: Your credentials
4. Click on a credential
5. Click: "Generate ZK Proof"
6. Click: "Generate Proof Locally"
7. Wait: 2 seconds...
8. See: Proof generated! ✓
```

**What Happened?**
- Student data hashed locally (not sent anywhere)
- Proof created on your machine
- Proof ready to share with employers
- Student data stays private ✓

---

### 3️⃣ Verify Credential (90 sec)
```
1. Go back to Student tab
2. Download the proof JSON
3. Select: "Employer" role
4. Upload proof.json
5. Click: "Verify on blockchain"
6. Wait: 2 seconds...
7. See: "✓ Diploma Verified" ✓
```

**What Happened?**
- Employer uploaded proof (not student data)
- Smart contract validated proof
- Diploma confirmed as valid
- Employer knows NOTHING about student except validity ✓

---

## 📊 Data Privacy Visualization

### What Gets Stored

**On Blockchain (PUBLIC):**
```
certificateHash: 0xabc123...def456
issuerAddress: 0x university123...
issuanceDate: 2026-02-08
status: valid (1)
studentDataCommitment: 0xhash (NOT actual data!)
degreeTypeHash: 0xhash
```

**On Student's Device (PRIVATE):**
```
name: "John Doe"
grades: { Math: 95, CS: 98, ... }
studentID: "STU-2026-001"
```

**Shared with Employer (MINIMAL):**
```
certificateHash: 0xabc123...def456
proofCommitment: 0xdefg789...hij456
nullifier: 0xrandom123...
nonce: 0xunique456...

(That's it! Just the proof, nothing else)
```

---

## ❓ FAQ

### Q: Where's my data stored?
**A:** On your computer. The UI runs locally in your browser. The blockchain gets only hashes.

### Q: Can employers see my grades?
**A:** No. They only see: "This diploma is valid" ✓

### Q: Can universities see what I prove to employers?
**A:** No. The proof is between you and the verifier. University sees only hashes.

### Q: What if I need to revoke?
**A:** University can mark diploma as revoked. Verification will fail. Cannot be used again.

### Q: Is this blockchain?
**A:** Yes! For demo, we use mock blockchain. Production uses Midnight Network (Cardano sidechain).

---

## 🔧 Troubleshooting

### Port 3000 already in use?
```bash
# Use different port
npm run dev -- --port 3001
```

### Dependencies installation fails?
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

### Crypto errors in console?
These are normal warnings about using crypto-js in browser context. The app still works fine - we use native `crypto.subtle.digest()` for hashing.

---

## 📚 Learn More

### Full Documentation
- [README.md](../README.md) - Complete feature docs
- [Smart Contract](../contracts/PrivateDiploma.compact) - Full contract code
- [SDK Integration](../src/index.ts) - TypeScript SDK

### Examples
```bash
# Run usage examples
npm run examples
```

---

## 🎓 Educational Concepts Demonstrated

✓ Zero-Knowledge Proofs  
✓ Cryptographic Hashing  
✓ Privacy-by-Design  
✓ Smart Contracts  
✓ Blockchain Integration  
✓ React + TypeScript  
✓ Web3 Concepts  

---

## 🚀 Next Steps

### For Learning
1. Read the smart contract comments
2. Study the ZK proof generation
3. Understand the hashing flow

### For Development  
1. Integrate real Midnight Network
2. Replace mock blockchain
3. Add real wallet connection
4. Deploy contract

### For Production
1. Use actual Midnight Network
2. Real cryptographic proofs
3. Proper security audits
4. Decentralized storage

---

## 📞 Support

### Having Issues?
1. Check console (F12) for errors
2. Verify Node.js/npm versions
3. Try clearing browser cache
4. Restart dev server: `npm run dev`

### Want to Understand Better?
1. Read the code comments
2. Check the examples
3. Review the README
4. Explore components step-by-step

---

## ✨ That's It!

You now have a fully functional privacy-preserving diploma verification system!

```
Concepts Learned:
✓ Zero-Knowledge Proofs
✓ Cryptographic Hashing  
✓ Privacy Architecture
✓ Smart Contracts
✓ Full-Stack Blockchain App

Skills Demonstrated:
✓ React Development
✓ TypeScript
✓ Web Cryptography
✓ UI/UX Design
✓ System Architecture
```

---

**Happy Building! 🚀**

Questions? Check README.md or examine the code carefully - it's heavily commented!
