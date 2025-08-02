const { Actor, HttpAgent } = require("@dfinity/agent");
const {
  Secp256k1KeyIdentity,
} = require("@dfinity/identity/lib/cjs/identity/secp256k1");
const { Principal } = require("@dfinity/principal");
const { config } = require("../config");
const logger = require("../utils/logger");

// ICP Canister IDL (Interface Definition Language)
const canisterIDL = ({ IDL }) => {
  const SwapStatus = IDL.Variant({
    Pending: IDL.Null,
    Claimed: IDL.Null,
    Refunded: IDL.Null,
    Expired: IDL.Null,
    Cancelled: IDL.Null,
  });

  const TokenType = IDL.Variant({
    ICP: IDL.Null,
    ICRC1: IDL.Text,
  });

  const SwapIntent = IDL.Record({
    swapId: IDL.Text,
    sender: IDL.Principal,
    receiver: IDL.Principal,
    amount: IDL.Nat,
    token: TokenType,
    hashlock: IDL.Text,
    ethereumAddress: IDL.Text,
    finalityTime: IDL.Nat64,
    withdrawalTime: IDL.Nat64,
    publicWithdrawalTime: IDL.Nat64,
    cancellationTime: IDL.Nat64,
    publicCancellationTime: IDL.Nat64,
    status: SwapStatus,
    secret: IDL.Opt(IDL.Text),
    createdAt: IDL.Nat64,
    claimedAt: IDL.Opt(IDL.Nat64),
    safetyDeposit: IDL.Nat,
  });

  const Result = IDL.Variant({
    ok: IDL.Text,
    err: IDL.Text,
  });

  return IDL.Service({
    createIntent: IDL.Func(
      [
        IDL.Text, // swapId
        IDL.Principal, // receiver
        IDL.Nat, // amount
        TokenType, // token
        IDL.Text, // hashlock
        IDL.Text, // ethereumAddress
        IDL.Nat, // timeoutHours
        IDL.Nat, // safetyDeposit
      ],
      [Result],
      []
    ),

    getIntent: IDL.Func([IDL.Text], [IDL.Opt(SwapIntent)], ["query"]),

    getSwapStage: IDL.Func([IDL.Text], [Result], ["query"]),

    canClaim: IDL.Func([IDL.Text, IDL.Text], [Result], ["query"]),

    canCancel: IDL.Func([IDL.Text], [Result], ["query"]),

    getUserSwaps: IDL.Func([IDL.Principal], [IDL.Vec(SwapIntent)], ["query"]),

    getSwapStats: IDL.Func(
      [],
      [
        IDL.Record({
          totalSwaps: IDL.Nat,
          pendingSwaps: IDL.Nat,
          claimedSwaps: IDL.Nat,
          refundedSwaps: IDL.Nat,
        }),
      ],
      ["query"]
    ),
  });
};

class ICPService {
  constructor() {
    this.agent = null;
    this.identity = null;
    this.canisterActor = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      logger.info("Initializing ICP service...");

      // Create identity from seed
      this.identity = this.createIdentityFromSeed(config.icp.identitySeed);
      logger.info("Identity created:", {
        principal: this.identity.getPrincipal().toString(),
      });

      // Create agent
      this.agent = new HttpAgent({
        host: config.icp.host,
        identity: this.identity,
      });

      // Fetch root key for local development
      if (config.icp.host.includes("localhost")) {
        await this.agent.fetchRootKey();
      }

      // Create canister actor
      this.canisterActor = Actor.createActor(canisterIDL, {
        agent: this.agent,
        canisterId: config.icp.canisterId,
      });

      // Test connection
      await this.getSwapStats();

      this.isConnected = true;
      logger.info("ICP service initialized successfully");
    } catch (error) {
      logger.logError(error, { service: "icp", action: "initialize" });
      throw error;
    }
  }

  createIdentityFromSeed(seed) {
    // Convert seed to buffer for key generation
    const seedBuffer = Buffer.from(seed, "utf8");
    const hash = require("crypto")
      .createHash("sha256")
      .update(seedBuffer)
      .digest();

    // Create secp256k1 identity
    return Secp256k1KeyIdentity.fromSecretKey(hash);
  }

  async createIntent(messageData) {
    try {
      const { swapId, receiver, hashlock, timelock, timestamp } = messageData;

      logger.logSwap(swapId, "Creating intent on ICP canister...", {
        receiver,
        hashlock: hashlock.substring(0, 10) + "...",
      });

      // Convert hex swapId to text
      const swapIdText = swapId;

      // Convert receiver address to Principal
      // For cross-chain, we need to map Ethereum addresses to ICP principals
      // This is a simplified approach - in production you'd have a proper mapping
      const receiverPrincipal = await this.addressToPrincipal(receiver);

      // Calculate timeout hours from timelock
      const currentTime = Math.floor(Date.now() / 1000);
      const timeoutHours = Math.max(
        1,
        Math.floor((timelock - currentTime) / 3600)
      );

      // Default values for ICP swap
      const amount = BigInt(1000000); // 1 ICP in e8s
      const tokenType = { ICP: null };
      const safetyDeposit = BigInt(50000); // 0.0005 ICP safety deposit

      const result = await this.canisterActor.createIntent(
        swapIdText,
        receiverPrincipal,
        amount,
        tokenType,
        hashlock,
        receiver, // Store original Ethereum address
        timeoutHours,
        safetyDeposit
      );

      if ("ok" in result) {
        logger.logSwap(swapId, "Intent created successfully on ICP", {
          result: result.ok,
        });
        return result.ok;
      } else {
        throw new Error(`Failed to create intent: ${result.err}`);
      }
    } catch (error) {
      logger.logError(error, {
        service: "icp",
        action: "createIntent",
        swapId: messageData.swapId,
      });
      throw error;
    }
  }

  async addressToPrincipal(ethereumAddress) {
    // Simple mapping for demo - in production you'd have a proper registry
    // For now, create a deterministic principal from the Ethereum address
    const hash = require("crypto")
      .createHash("sha256")
      .update(ethereumAddress.toLowerCase())
      .digest();

    // Take first 29 bytes and create principal
    const principalBytes = hash.slice(0, 29);
    return Principal.fromUint8Array(principalBytes);
  }

  async getIntent(swapId) {
    try {
      const result = await this.canisterActor.getIntent(swapId);
      return result[0] || null; // Option type
    } catch (error) {
      logger.logError(error, {
        service: "icp",
        action: "getIntent",
        swapId,
      });
      return null;
    }
  }

  async getSwapStage(swapId) {
    try {
      const result = await this.canisterActor.getSwapStage(swapId);
      if ("ok" in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      logger.logError(error, {
        service: "icp",
        action: "getSwapStage",
        swapId,
      });
      return null;
    }
  }

  async getSwapStats() {
    try {
      const stats = await this.canisterActor.getSwapStats();
      return {
        totalSwaps: Number(stats.totalSwaps),
        pendingSwaps: Number(stats.pendingSwaps),
        claimedSwaps: Number(stats.claimedSwaps),
        refundedSwaps: Number(stats.refundedSwaps),
      };
    } catch (error) {
      logger.logError(error, { service: "icp", action: "getSwapStats" });
      return {
        totalSwaps: 0,
        pendingSwaps: 0,
        claimedSwaps: 0,
        refundedSwaps: 0,
      };
    }
  }

  async getUserSwaps(userPrincipal) {
    try {
      const swaps = await this.canisterActor.getUserSwaps(userPrincipal);
      return swaps.map((swap) => ({
        ...swap,
        amount: Number(swap.amount),
        finalityTime: Number(swap.finalityTime),
        withdrawalTime: Number(swap.withdrawalTime),
        publicWithdrawalTime: Number(swap.publicWithdrawalTime),
        cancellationTime: Number(swap.cancellationTime),
        publicCancellationTime: Number(swap.publicCancellationTime),
        createdAt: Number(swap.createdAt),
        claimedAt: swap.claimedAt[0] ? Number(swap.claimedAt[0]) : null,
        safetyDeposit: Number(swap.safetyDeposit),
      }));
    } catch (error) {
      logger.logError(error, {
        service: "icp",
        action: "getUserSwaps",
        userPrincipal: userPrincipal.toString(),
      });
      return [];
    }
  }

  async isHealthy() {
    try {
      const stats = await this.getSwapStats();
      const identity = this.identity?.getPrincipal();

      return {
        connected: this.isConnected,
        canisterId: config.icp.canisterId,
        principal: identity?.toString(),
        stats,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async stop() {
    this.isConnected = false;
    logger.info("ICP service stopped");
  }
}

module.exports = ICPService;
