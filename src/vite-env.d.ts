/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_ENABLE_BLOCKCHAIN: string
  readonly VITE_MIDNIGHT_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
