const http = require("http");
const CrossChainRelayer = require("./relayer");
const { config, validateConfig } = require("./config");
const logger = require("./utils/logger");

// Health check server
function createHealthCheckServer(relayer) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      switch (url.pathname) {
        case "/health":
          const status = await relayer.getStatus();
          const isHealthy =
            status.relayer.running &&
            status.ethereum.connected &&
            status.icp.connected;

          res.writeHead(isHealthy ? 200 : 503);
          res.end(
            JSON.stringify(
              {
                status: isHealthy ? "healthy" : "unhealthy",
                timestamp: new Date().toISOString(),
                ...status,
              },
              null,
              2
            )
          );
          break;

        case "/metrics":
          const metrics = await relayer.getStatus();
          res.writeHead(200);
          res.end(
            JSON.stringify(
              {
                timestamp: new Date().toISOString(),
                ...metrics,
              },
              null,
              2
            )
          );
          break;

        case "/config":
          // Return sanitized config (no private keys)
          const sanitizedConfig = {
            ethereum: {
              rpcUrl: config.ethereum.rpcUrl,
              chainId: config.ethereum.chainId,
              contracts: config.ethereum.contracts,
              gas: config.ethereum.gas,
            },
            icp: {
              host: config.icp.host,
              canisterId: config.icp.canisterId,
            },
            relayer: config.relayer,
          };
          res.writeHead(200);
          res.end(JSON.stringify(sanitizedConfig, null, 2));
          break;

        default:
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Not found" }));
      }
    } catch (error) {
      logger.logError(error, { endpoint: url.pathname });
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });

  return server;
}

async function main() {
  try {
    // Validate configuration
    validateConfig();
    logger.info("Configuration validated successfully");

    // Create and initialize relayer
    const relayer = new CrossChainRelayer();
    await relayer.initialize();

    // Create health check server
    const healthServer = createHealthCheckServer(relayer);
    healthServer.listen(config.relayer.healthCheckPort, () => {
      logger.info(
        `Health check server listening on port ${config.relayer.healthCheckPort}`
      );
      logger.info(
        `Health endpoint: http://localhost:${config.relayer.healthCheckPort}/health`
      );
      logger.info(
        `Metrics endpoint: http://localhost:${config.relayer.healthCheckPort}/metrics`
      );
    });

    // Start relayer
    await relayer.start();

    // Log startup information
    logger.info("🚀 Cross-Chain Relayer started successfully!", {
      ethereum: {
        network: config.ethereum.chainId,
        bridge: config.ethereum.contracts.icpBridge,
      },
      icp: {
        host: config.icp.host,
        canisterId: config.icp.canisterId,
      },
      relayer: {
        name: config.relayer.name,
        pollingInterval: config.relayer.pollingInterval,
        healthPort: config.relayer.healthCheckPort,
      },
    });

    // Keep process alive
    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      healthServer.close();
    });

    process.on("SIGINT", () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      healthServer.close();
    });
  } catch (error) {
    logger.logError(error, { action: "startup" });
    logger.error("❌ Failed to start Cross-Chain Relayer");
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.logError(error, { type: "uncaughtException" });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the relayer
if (require.main === module) {
  main();
}

module.exports = { main, CrossChainRelayer };
