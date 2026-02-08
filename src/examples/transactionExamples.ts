/**
 * Transaction Usage Examples
 * Demonstrates how to use the on-chain transaction system
 */

import { useMidnightSDK } from './utils/MidnightProvider';
import { TransactionResult } from './utils/transactionManager';

// ============================================================
// EXAMPLE 1: Issue Diploma with On-Chain Transaction
// ============================================================

export async function exampleIssueDiploma() {
  const { submitDiplomaTransaction, monitorTransaction } = useMidnightSDK();

  // Step 1: Create witness data (kept private on client)
  const witness = {
    studentId: "STU-2026-001",
    studentName: "Alice Johnson",      // 🔒 Private - never goes on-chain
    degreeType: "BSc Computer Science",
    grade: "A",                         // 🔒 Private - never goes on-chain
    department: "Computer Science",
    issueDate: "2026-02-08",
    universityAddress: "0xUniversityWallet..."
  };

  console.log("📝 Issuing diploma...");
  console.log("🔐 Private data (stays local):", witness);

  // Step 2: Submit transaction to blockchain
  const txResult: TransactionResult = await submitDiplomaTransaction(witness);
  
  console.log("✅ Transaction submitted!");
  console.log("TX Hash:", txResult.txHash);
  console.log("Status:", txResult.status);
  console.log("Certificate Hash (commitment):", txResult.certificateHash);
  
  // What goes ON-CHAIN (public):
  // ✓ Commitment hash: 0xabc123... (one-way hash of witness)
  // ✓ Nullifier: 0xdef456... (for revocation tracking)
  // ✓ Timestamp
  // ✓ Block number
  //
  // What stays PRIVATE (client-only):
  // ✗ Student name
  // ✗ Grades
  // ✗ Student ID

  // Step 3: Monitor transaction status
  const unsubscribe = monitorTransaction(txResult.txHash, (status) => {
    console.log("📡 Transaction update:", status);
    
    if (status.status === 'confirmed') {
      console.log("✅ Transaction confirmed!");
      console.log("Block number:", status.blockNumber);
      console.log("Gas used:", status.gasUsed);
      
      // Update UI to show confirmed diploma
      updateDiplomaUI(status);
      
      // Stop monitoring
      unsubscribe();
    } else if (status.status === 'failed') {
      console.error("❌ Transaction failed!");
      unsubscribe();
    }
  });

  return txResult;
}

// ============================================================
// EXAMPLE 2: Verify Diploma with ZK Proof
// ============================================================

export async function exampleVerifyDiploma() {
  const { generateZKProof, verifyDiplomaTransaction, monitorTransaction } = useMidnightSDK();

  // Step 1: Student generates ZK proof locally
  const studentData = {
    studentId: "STU-2026-001",
    studentName: "Alice Johnson",      // 🔒 Used locally for proof
    degreeType: "BSc Computer Science",
    grade: "A",                         // 🔒 Used locally for proof
    department: "Computer Science",
    universityAddress: "0xUniversity..."
  };

  console.log("🔐 Generating ZK proof (locally)...");
  const zkProof = await generateZKProof(studentData);

  console.log("✅ ZK Proof generated!");
  console.log("Proof:", zkProof.proof.slice(0, 50) + "...");
  console.log("Commitment:", zkProof.commitment);
  
  // The proof contains:
  // ✓ proof: Cryptographic proof
  // ✓ commitment: Public commitment hash
  // ✓ publicInputs: Any public parameters
  // ✗ witness: NOT included (stays private!)

  // Step 2: Submit verification transaction
  console.log("📤 Submitting verification transaction...");
  const txResult = await verifyDiplomaTransaction(zkProof);

  console.log("✅ Verification submitted!");
  console.log("TX Hash:", txResult.txHash);

  // Step 3: Monitor verification
  const unsubscribe = monitorTransaction(txResult.txHash, (status) => {
    if (status.status === 'confirmed') {
      console.log("✅ Verification confirmed on-chain!");
      console.log("Diploma is VALID ✓");
      console.log("Block:", status.blockNumber);
      
      // Employer now knows:
      // ✓ Diploma is valid
      // ✓ Issued by trusted university
      // ✓ Not revoked
      //
      // Employer does NOT know:
      // ✗ Student name
      // ✗ Grades
      // ✗ Student ID
      
      unsubscribe();
    }
  });

  return txResult;
}

// ============================================================
// EXAMPLE 3: Monitor Gas Fees
// ============================================================

export async function exampleMonitorGasFees() {
  const { submitDiplomaTransaction } = useMidnightSDK();
  const { estimateGasForIssuance } = await import('./utils/transactionManager');

  const witness = {
    studentId: "STU-2026-001",
    studentName: "Alice Johnson",
    degreeType: "BSc Computer Science",
    grade: "A",
    department: "CS",
    issueDate: "2026-02-08",
    universityAddress: "0x..."
  };

  // Get gas estimate BEFORE submitting
  const commitment = "0xabc123..."; // Would be generated from witness
  const gasEstimate = await estimateGasForIssuance(commitment);

  console.log("⛽ Gas Estimate:");
  console.log("Gas Limit:", gasEstimate.gasLimit);
  console.log("Gas Price:", gasEstimate.gasPrice, "wei");
  console.log("Estimated Fee:", gasEstimate.estimatedFee, "wei");
  console.log("Max Fee:", gasEstimate.maxFee, "wei");
  
  // Convert to readable format
  const feeInGwei = parseInt(gasEstimate.estimatedFee) / 1e9;
  console.log("Estimated Fee:", feeInGwei.toFixed(6), "Gwei");

  // Ask user for confirmation
  const userConfirmed = confirm(`Gas fee: ${feeInGwei.toFixed(6)} Gwei. Continue?`);
  
  if (userConfirmed) {
    const txResult = await submitDiplomaTransaction(witness);
    console.log("Transaction submitted:", txResult.txHash);
    
    // After confirmation, check actual gas used
    // This will be available in the transaction receipt
  }
}

// ============================================================
// EXAMPLE 4: Handle Transaction States
// ============================================================

export async function exampleHandleTransactionStates() {
  const { submitDiplomaTransaction, monitorTransaction } = useMidnightSDK();

  const witness = {
    studentId: "STU-2026-001",
    studentName: "Alice Johnson",
    degreeType: "BSc CS",
    grade: "A",
    department: "CS",
    issueDate: "2026-02-08",
    universityAddress: "0x..."
  };

  // Submit transaction
  const txResult = await submitDiplomaTransaction(witness);

  // Handle all possible states
  monitorTransaction(txResult.txHash, (status) => {
    switch (status.status) {
      case 'pending':
        console.log("⏳ Transaction pending...");
        console.log("Waiting for block inclusion");
        // Show loading spinner in UI
        showLoadingUI();
        break;

      case 'confirmed':
        console.log("✅ Transaction confirmed!");
        console.log("Block:", status.blockNumber);
        console.log("Gas used:", status.gasUsed);
        // Update UI with success
        showSuccessUI({
          blockNumber: status.blockNumber,
          gasUsed: status.gasUsed,
          certificateHash: status.certificateHash
        });
        break;

      case 'failed':
        console.error("❌ Transaction failed!");
        console.error("Reason: Transaction reverted");
        // Show error message
        showErrorUI("Transaction failed. Please try again.");
        break;

      default:
        console.warn("Unknown transaction status:", status.status);
    }
  });
}

// ============================================================
// EXAMPLE 5: Query Ledger (Privacy-Preserving)
// ============================================================

export async function exampleQueryLedger() {
  const { getTransactionManager } = await import('./utils/transactionManager');
  const txManager = getTransactionManager();

  // Query by commitment (public hash)
  const commitment = "0xabc123...";
  
  console.log("🔍 Querying ledger for commitment:", commitment);
  const diplomaInfo = await txManager.queryDiplomaByCommitment(commitment);

  if (diplomaInfo) {
    console.log("✅ Diploma found on ledger!");
    console.log("Commitment:", diplomaInfo.commitment);
    console.log("Block number:", diplomaInfo.blockNumber);
    console.log("Timestamp:", new Date(diplomaInfo.timestamp).toISOString());
    console.log("Revoked:", diplomaInfo.isRevoked);
    
    // What you CAN see:
    // ✓ Diploma exists
    // ✓ When it was issued
    // ✓ Block number
    // ✓ Revocation status
    //
    // What you CANNOT see:
    // ✗ Student name
    // ✗ Grades
    // ✗ Student ID
    // ✗ Department
  } else {
    console.log("❌ Diploma not found");
  }
}

// ============================================================
// Helper Functions
// ============================================================

function updateDiplomaUI(status: TransactionResult) {
  // Update React state or UI
  console.log("Updating UI with confirmed diploma");
}

function showLoadingUI() {
  console.log("Showing loading spinner...");
}

function showSuccessUI(data: any) {
  console.log("Showing success message:", data);
}

function showErrorUI(message: string) {
  console.error("Showing error:", message);
}
