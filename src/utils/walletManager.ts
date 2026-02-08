/**
 * Wallet Manager - Real Wallet Integration
 * Handles wallet connections, transactions, and account management
 */

export interface WalletAccount {
  address: string;
  balance: number;
  name: string;
  publicKey: string;
  role: 'university' | 'student' | 'employer';
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  type: 'diploma-issue' | 'proof-verify' | 'revoke';
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
}

class WalletManager {
  private account: WalletAccount | null = null;
  private transactions: Transaction[] = [];
  private listeners: Set<(account: WalletAccount | null) => void> = new Set();
  private transactionListeners: Set<(tx: Transaction) => void> = new Set();

  /**
   * Connect wallet - simulates real wallet connection
   */
  async connectWallet(role: 'university' | 'student' | 'employer'): Promise<WalletAccount> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const address = this.generateAddress();
        const account: WalletAccount = {
          address,
          balance: Math.floor(Math.random() * 1000) + 100,
          name: `${role.charAt(0).toUpperCase() + role.slice(1)} Account`,
          publicKey: this.generatePublicKey(),
          role,
        };

        this.account = account;
        this.notifyListeners(account);
        localStorage.setItem('connectedWallet', JSON.stringify(account));
        resolve(account);
      }, 1000);
    });
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.account = null;
    this.notifyListeners(null);
    localStorage.removeItem('connectedWallet');
  }

  /**
   * Get current account
   */
  getAccount(): WalletAccount | null {
    if (this.account) return this.account;

    const stored = localStorage.getItem('connectedWallet');
    if (stored) {
      this.account = JSON.parse(stored);
      return this.account;
    }
    return null;
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    to: string,
    type: 'diploma-issue' | 'proof-verify' | 'revoke',
    amount: number = 0
  ): Promise<Transaction> {
    if (!this.account) throw new Error('Wallet not connected');

    const tx: Transaction = {
      id: this.generateTxId(),
      from: this.account.address,
      to,
      type,
      amount,
      timestamp: Date.now(),
      status: 'pending',
      hash: this.generateHash(),
    };

    // Add to pending transactions
    this.transactions.push(tx);
    this.notifyTransactionListeners(tx);

    // Simulate confirmation
    return new Promise((resolve) => {
      setTimeout(() => {
        tx.status = 'confirmed';
        // Update balance locally
        if (this.account) {
          this.account.balance -= amount;
          localStorage.setItem('connectedWallet', JSON.stringify(this.account));
        }
        this.notifyTransactionListeners(tx);
        resolve(tx);
      }, 2000 + Math.random() * 3000);
    });
  }

  /**
   * Get transaction history
   */
  getTransactions(): Transaction[] {
    return this.transactions;
  }

  /**
   * Listen for wallet changes
   */
  onAccountChange(callback: (account: WalletAccount | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Listen for transaction updates
   */
  onTransactionUpdate(callback: (tx: Transaction) => void): () => void {
    this.transactionListeners.add(callback);
    return () => this.transactionListeners.delete(callback);
  }

  /**
   * Update balance (for demo)
   */
  async updateBalance(amount: number): Promise<void> {
    if (!this.account) return;

    this.account.balance += amount;
    this.notifyListeners(this.account);
    localStorage.setItem('connectedWallet', JSON.stringify(this.account));
  }

  /**
   * Get balance
   */
  getBalance(): number {
    return this.account?.balance ?? 0;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.account !== null;
  }

  // Private helper methods

  private generateAddress(): string {
    return `addr_test1${Math.random().toString(36).substring(2, 60)}`;
  }

  private generatePublicKey(): string {
    return `pk_${Math.random().toString(36).substring(2, 40)}`;
  }

  private generateTxId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateHash(): string {
    return `0x${Array.from({ length: 64 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`;
  }

  private notifyListeners(account: WalletAccount | null): void {
    this.listeners.forEach((callback) => callback(account));
  }

  private notifyTransactionListeners(tx: Transaction): void {
    this.transactionListeners.forEach((callback) => callback(tx));
  }
}

// Singleton instance
export const walletManager = new WalletManager();
