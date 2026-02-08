/**
 * Midnight Network Real Wallet Integration
 * Connects to actual Midnight wallet instead of mock
 */

export interface MidnightWalletAccount {
  address: string;
  publicKey: string;
  balance: string;
  network: 'mainnet' | 'testnet';
  isConnected: boolean;
  walletType: string;
}

export interface MidnightTransaction {
  txId: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

class MidnightWalletManager {
  private account: MidnightWalletAccount | null = null;
  private windowRef: any = null;
  private listeners: Set<(account: MidnightWalletAccount | null) => void> = new Set();
  private transactionListeners: Set<(tx: MidnightTransaction) => void> = new Set();

  /**
   * Initialize wallet connection to Midnight Network
   */
  async initializeWallet(): Promise<void> {
    try {
      // Wait for wallet to be available (it might load after page loads)
      await this.waitForWallet();
      
      console.log('✓ Midnight wallet extension detected successfully');

      // Set up event listeners for account changes
      if (this.windowRef.on) {
        this.windowRef.on('accountsChanged', (accounts: string[]) => {
          console.log('Accounts changed:', accounts);
          this.handleAccountsChanged(accounts);
        });
        
        this.windowRef.on('networkChanged', (networkId: string) => {
          console.log('Network changed:', networkId);
          // Refresh account info on network change
          if (this.account) {
            this.connectWallet().catch(console.error);
          }
        });
      }

      // Try to restore previous connection
      await this.restoreConnection();
    } catch (error) {
      console.error('❌ Midnight wallet not available:', error);
      throw new Error('Please install the Midnight wallet extension');
    }
  }

  /**
   * Wait for wallet to be available (PRIORITIZES LACE)
   */
  private async waitForWallet(maxWaitTime: number = 8000): Promise<void> {
    const startTime = Date.now();
    console.log('⏳ Waiting for wallet extension to load...');
    
    while (Date.now() - startTime < maxWaitTime) {
      const w = window as any;
      
      // PRIORITY 1: Lace wallet (Cardano)
      if (w.cardano?.lace) {
        console.log('✓ Lace wallet found via window.cardano.lace');
        this.windowRef = w.cardano.lace;
        return;
      }
      
      // PRIORITY 2: Standalone Lace
      if (w.lace) {
        console.log('✓ Lace wallet found via window.lace');
        this.windowRef = w.lace;
        return;
      }
      
      // PRIORITY 3: Midnight via Cardano
      if (w.cardano?.midnight) {
        console.log('✓ Midnight wallet found via window.cardano.midnight');
        this.windowRef = w.cardano.midnight;
        return;
      }
      
      // PRIORITY 4: Any other Cardano wallet
      if (w.cardano) {
        const wallets = Object.keys(w.cardano).filter(key => 
          typeof w.cardano[key] === 'object' && 
          w.cardano[key] !== null &&
          typeof w.cardano[key].enable === 'function'
        );
        if (wallets.length > 0) {
          const firstWallet = wallets[0];
          console.log(`✓ Using Cardano wallet: ${firstWallet}`);
          this.windowRef = w.cardano[firstWallet];
          return;
        }
      }
      
      // PRIORITY 5: Direct Midnight
      if (w.midnight) {
        console.log('✓ Midnight wallet found via window.midnight');
        this.windowRef = w.midnight;
        return;
      }
      
      // Wait 150ms before checking again
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    console.error('❌ Timeout: No wallet extension found after', maxWaitTime, 'ms');
    console.log('Available objects:', {
      cardano: !!(window as any).cardano,
      midnight: !!(window as any).midnight,
      lace: !!(window as any).lace
    });
    
    throw new Error('No wallet extension detected. Please install Lace wallet from Chrome Web Store and refresh this page.');
  }

  /**
   * Restore previous connection (only if valid)
   */
  private async restoreConnection(): Promise<void> {
    try {
      const stored = localStorage.getItem('midnightWalletConnected');
      if (stored) {
        const restoredAccount = JSON.parse(stored);
        
        // Verify the wallet is still connected by checking with extension
        if (this.windowRef && this.windowRef.isEnabled) {
          const isEnabled = await this.windowRef.isEnabled();
          if (isEnabled) {
            this.account = restoredAccount;
            this.notifyListeners(this.account);
            console.log('✓ Restored previous wallet connection:', restoredAccount.address);
          } else {
            // Clear invalid stored connection
            localStorage.removeItem('midnightWalletConnected');
          }
        } else {
          // Optimistically restore but mark for verification
          this.account = restoredAccount;
          this.notifyListeners(this.account);
          console.log('✓ Restored wallet from storage (not verified)');
        }
      }
    } catch (error) {
      console.error('Failed to restore connection:', error);
      localStorage.removeItem('midnightWalletConnected');
    }
  }

  /**
   * Handle account changes
   */
  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.account = null;
      this.notifyListeners(null);
    }
  }

  /**
   * Connect to Lace or Midnight wallet
   */
  async connectWallet(): Promise<MidnightWalletAccount> {
    // Check if wallet was previously initialized
    if (!this.windowRef) {
      const w = window as any;
      // PRIORITIZE LACE
      this.windowRef = w.cardano?.lace || 
                       w.lace ||
                       w.cardano?.midnight ||
                       w.midnight ||
                       w.midnightWallet;
      
      // Check for any Cardano wallet
      if (!this.windowRef && w.cardano) {
        const wallets = Object.keys(w.cardano).filter(key => 
          typeof w.cardano[key] === 'object' && 
          w.cardano[key] !== null &&
          typeof w.cardano[key].enable === 'function'
        );
        if (wallets.length > 0) {
          console.log('Using first available Cardano wallet:', wallets[0]);
          this.windowRef = w.cardano[wallets[0]];
        }
      }
    }

    if (!this.windowRef) {
      throw new Error('❌ No wallet extension found.\n\nPlease install Lace wallet:\n1. Open Chrome Web Store\n2. Search for "Lace Wallet"\n3. Click "Add to Chrome"\n4. Refresh this page');
    }
    
    console.log('🔗 Connecting to wallet:', this.windowRef);

    try {
      let midnight = null;
      
      // Try Lace Cardano API
      if (this.windowRef.enable) {
        console.log('Attempting wallet connection via enable()...');
        midnight = await this.windowRef.enable();
      } 
      // Try Midnight Network API
      else if (this.windowRef.request) {
        console.log('Attempting wallet connection via request()...');
        midnight = await this.windowRef.request({
          method: 'wallet_connect',
        });
      }
      // Try direct connection
      else if (this.windowRef.connect) {
        console.log('Attempting wallet connection via connect()...');
        midnight = await this.windowRef.connect();
      }
      else {
        // Wallet might be already enabled
        midnight = this.windowRef;
      }

      if (!midnight) {
        throw new Error('User rejected wallet connection request');
      }

      console.log('Wallet API enabled:', midnight);

      // Get account information
      const account = await this.getAccountInfo(midnight);
      this.account = account;
      this.notifyListeners(account);

      // Persist connection for offline access
      localStorage.setItem('midnightWalletConnected', JSON.stringify(account));

      console.log('Wallet connected successfully:', account);
      return account;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to connect wallet';
      console.error('Wallet connection error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get account information from wallet (supports Lace and Midnight)
   */
  private async getAccountInfo(midnight: any): Promise<MidnightWalletAccount> {
    try {
      // Try multiple methods to get address
      let address = null;
      
      // Lace/Cardano CIP-30 API
      if (midnight.getUsedAddresses) {
        const addresses = await midnight.getUsedAddresses();
        if (addresses && addresses.length > 0) {
          // Convert from hex if needed
          address = Array.isArray(addresses) ? addresses[0] : addresses;
        }
      }
      
      // Fallback methods
      if (!address && midnight.getAddresses) {
        const addresses = await midnight.getAddresses();
        address = Array.isArray(addresses) ? addresses[0] : addresses;
      }
      
      if (!address && midnight.getAddress) {
        address = await midnight.getAddress();
      }
      
      if (!address && midnight.address) {
        address = midnight.address;
      }

      if (!address) {
        throw new Error('Could not retrieve wallet address from extension');
      }
      
      console.log('Wallet address retrieved:', address);

      // Get balance
      let balance = '0';
      try {
        if (midnight.getBalance) {
          const balanceData = await midnight.getBalance();
          balance = typeof balanceData === 'string' ? balanceData : balanceData?.toString() || '0';
        }
      } catch (error) {
        console.warn('Could not retrieve balance:', error);
      }

      // Get network
      let network: 'mainnet' | 'testnet' = 'testnet';
      try {
        if (midnight.getNetworkId) {
          const netId = await midnight.getNetworkId();
          network = netId === 1 ? 'mainnet' : 'testnet';
        } else if (midnight.getNetwork) {
          const net = await midnight.getNetwork();
          network = net === 'mainnet' || net === 1 ? 'mainnet' : 'testnet';
        }
      } catch (error) {
        console.warn('Using default testnet:', error);
      }

      // Derive public key
      const publicKey = await this.derivePublicKey(midnight, address);

      // Detect wallet type
      const walletType = (window as any).cardano?.lace ? 'Lace Wallet' : 
                        (window as any).midnight ? 'Midnight Wallet' : 
                        'Connected Wallet';

      console.log('Account info retrieved:', { address, balance, network, walletType });

      return {
        address,
        publicKey,
        balance,
        network,
        isConnected: true,
        walletType,
      };
    } catch (error: any) {
      console.error('Failed to get account info:', error);
      throw new Error(error?.message || 'Failed to retrieve account information');
    }
  }

  /**
   * Derive public key from address
   */
  private async derivePublicKey(midnight: any, address: string): Promise<string> {
    try {
      // Try to get public key from wallet
      const publicKey = await midnight.getPublicKey?.();
      return publicKey || `pk_${address.slice(0, 16)}`;
    } catch {
      return `pk_${address.slice(0, 16)}`;
    }
  }

  /**
   * Send transaction on Midnight Network
   */
  async sendTransaction(
    to: string,
    amount: string,
    metadata?: any
  ): Promise<MidnightTransaction> {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    if (!this.windowRef?.sendTransaction) {
      throw new Error('Wallet does not support transactions');
    }

    try {
      const txResponse = await this.windowRef.sendTransaction({
        to,
        amount,
        metadata,
      });

      const tx: MidnightTransaction = {
        txId: txResponse.txId || `tx_${Date.now()}`,
        from: this.account.address,
        to,
        amount,
        fee: txResponse.fee || '0',
        status: 'pending',
        timestamp: Date.now(),
      };

      // Notify listeners
      this.notifyTransactionListeners(tx);

      // Poll for confirmation
      this.pollTransactionStatus(tx);

      return tx;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Poll transaction status
   */
  private async pollTransactionStatus(tx: MidnightTransaction): Promise<void> {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes with 10 second intervals

    const poll = async () => {
      try {
        if (attempts >= maxAttempts) {
          tx.status = 'failed';
          this.notifyTransactionListeners(tx);
          return;
        }

        const status = await this.windowRef.getTransactionStatus?.(tx.txId);

        if (status === 'confirmed') {
          tx.status = 'confirmed';
          this.notifyTransactionListeners(tx);
        } else if (status === 'failed') {
          tx.status = 'failed';
          this.notifyTransactionListeners(tx);
        } else {
          attempts++;
          setTimeout(poll, 10000); // Check every 10 seconds
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
      }
    };

    await poll();
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    if (!this.windowRef?.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    try {
      const signature = await this.windowRef.signMessage({
        message,
        address: this.account.address,
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Verify a signature
   */
  async verifySignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    if (!this.windowRef?.verifySignature) {
      throw new Error('Wallet does not support signature verification');
    }

    try {
      const isValid = await this.windowRef.verifySignature({
        message,
        signature,
        address,
      });

      return isValid;
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Get current account
   */
  getAccount(): MidnightWalletAccount | null {
    if (this.account) return this.account;

    const stored = localStorage.getItem('midnightWalletConnected');
    if (stored) {
      try {
        this.account = JSON.parse(stored);
        return this.account;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    this.account = null;
    this.notifyListeners(null);
    localStorage.removeItem('midnightWalletConnected');

    if (this.windowRef?.disconnect) {
      try {
        await this.windowRef.disconnect();
      } catch (error) {
        console.warn('Error disconnecting wallet:', error);
      }
    }
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.account !== null;
  }

  /**
   * Listen for account changes
   */
  onAccountChange(callback: (account: MidnightWalletAccount | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Listen for transaction updates
   */
  onTransactionUpdate(callback: (tx: MidnightTransaction) => void): () => void {
    this.transactionListeners.add(callback);
    return () => this.transactionListeners.delete(callback);
  }

  /**
   * Get network
   */
  getNetwork(): 'mainnet' | 'testnet' {
    return this.account?.network || 'testnet';
  }

  /**
   * Get balance
   */
  getBalance(): string {
    return this.account?.balance || '0';
  }

  /**
   * Check wallet availability (Lace, Midnight, or other Cardano wallets)
   */
  static isWalletAvailable(): boolean {
    return !!((window as any).midnight || 
              (window as any).cardano?.lace || 
              (window as any).cardano?.midnight ||
              (window as any).lace);
  }

  /**
   * Get wallet info
   */
  static getWalletInfo(): any {
    return (window as any).midnight?.info || null;
  }

  // Private helpers

  private notifyListeners(account: MidnightWalletAccount | null): void {
    this.listeners.forEach((callback) => callback(account));
  }

  private notifyTransactionListeners(tx: MidnightTransaction): void {
    this.transactionListeners.forEach((callback) => callback(tx));
  }
}

// Singleton instance
export const midnightWalletManager = new MidnightWalletManager();

// Export for direct use
export default midnightWalletManager;
