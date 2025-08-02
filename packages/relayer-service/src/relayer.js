const EthereumService = require("./services/ethereum");
const ICPService = require("./services/icp");
const logger = require("./utils/logger");
const { config } = require("./config");

class CrossChainRelayer {
  constructor() {
    this.ethereumService = new EthereumService();
    this.icpService = new ICPService();
    this.isRunning = false;
    this.processedMessages = new Set();
    this.retryQueue = new Map();
    this.metrics = {
      messagesProcessed: 0,
      messagesErrored: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
    };
  }

  async initialize() {
    try {
      logger.info("Initializing Cross-Chain Relayer...");

      // Initialize services
      await this.ethereumService.initialize();
      await this.icpService.initialize();

      // Set up graceful shutdown
      this.setupGracefulShutdown();

      logger.info("Cross-Chain Relayer initialized successfully");
    } catch (error) {
      logger.logError(error, { action: "initialize" });
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      logger.warn("Relayer is already running");
      return;
    }

    try {
      logger.info("Starting Cross-Chain Relayer...");
      this.isRunning = true;

      // Start listening for Ethereum events
      await this.ethereumService.startEventListening(
        this.handleCrossChainMessage.bind(this)
      );

      // Start retry mechanism
      this.startRetryMechanism();

      // Start metrics reporting
      this.startMetricsReporting();

      logger.info("Cross-Chain Relayer started successfully");
    } catch (error) {
      logger.logError(error, { action: "start" });
      this.isRunning = false;
      throw error;
    }
  }

  async handleCrossChainMessage(messageData) {
    const { swapId } = messageData;

    try {
      logger.logSwap(swapId, "Processing cross-chain message", {
        sourceChain: messageData.sourceChain,
        targetChain: messageData.targetChain,
        receiver: messageData.receiver,
      });

      // Check if already processed
      if (this.processedMessages.has(swapId)) {
        logger.logSwap(swapId, "Message already processed locally, skipping");
        return;
      }

      // Validate message data
      if (!this.validateMessageData(messageData)) {
        throw new Error("Invalid message data");
      }

      // Process based on target chain
      if (messageData.targetChain === "icp") {
        await this.processEthereumToICP(messageData);
      } else {
        logger.logSwap(swapId, "Unsupported target chain", {
          targetChain: messageData.targetChain,
        });
        return;
      }

      // Mark as processed locally
      this.processedMessages.add(swapId);
      this.metrics.messagesProcessed++;
      this.metrics.lastActivity = Date.now();

      logger.logSwap(swapId, "Cross-chain message processed successfully");
    } catch (error) {
      logger.logError(error, {
        action: "handleCrossChainMessage",
        swapId,
        messageData,
      });

      // Add to retry queue
      this.addToRetryQueue(swapId, messageData, error);
      this.metrics.messagesErrored++;
    }
  }

  async processEthereumToICP(messageData) {
    const { swapId } = messageData;

    try {
      // Step 1: Check if intent already exists on ICP
      const existingIntent = await this.icpService.getIntent(swapId);
      if (existingIntent) {
        logger.logSwap(
          swapId,
          "Intent already exists on ICP, marking as processed"
        );
        await this.ethereumService.markMessageProcessed(swapId);
        return;
      }

      // Step 2: Create intent on ICP canister
      logger.logSwap(swapId, "Creating intent on ICP canister...");
      await this.icpService.createIntent(messageData);

      // Step 3: Mark message as processed on Ethereum
      logger.logSwap(swapId, "Marking message as processed on Ethereum...");
      await this.ethereumService.markMessageProcessed(swapId);

      logger.logSwap(swapId, "Ethereum → ICP message processed successfully");
    } catch (error) {
      logger.logError(error, {
        action: "processEthereumToICP",
        swapId,
      });
      throw error;
    }
  }

  validateMessageData(messageData) {
    const required = [
      "swapId",
      "sourceChain",
      "targetChain",
      "receiver",
      "hashlock",
      "timelock",
    ];

    for (const field of required) {
      if (!messageData[field]) {
        logger.error(`Missing required field: ${field}`, messageData);
        return false;
      }
    }

    // Validate swapId format
    if (!/^0x[a-fA-F0-9]{64}$/.test(messageData.swapId)) {
      logger.error("Invalid swapId format", { swapId: messageData.swapId });
      return false;
    }

    // Validate hashlock format
    if (!/^0x[a-fA-F0-9]{64}$/.test(messageData.hashlock)) {
      logger.error("Invalid hashlock format", {
        hashlock: messageData.hashlock,
      });
      return false;
    }

    // Validate timelock (should be in the future)
    const currentTime = Math.floor(Date.now() / 1000);
    if (messageData.timelock <= currentTime) {
      logger.error("Timelock is in the past", {
        timelock: messageData.timelock,
        currentTime,
      });
      return false;
    }

    return true;
  }

  addToRetryQueue(swapId, messageData, error) {
    const retryData = {
      messageData,
      attempts: 0,
      lastError: error.message,
      nextRetry: Date.now() + config.relayer.retryDelay,
    };

    this.retryQueue.set(swapId, retryData);
    logger.logSwap(swapId, "Added to retry queue", {
      error: error.message,
      nextRetry: new Date(retryData.nextRetry),
    });
  }

  startRetryMechanism() {
    setInterval(async () => {
      if (this.retryQueue.size === 0) return;

      const now = Date.now();
      const toRetry = [];

      for (const [swapId, retryData] of this.retryQueue.entries()) {
        if (
          now >= retryData.nextRetry &&
          retryData.attempts < config.relayer.retryAttempts
        ) {
          toRetry.push([swapId, retryData]);
        } else if (retryData.attempts >= config.relayer.retryAttempts) {
          logger.logSwap(
            swapId,
            "Max retry attempts reached, removing from queue",
            {
              attempts: retryData.attempts,
              lastError: retryData.lastError,
            }
          );
          this.retryQueue.delete(swapId);
        }
      }

      for (const [swapId, retryData] of toRetry) {
        try {
          retryData.attempts++;
          logger.logSwap(swapId, "Retrying message processing", {
            attempt: retryData.attempts,
          });

          await this.handleCrossChainMessage(retryData.messageData);
          this.retryQueue.delete(swapId);
        } catch (error) {
          retryData.lastError = error.message;
          retryData.nextRetry =
            now + config.relayer.retryDelay * retryData.attempts;

          logger.logSwap(swapId, "Retry failed", {
            attempt: retryData.attempts,
            error: error.message,
            nextRetry: new Date(retryData.nextRetry),
          });
        }
      }
    }, config.relayer.retryDelay);
  }

  startMetricsReporting() {
    setInterval(async () => {
      try {
        const ethereumHealth = await this.ethereumService.isHealthy();
        const icpHealth = await this.icpService.isHealthy();

        const metrics = {
          ...this.metrics,
          uptime: Date.now() - this.metrics.startTime,
          retryQueueSize: this.retryQueue.size,
          processedMessagesCount: this.processedMessages.size,
          ethereum: ethereumHealth,
          icp: icpHealth,
        };

        logger.logMetrics(metrics);
      } catch (error) {
        logger.logError(error, { action: "metricsReporting" });
      }
    }, 60000); // Every minute
  }

  setupGracefulShutdown() {
    const shutdown = async () => {
      logger.info("Graceful shutdown initiated...");

      try {
        this.isRunning = false;

        await this.ethereumService.stop();
        await this.icpService.stop();

        logger.info("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        logger.logError(error, { action: "shutdown" });
        process.exit(1);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }

  async getStatus() {
    const ethereumHealth = await this.ethereumService.isHealthy();
    const icpHealth = await this.icpService.isHealthy();

    return {
      relayer: {
        running: this.isRunning,
        uptime: Date.now() - this.metrics.startTime,
        messagesProcessed: this.metrics.messagesProcessed,
        messagesErrored: this.metrics.messagesErrored,
        retryQueueSize: this.retryQueue.size,
        lastActivity: this.metrics.lastActivity,
      },
      ethereum: ethereumHealth,
      icp: icpHealth,
    };
  }
}

module.exports = CrossChainRelayer;
