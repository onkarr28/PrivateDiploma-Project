/**
 * Production Configuration Loader
 * Reads from environment variables and validates configuration
 */

export interface ProductionConfig {
  // Blockchain
  contractAddress: string;
  rpcUrl: string;
  networkId: number;
  
  // Wallet
  walletType: 'lace' | 'midnight' | 'cardano';
  
  // Features
  enableBlockchain: boolean;
  enableZKProofs: boolean;
  requireConfirmation: boolean;
  logTransactions: boolean;
  
  // Gas
  gasLimitIssuance: number;
  gasLimitVerify: number;
  gasPriceMultiplier: number;
  
  // APIs
  verificationApi?: string;
}

class ConfigLoader {
  private config: ProductionConfig | null = null;

  /**
   * Load and validate production configuration
   */
  loadConfig(): ProductionConfig {
    if (this.config) {
      return this.config;
    }

    // Determine if running in production or demo mode
    const isProduction = import.meta.env.VITE_ENABLE_BLOCKCHAIN === 'true';

    // Load from environment variables
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '';
    const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://testnet-rpc.midnight.network';
    const networkId = parseInt(import.meta.env.VITE_NETWORK_ID || '0');

    // Validate required fields for production
    if (isProduction) {
      if (!contractAddress) {
        throw new Error(
          'PRODUCTION MODE: VITE_CONTRACT_ADDRESS not set. ' +
          'Deploy your PrivateDiploma contract and set the address in .env'
        );
      }
      if (!rpcUrl) {
        throw new Error('PRODUCTION MODE: VITE_RPC_URL not set in .env');
      }
    }

    this.config = {
      contractAddress,
      rpcUrl,
      networkId,
      walletType: (import.meta.env.VITE_WALLET_TYPE || 'lace') as any,
      enableBlockchain: isProduction,
      enableZKProofs: import.meta.env.VITE_ENABLE_ZK_PROOFS !== 'false',
      requireConfirmation: import.meta.env.VITE_REQUIRE_CONFIRMATION !== 'false',
      logTransactions: import.meta.env.VITE_LOG_TRANSACTIONS !== 'false',
      gasLimitIssuance: parseInt(import.meta.env.VITE_GAS_LIMIT_ISSUANCE || '250000'),
      gasLimitVerify: parseInt(import.meta.env.VITE_GAS_LIMIT_VERIFY || '200000'),
      gasPriceMultiplier: parseFloat(import.meta.env.VITE_GAS_PRICE_MULTIPLIER || '1.0'),
      verificationApi: import.meta.env.VITE_VERIFICATION_API,
    };

    console.log('📋 Configuration loaded:', {
      networkId: this.config.networkId,
      walletType: this.config.walletType,
      blockchainEnabled: this.config.enableBlockchain,
      zkProofsEnabled: this.config.enableZKProofs,
      contractAddress: contractAddress.slice(0, 20) + '...',
    });

    return this.config;
  }

  /**
   * Get network name from ID
   */
  getNetworkName(networkId: number): string {
    return networkId === 1 ? 'Mainnet' : 'Testnet';
  }

  /**
   * Get RPC endpoint
   */
  getRpcEndpoint(): string {
    return this.loadConfig().rpcUrl;
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    const config = this.loadConfig();
    if (!config.contractAddress) {
      throw new Error('Contract address not configured');
    }
    return config.contractAddress;
  }

  /**
   * Check if blockchain is enabled
   */
  isBlockchainEnabled(): boolean {
    return this.loadConfig().enableBlockchain;
  }

  /**
   * Check if in production mode
   */
  isProduction(): boolean {
    return this.loadConfig().networkId === 1;
  }
}

// Export singleton
export const configLoader = new ConfigLoader();
export default configLoader;
