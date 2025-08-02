const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const config = {
  // Ethereum Configuration
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC_URL || "http://localhost:8545",
    privateKey: process.env.ETHEREUM_PRIVATE_KEY,
    chainId: parseInt(process.env.ETHEREUM_CHAIN_ID) || 31337,
    contracts: {
      icpBridge: process.env.ICP_BRIDGE_ADDRESS,
      crossChainResolver: process.env.CROSS_CHAIN_RESOLVER_ADDRESS,
    },
    gas: {
      maxGasPrice: process.env.MAX_GAS_PRICE_GWEI || "50",
      gasLimit: process.env.GAS_LIMIT || "300000",
    },
  },

  // ICP Configuration
  icp: {
    host: process.env.ICP_HOST || "https://ic0.app",
    canisterId: process.env.ICP_CANISTER_ID,
    identitySeed: process.env.ICP_IDENTITY_SEED,
  },

  // Relayer Configuration
  relayer: {
    name: process.env.RELAYER_NAME || "cross-chain-relayer",
    pollingInterval: parseInt(process.env.POLLING_INTERVAL_MS) || 5000,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 2000,
    healthCheckPort: parseInt(process.env.HEALTH_CHECK_PORT) || 3000,
    metricsEnabled: process.env.METRICS_ENABLED === "true",
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/relayer.log",
  },

  // Database Configuration (Optional)
  database: {
    url: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
  },
};

// Validation
function validateConfig() {
  const required = [
    "ethereum.rpcUrl",
    "ethereum.privateKey",
    "ethereum.contracts.icpBridge",
    "icp.canisterId",
    "icp.identitySeed",
  ];

  for (const key of required) {
    const value = key.split(".").reduce((obj, k) => obj?.[k], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
  }

  // Validate Ethereum private key format
  if (!config.ethereum.privateKey.startsWith("0x")) {
    config.ethereum.privateKey = "0x" + config.ethereum.privateKey;
  }

  // Validate contract addresses
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(config.ethereum.contracts.icpBridge)) {
    throw new Error("Invalid ICP Bridge contract address");
  }

  return true;
}

module.exports = { config, validateConfig };
