const { ethers } = require("ethers");
const { config } = require("../config");
const logger = require("../utils/logger");

// Contract ABIs (minimal required functions)
const ICPBridgeABI = [
  "event CrossChainMessage(bytes32 indexed swapId, string sourceChain, string targetChain, string targetCanister, string receiver, bytes32 hashlock, uint256 timelock, uint256 timestamp)",
  "function markMessageProcessed(bytes32 swapId) external",
  "function pendingMessages(bytes32) external view returns (bytes32 swapId, string sourceChain, string targetChain, string targetCanister, string receiver, bytes32 hashlock, uint256 timelock, uint256 timestamp, bool processed)",
];

class EthereumService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.icpBridgeContract = null;
    this.isConnected = false;
    this.lastProcessedBlock = 0;
    this.eventFilters = new Map();
  }

  async initialize() {
    try {
      logger.info("Initializing Ethereum service...");

      // Create provider
      this.provider = new ethers.providers.JsonRpcProvider(
        config.ethereum.rpcUrl
      );

      // Test connection
      const network = await this.provider.getNetwork();
      logger.info("Connected to Ethereum network:", {
        chainId: network.chainId,
        name: network.name,
      });

      // Create wallet
      this.wallet = new ethers.Wallet(
        config.ethereum.privateKey,
        this.provider
      );
      logger.info("Wallet initialized:", { address: this.wallet.address });

      // Create contract instances
      this.icpBridgeContract = new ethers.Contract(
        config.ethereum.contracts.icpBridge,
        ICPBridgeABI,
        this.wallet
      );

      // Get current block number
      this.lastProcessedBlock = await this.provider.getBlockNumber();
      logger.info("Starting from block:", this.lastProcessedBlock);

      this.isConnected = true;
      logger.info("Ethereum service initialized successfully");
    } catch (error) {
      logger.logError(error, { service: "ethereum", action: "initialize" });
      throw error;
    }
  }

  async startEventListening(onMessage) {
    if (!this.isConnected) {
      throw new Error("Ethereum service not initialized");
    }

    logger.info("Starting to listen for CrossChainMessage events...");

    // Set up filter for CrossChainMessage events
    const filter = this.icpBridgeContract.filters.CrossChainMessage();

    // Listen for new events
    this.icpBridgeContract.on(filter, async (...args) => {
      try {
        const event = args[args.length - 1]; // Last argument is the event object
        await this.handleCrossChainMessage(event, onMessage);
      } catch (error) {
        logger.logError(error, {
          service: "ethereum",
          action: "handleEvent",
        });
      }
    });

    // Process past events
    await this.processPastEvents(onMessage);

    logger.info("Event listening started successfully");
  }

  async processPastEvents(onMessage, fromBlock = null) {
    try {
      const startBlock = fromBlock || this.lastProcessedBlock - 1000; // Last 1000 blocks
      const currentBlock = await this.provider.getBlockNumber();

      logger.info("Processing past events:", {
        fromBlock: startBlock,
        toBlock: currentBlock,
      });

      const filter = this.icpBridgeContract.filters.CrossChainMessage();
      const events = await this.icpBridgeContract.queryFilter(
        filter,
        startBlock,
        currentBlock
      );

      logger.info(`Found ${events.length} past CrossChainMessage events`);

      for (const event of events) {
        await this.handleCrossChainMessage(event, onMessage);
      }

      this.lastProcessedBlock = currentBlock;
    } catch (error) {
      logger.logError(error, {
        service: "ethereum",
        action: "processPastEvents",
      });
    }
  }

  async handleCrossChainMessage(event, onMessage) {
    try {
      const {
        swapId,
        sourceChain,
        targetChain,
        targetCanister,
        receiver,
        hashlock,
        timelock,
        timestamp,
      } = event.args;

      const messageData = {
        swapId: swapId,
        sourceChain,
        targetChain,
        targetCanister,
        receiver,
        hashlock: hashlock,
        timelock: timelock.toNumber(),
        timestamp: timestamp.toNumber(),
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      };

      logger.logSwap(swapId, "CrossChainMessage event received", messageData);

      // Check if message was already processed
      const pendingMessage = await this.icpBridgeContract.pendingMessages(
        swapId
      );
      if (pendingMessage.processed) {
        logger.logSwap(swapId, "Message already processed, skipping");
        return;
      }

      // Call the message handler
      await onMessage(messageData);
    } catch (error) {
      logger.logError(error, {
        service: "ethereum",
        action: "handleCrossChainMessage",
        eventTxHash: event?.transactionHash,
      });
    }
  }

  async markMessageProcessed(swapId) {
    try {
      logger.logSwap(swapId, "Marking message as processed on Ethereum...");

      const gasPrice = await this.provider.getGasPrice();
      const maxGasPrice = ethers.utils.parseUnits(
        config.ethereum.gas.maxGasPrice,
        "gwei"
      );

      const tx = await this.icpBridgeContract.markMessageProcessed(swapId, {
        gasLimit: config.ethereum.gas.gasLimit,
        gasPrice: gasPrice.gt(maxGasPrice) ? maxGasPrice : gasPrice,
      });

      logger.logTransaction(tx.hash, "Message processed transaction sent", {
        swapId,
      });

      const receipt = await tx.wait();
      logger.logTransaction(tx.hash, "Message processed confirmed", {
        swapId,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      });

      return receipt;
    } catch (error) {
      logger.logError(error, {
        service: "ethereum",
        action: "markMessageProcessed",
        swapId,
      });
      throw error;
    }
  }

  async getBalance() {
    try {
      const balance = await this.wallet.getBalance();
      return ethers.utils.formatEther(balance);
    } catch (error) {
      logger.logError(error, { service: "ethereum", action: "getBalance" });
      return "0";
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, "gwei");
    } catch (error) {
      logger.logError(error, { service: "ethereum", action: "getGasPrice" });
      return "0";
    }
  }

  async isHealthy() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.getBalance();

      return {
        connected: this.isConnected,
        blockNumber,
        walletAddress: this.wallet?.address,
        balance: balance + " ETH",
        gasPrice: (await this.getGasPrice()) + " gwei",
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async stop() {
    if (this.icpBridgeContract) {
      this.icpBridgeContract.removeAllListeners();
    }
    this.isConnected = false;
    logger.info("Ethereum service stopped");
  }
}

module.exports = EthereumService;
