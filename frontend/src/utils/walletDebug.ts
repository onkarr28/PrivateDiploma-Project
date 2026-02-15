/**
 * Wallet Detection and Debugging Utilities
 * Helps diagnose wallet connection issues
 */

export interface WalletDetectionResult {
  detected: boolean;
  walletType: string | null;
  apiMethods: string[];
  error: string | null;
}

/**
 * Detect available wallet in the browser (Prioritizes Lace)
 */
export function detectWallet(): WalletDetectionResult {
  const w = window as any;
  
  console.log('🔍 Checking for wallet extensions...');
  console.log('window.cardano:', w.cardano);
  console.log('window.midnight:', w.midnight);
  console.log('window.lace:', w.lace);
  if (w.midnight?.mnLace) {
    console.log('✓ Midnight Lace provider detected via window.midnight.mnLace');
    return {
      detected: true,
      walletType: 'Lace Midnight',
      apiMethods: Object.keys(w.midnight.mnLace).filter(key => typeof w.midnight.mnLace[key] === 'function'),
      error: null,
    };
  }
  
  // Priority 1: Check for Lace wallet (Cardano) - HIGHEST PRIORITY
  if (w.cardano?.lace) {
    console.log('✓ Lace wallet detected via window.cardano.lace');
    return {
      detected: true,
      walletType: 'Lace Wallet',
      apiMethods: Object.keys(w.cardano.lace).filter(key => typeof w.cardano.lace[key] === 'function'),
      error: null,
    };
  }
  
  // Priority 2: Check for standalone Lace
  if (w.lace) {
    console.log('✓ Lace wallet detected via window.lace');
    return {
      detected: true,
      walletType: 'Lace Wallet (Standalone)',
      apiMethods: Object.keys(w.lace).filter(key => typeof w.lace[key] === 'function'),
      error: null,
    };
  }
  
  // Priority 3: Check for Midnight wallet via Cardano
  if (w.cardano?.midnight) {
    console.log('✓ Midnight wallet detected via window.cardano.midnight');
    return {
      detected: true,
      walletType: 'Midnight Wallet (Cardano)',
      apiMethods: Object.keys(w.cardano.midnight).filter(key => typeof w.cardano.midnight[key] === 'function'),
      error: null,
    };
  }
  
  // Priority 4: Check for Midnight wallet (standalone)
  if (w.midnight) {
    console.log('✓ Midnight wallet detected via window.midnight');
    return {
      detected: true,
      walletType: 'Midnight Wallet',
      apiMethods: Object.keys(w.midnight).filter(key => typeof w.midnight[key] === 'function'),
      error: null,
    };
  }
  
  // Check if any Cardano wallets are available
  if (w.cardano) {
    const availableWallets = Object.keys(w.cardano).filter(key => 
      typeof w.cardano[key] === 'object' && w.cardano[key] !== null
    );
    
    console.log('Available Cardano wallets:', availableWallets);
    
    if (availableWallets.length > 0) {
      // Use the first available Cardano wallet
      const firstWallet = availableWallets[0];
      console.log(`✓ Using Cardano wallet: ${firstWallet}`);
      return {
        detected: true,
        walletType: `${firstWallet.charAt(0).toUpperCase() + firstWallet.slice(1)} Wallet`,
        apiMethods: Object.keys(w.cardano[firstWallet]).filter(key => typeof w.cardano[firstWallet][key] === 'function'),
        error: null,
      };
    }
  }
  
  console.error('❌ No wallet extension found!');
  return {
    detected: false,
    walletType: null,
    apiMethods: [],
    error: 'No wallet extension detected. Please install Lace wallet from Chrome Web Store.',
  };
}

/**
 * Log wallet detection info to console
 */
export function logWalletInfo(): void {
  const result = detectWallet();
  
  console.group('🔍 Wallet Detection');
  console.log('Detected:', result.detected);
  console.log('Type:', result.walletType || 'None');
  
  if (result.apiMethods.length > 0) {
    console.log('Available Methods:', result.apiMethods);
  }
  
  if (result.error) {
    console.warn('⚠️ Issue:', result.error);
  }
  
  // Log window object structure
  const w = window as any;
  if (w.midnight) {
    console.log('window.midnight:', w.midnight);
  }
  if (w.cardano) {
    console.log('window.cardano:', Object.keys(w.cardano));
  }
  if (w.lace) {
    console.log('window.lace:', w.lace);
  }
  
  console.groupEnd();
}

/**
 * Wait for wallet to be injected (some extensions load async)
 */
export async function waitForWalletInjection(timeout: number = 5000): Promise<WalletDetectionResult> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = detectWallet();
    
    if (result.detected) {
      logWalletInfo();
      return result;
    }
    
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Timeout - log final state
  logWalletInfo();
  
  return {
    detected: false,
    walletType: null,
    apiMethods: [],
    error: 'Timeout: No wallet detected after 5 seconds',
  };
}

/**
 * Get wallet connection instructions
 */
export function getWalletInstructions(): string[] {
  const result = detectWallet();
  
  if (result.detected) {
    return [
      `✓ ${result.walletType} detected!`,
      'Click "Connect Wallet" to proceed',
      'Approve the connection request in the popup',
    ];
  }
  
  return [
    '❌ No Lace wallet detected',
    '',
    '📥 Installation steps:',
    '  1. Open Chrome Web Store',
    '  2. Search for "Lace Wallet"',
    '  3. Click "Add to Chrome"',
    '  4. Set up your wallet',
    '  5. Refresh this page',
    '',
    '🔗 Direct link:',
    '  chrome.google.com/webstore (search: Lace Wallet)',
    '',
    '💡 Lace supports Midnight Network and Cardano',
  ];
}
