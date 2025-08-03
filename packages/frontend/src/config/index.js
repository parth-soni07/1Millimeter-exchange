// Network and Contract Configuration
export const NETWORKS = {
  HOLESKY: {
    chainId: 17000,
    name: "Holesky Testnet",
    rpcUrl: "https://ethereum-holesky-rpc.publicnode.com",
    blockExplorer: "https://holesky.etherscan.io",
    nativeCurrency: {
      name: "Holesky ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Deployed Contract Addresses (Holesky Testnet)
export const CONTRACTS = {
  ICP_BRIDGE: "0x22Ee3CC9b84843226811dfEa7aE4230Bd72527A2",
  FUSION_RESOLVER: "0xcbDA9E808a2D2f96937446A506912c7af244F78E",
  ICP_RESOLVER: "0x20b0D28c806A04e11335Debc257b357B3978B633",
};

// Token Addresses (Holesky Testnet)
export const TOKENS = {
  ETHEREUM: {
    OVLIPUS: {
      address: "0xac3700216d6E19EE056532a22FA721dDA5033776",
      symbol: "OVL",
      name: "Ovlipus",
      decimals: 18,
    },
    BYLINT: {
      address: "0x84729A19d40f8c6C6b2d39212f0260eE3e1DB3F0",
      symbol: "BYL",
      name: "Bylint",
      decimals: 18,
    },
  },
  ICP: {
    KARSET: {
      canisterId: "umunu-kh777-77774-qaaca-cai",
      symbol: "KAR",
      name: "Karset",
      decimals: 8,
    },
    WOMRY: {
      canisterId: "ulvla-h7777-77774-qaacq-cai",
      symbol: "WOM",
      name: "Womry",
      decimals: 8,
    },
  },
};

// Chain Metadata
export const CHAINS = {
  ETHEREUM: {
    key: "ETHEREUM",
    label: "Ethereum - Holesky",
    nativeSymbol: "ETH",
  },
  ICP: {
    key: "ICP",
    label: "Internet Computer",
    nativeSymbol: "ICP",
  },
};

export const TOKEN_BY_CHAIN = {
  ETHEREUM: [
    {
      symbol: "OVL",
      name: "Ovlipus",
      address: TOKENS.ETHEREUM.OVLIPUS.address,
      decimals: 18,
    },
    {
      symbol: "BYL",
      name: "Bylint",
      address: TOKENS.ETHEREUM.BYLINT.address,
      decimals: 18,
    },
  ],
  ICP: [
    {
      symbol: "KAR",
      name: "Karset",
      canisterId: TOKENS.ICP.KARSET.canisterId,
      decimals: 8,
    },
    {
      symbol: "WOM",
      name: "Womry",
      canisterId: TOKENS.ICP.WOMRY.canisterId,
      decimals: 8,
    },
  ],
};

// ICP Configuration
export const ICP_CONFIG = {
  HOST: "http://127.0.0.1:4943", // Local dfx replica for canister calls
  CANISTER_ID: "uxrrr-q7777-77774-qaaaq-cai", // Your backend canister
  // Internet Identity always uses the official service
  IDENTITY_PROVIDER: "https://identity.ic0.app",
  // For production, change HOST to: "https://ic0.app"
};

// Application Settings
export const APP_CONFIG = {
  APP_NAME: "Unite DeFi",
  SUPPORTED_TOKENS: {
    ETH: {
      symbol: "ETH",
      decimals: 18,
      icon: "⟠",
    },
    ICP: {
      symbol: "ICP",
      decimals: 8,
      icon: "∞",
    },
  },
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  MAX_SLIPPAGE: 5.0, // 5%
};

// Wallet Detection
export const SUPPORTED_WALLETS = {
  METAMASK: "MetaMask",
  WALLET_CONNECT: "WalletConnect",
  COINBASE: "Coinbase Wallet",
};
