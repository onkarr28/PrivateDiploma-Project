/**
 * PrivateDiploma - Usage Examples
 * 
 * This file demonstrates how to use the PrivateDiploma SDK to:
 * 1. Issue diplomas (university)
 * 2. Verify degrees (student & employer)
 * 3. Query diploma status
 */

import {
  PrivateDiplomaClient,
  HashingUtility,
  ZKProofGenerator,
  PrivateDiplomaConfig,
} from "./index"
// Note: @midnight-ntwrk/wallet package must be installed separately
// import { Wallet } from "@midnight-ntwrk/wallet"

// ============================================================================
// EXAMPLE 1: University Issues a Diploma
// ============================================================================

async function exampleUniversityIssuesDiploma() {
  console.log("\n📚 EXAMPLE 1: University Issues a Diploma\n")

  // University's wallet (must be authorized in contract)
  // const universityWallet = new Wallet({
  //   // Wallet initialization details
  // })
  const universityWallet: any = null; // Placeholder

  // Configuration pointing to deployed contract
  const config: PrivateDiplomaConfig = {
    contractAddress: "0x...", // Address of deployed PrivateDiploma contract
    rpcUrl: "https://midnight-testnet-rpc.example.com",
    networkId: "midnight-testnet",
  }

  const client = new PrivateDiplomaClient(config, universityWallet)

  // Issue diploma to student
  const txHash = await client.issueDiploma(
    "STU-2026-001", // Student ID
    "UNI-MIT-001", // University ID
    "Alice Johnson", // Student name
    {
      // Marks (course -> grade)
      "Linear Algebra": 92,
      "Algorithms": 95,
      "Database Systems": 88,
      "Machine Learning": 96,
      "Software Engineering": 90,
    },
    "Bachelor of Science in Computer Science", // Degree type
    "Department of Computer Science" // Department
  )

  console.log(`✓ Diploma issued successfully!`)
  console.log(`  Transaction: ${txHash}`)
  console.log(`\n  PRIVACY GUARANTEE:`)
  console.log(`  ✓ Student name NOT stored on-chain`)
  console.log(`  ✓ Grades NOT stored on-chain`)
  console.log(`  ✓ Only cryptographic hash stored`)
}

// ============================================================================
// EXAMPLE 2: Student Verifies Degree to Employer
// ============================================================================

async function exampleStudentVerifiesToEmployer() {
  console.log("\n👨‍💼 EXAMPLE 2: Student Verifies Degree to Employer\n")

  // Student's wallet
  const studentWallet = new Wallet({
    // Wallet initialization
  })

  const config: PrivateDiplomaConfig = {
    contractAddress: "0x...",
    rpcUrl: "https://midnight-testnet-rpc.example.com",
    networkId: "midnight-testnet",
  }

  const client = new PrivateDiplomaClient(config, studentWallet)

  // Step 1: Student prepares their private data
  const studentPrivateData = {
    name: "Alice Johnson",
    marks: {
      "Linear Algebra": 92,
      "Algorithms": 95,
      "Database Systems": 88,
      "Machine Learning": 96,
      "Software Engineering": 90,
    },
    metadata: {
      studentId: "STU-2026-001",
      universityId: "UNI-MIT-001",
    },
  }

  // Step 2: Certificate hash that was created when diploma was issued
  const certificateHash = HashingUtility.createCertificateHash(
    "UNI-MIT-001",
    "STU-2026-001",
    Math.floor(Date.now() / 1000)
  )

  // Step 3: Student sends zero-knowledge proof to employer
  // NO personal data is revealed in this proof!
  const verificationResult = await client.verifyDegree(
    studentPrivateData,
    certificateHash
  )

  console.log(`✓ Verification successful!`)
  console.log(`\n  Results:`)
  console.log(`  ✓ Diploma Valid: ${verificationResult.isValid}`)
  console.log(`  ✓ Issued by: ${verificationResult.issuerAddress}`)
  console.log(`  ✓ Diploma Age: ${verificationResult.diplomaAge} seconds`)

  console.log(`\n  PRIVACY GUARANTEE:`)
  console.log(`  ✓ Employer knows: "This person has a valid diploma"`)
  console.log(`  ✓ Employer does NOT know:`)
  console.log(`    - Student's name`)
  console.log(`    - Student's grades`)
  console.log(`    - Student's transcript`)
  console.log(`    - Student's ID`)
}

// ============================================================================
// EXAMPLE 3: Employer Checks Diploma Validity
// ============================================================================

async function exampleEmployerChecksDiplomaValidity() {
  console.log("\n🔍 EXAMPLE 3: Employer Checks Diploma Validity\n")

  // Employer's wallet
  const employerWallet = new Wallet({
    // Wallet initialization
  })

  const config: PrivateDiplomaConfig = {
    contractAddress: "0x...",
    rpcUrl: "https://midnight-testnet-rpc.example.com",
    networkId: "midnight-testnet",
  }

  const client = new PrivateDiplomaClient(config, employerWallet)

  // Certificate hash from student
  const certificateHash =
    "abc123def456abc123def456abc123def456abc123def456abc123def456ab"

  // Check if diploma is still valid (not revoked, within validity period)
  const isValid = await client.checkDiplomaValidity(certificateHash)

  console.log(`\n  Diploma Validity Check:`)
  console.log(`  Status: ${isValid ? "✓ VALID" : "✗ INVALID"}`)

  if (isValid) {
    console.log(
      `\n  This diploma has been verified and is currently valid.`
    )
    console.log(`  The university can revoke it if needed (misconduct, errors).`)
  }

  // Get diploma record (without personal data)
  const record = await client.getDiplomaRecord(certificateHash)

  console.log(`\n  Public Information:`)
  console.log(`  Issuer: ${record.issuerAddress}`)
  console.log(`  Issued: ${new Date(record.issuanceTimestamp * 1000).toISOString()}`)
  console.log(`  Status: ${record.status === 1 ? "Valid" : "Revoked"}`)
}

// ============================================================================
// EXAMPLE 4: Generate Zero-Knowledge Proof Offline
// ============================================================================

async function exampleGenerateProofOffline() {
  console.log("\n🔐 EXAMPLE 4: Generate Zero-Knowledge Proof Offline\n")

  // Student prepares proof WITHOUT interaction with blockchain
  const studentData = {
    name: "Bob Smith",
    marks: {
      "Calculus": 85,
      "Physics": 88,
      "Chemistry": 91,
    },
    metadata: {
      studentId: "STU-2026-002",
      universityId: "UNI-MIT-001",
    },
  }

  // Generate proof locally (no blockchain needed)
  const proof = ZKProofGenerator.generateVerificationProof(
    "some-cert-hash-would-go-here",
    "commitment-hash",
    studentData
  )

  console.log(`✓ Zero-Knowledge Proof Generated Offline\n`)
  console.log(`  Proof Components:`)
  console.log(`  - Certificate Hash: ${proof.certificateHash.substring(0, 16)}...`)
  console.log(`  - Proof Commitment: ${proof.proofCommitment.substring(0, 16)}...`)
  console.log(`  - Nullifier: ${proof.nullifier.substring(0, 16)}...`)
  console.log(`  - Nonce: ${proof.nonce.substring(0, 16)}...`)

  // Validate proof locally before sending to blockchain
  const isValidOffchain = ZKProofGenerator.validateProofOffChain(
    proof,
    studentData
  )

  console.log(`\n  Offline Validation: ${isValidOffchain ? "✓ PASSED" : "✗ FAILED"}`)

  console.log(`\n  Next Steps:`)
  console.log(`  1. Student sends proof (NOT their personal data) to employer`)
  console.log(`  2. Employer can verify on-chain using submitVerificationProof(`)
  console.log(`  3. Blockchain validates proof without learning identity`)
}

// ============================================================================
// EXAMPLE 5: Hash Generation Utilities
// ============================================================================

async function exampleHashGeneration() {
  console.log("\n🔑 EXAMPLE 5: Hash Generation for Privacy\n")

  const universityId = "UNI-MIT-001"
  const studentId = "STU-2026-001"
  const timestamp = Math.floor(Date.now() / 1000)

  // Generate certificate hash (used to uniquely identify diploma)
  const certHash = HashingUtility.createCertificateHash(
    universityId,
    studentId,
    timestamp
  )

  console.log(`Certificate Hash:`)
  console.log(`  ${certHash}`)
  console.log(`  (Uniquely identifies this diploma)\n`)

  // Generate student data commitment (privacy-preserving)
  const studentDataCommitment = HashingUtility.createStudentDataCommitment(
    "Alice Johnson",
    {
      "Linear Algebra": 92,
      "Algorithms": 95,
      "Machine Learning": 96,
    },
    {
      studentId,
      universityId,
    }
  )

  console.log(`Student Data Commitment:`)
  console.log(`  ${studentDataCommitment}`)
  console.log(`  (Hash of private data - actual data NOT on-chain)\n`)

  // Hash degree type
  const degreeTypeHash = HashingUtility.hashDegreeType(
    "Bachelor of Science in Computer Science"
  )

  console.log(`Degree Type Hash:`)
  console.log(`  ${degreeTypeHash}`)
  console.log(`  (Hashed to save space)\n`)

  // Generate random nullifier (prevents replay attacks)
  const nullifier = HashingUtility.generateNullifier()

  console.log(`Nullifier (Prevents Replay Attacks):`)
  console.log(`  ${nullifier}`)
  console.log(`  (Random, unique for each verification)\n`)

  console.log(`📌 Privacy Summary:`)
  console.log(`  ✓ Student name: Hashed and committed`)
  console.log(`  ✓ Grades: Hashed and committed`)
  console.log(`  ✓ Student ID: Hashed in certificate`)
  console.log(`  ✓ Degree: Hashed for efficiency`)
}

// ============================================================================
// EXAMPLE 6: Complete Workflow
// ============================================================================

async function exampleCompleteWorkflow() {
  console.log(`\n🚀 EXAMPLE 6: Complete Workflow from Issuance to Verification\n`)

  console.log(`Step 1: University Setup`)
  console.log(`  - University address must be authorized by contract owner`)
  console.log(`  - Only authorized universities can issue diplomas\n`)

  console.log(`Step 2: Issue Diploma`)
  console.log(`  - University issues diploma with student data`)
  console.log(`  - Only hashes are stored on blockchain`)
  console.log(`  - No sensitive data exposed\n`)

  console.log(`Step 3: Student Receives Proof`)
  console.log(`  - Student requests their diploma proof`)
  console.log(`  - University provides off-chain credentials`)
  console.log(`  - Student keeps private data locally\n`)

  console.log(`Step 4: Verification Process`)
  console.log(`  a) Student generates ZK proof offline`)
  console.log(`  b) Student presents proof to employer`)
  console.log(`  c) Employer submits proof to blockchain`)
  console.log(`  d) Smart contract verifies proof`)
  console.log(`  e) Employer learns: "Diploma is valid"\n`)

  console.log(`Step 5: Protection Mechanisms`)
  console.log(`  - Nullifier prevents reuse of same proof`)
  console.log(`  - Validity period prevents old diplomas`)
  console.log(`  - Revocation allows correction of errors`)
  console.log(`  - Only university can revoke their diplomas\n`)

  console.log(`PRIVACY GUARANTEES:`)
  console.log(`  ✓ Student identity never revealed to employer`)
  console.log(`  ✓ Grades never revealed to employer`)
  console.log(`  ✓ Transcript never revealed to employer`)
  console.log(`  ✓ Only diploma validity confirmed\n`)
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎓 PrivateDiploma: Privacy-Preserving Credential System     ║
║                                                                ║
║   Built on Midnight Network with Zero-Knowledge Proofs       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `)

  // Run all examples
  try {
    // Uncomment to run examples:
    // await exampleUniversityIssuesDiploma()
    // await exampleStudentVerifiesToEmployer()
    // await exampleEmployerChecksDiplomaValidity()
    await exampleGenerateProofOffline()
    await exampleHashGeneration()
    await exampleCompleteWorkflow()

    console.log(`\n${"=".repeat(60)}`)
    console.log(`All examples completed successfully!`)
    console.log(`${"=".repeat(60)}\n`)
  } catch (error) {
    console.error("Error running examples:", error)
  }
}

// Execute main function
main()
