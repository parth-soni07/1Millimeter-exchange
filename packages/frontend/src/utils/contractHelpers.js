import { ethers } from "ethers";
import { CONTRACTS } from "../config";

// Contract ABIs (simplified for the functions we need)
const ICPBridge_ABI = [
  "function initiateCrossChainSwap(bytes32 hashedSecret, uint256 lockTime, string memory icpAddress) public payable",
  "function completeCrossChainSwap(bytes32 hashedSecret, bytes32 secret) public",
  "function cancelCrossChainSwap(bytes32 hashedSecret) public",
  "function getSafetyDeposit() public view returns (uint256)",
  "event CrossChainMessage(address indexed sender, string icpAddress, uint256 amount, bytes32 hashedSecret, uint256 lockTime)",
];

const FusionResolver_ABI = [
  "function createFusionOrder(uint256 makerAmount, uint256 takerAmount, address takerToken, uint256 deadline, bytes memory orderData) public payable returns (bytes32)",
  "function fillFusionOrder(bytes32 orderId, uint256 fillAmount, bytes memory fillData) public",
  "function completeCrossChainSwap(bytes32 orderId, bytes32 secret, bytes memory proof) public",
  "function cancelFusionOrder(bytes32 orderId) public",
  "event OrderCreated(bytes32 indexed orderId, address indexed maker, uint256 makerAmount, uint256 takerAmount)",
];

const ICPResolver_ABI = [
  "function deploySrcWithICP(bytes32 hashedSecret, uint256 lockTime, string memory icpAddress) public payable returns (address)",
  "function deployDstWithICP(bytes32 hashedSecret, uint256 lockTime, address ethAddress) public payable returns (address)",
  "function withdrawWithICP(address escrow, bytes32 secret) public",
  "function cancelWithICP(address escrow) public",
  "function completeICPSwap(bytes32 swapId, bytes32 secret, bytes memory proof) public",
  "event ICPSwapInitiated(bytes32 indexed swapId, address indexed user, uint256 amount, string icpAddress)",
];

// Helper functions
export const generateSecret = () => {
  const randomBytes = ethers.randomBytes(32);
  return ethers.hexlify(randomBytes);
};

export const hashSecret = (secret) => {
  return ethers.keccak256(secret);
};

export const calculateLockTime = (hours = 24) => {
  const now = Math.floor(Date.now() / 1000);
  return now + hours * 3600; // Default 24 hours
};

// Contract interaction functions
export class SwapContracts {
  constructor(signer) {
    this.signer = signer;
    this.icpBridge = new ethers.Contract(
      CONTRACTS.ICP_BRIDGE,
      ICPBridge_ABI,
      signer
    );
    this.fusionResolver = new ethers.Contract(
      CONTRACTS.FUSION_RESOLVER,
      FusionResolver_ABI,
      signer
    );
    this.icpResolver = new ethers.Contract(
      CONTRACTS.ICP_RESOLVER,
      ICPResolver_ABI,
      signer
    );
  }

  // ETH to ICP swap
  async initiateETHToICP(amount, icpAddress) {
    try {
      // Generate secret and hash
      const secret = generateSecret();
      const hashedSecret = hashSecret(secret);
      const lockTime = calculateLockTime(24); // 24 hours

      console.log("Initiating ETH to ICP swap...", {
        amount: ethers.formatEther(amount),
        icpAddress,
        hashedSecret,
        lockTime,
      });

      // Get safety deposit requirement
      const safetyDeposit = await this.icpBridge.getSafetyDeposit();
      const totalValue = BigInt(amount) + BigInt(safetyDeposit);

      // Initiate cross-chain swap
      const tx = await this.icpBridge.initiateCrossChainSwap(
        hashedSecret,
        lockTime,
        icpAddress,
        { value: totalValue }
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return {
        txHash: tx.hash,
        secret,
        hashedSecret,
        lockTime,
        amount: amount.toString(),
        icpAddress,
      };
    } catch (error) {
      console.error("ETH to ICP swap failed:", error);
      throw new Error(`ETH to ICP swap failed: ${error.message}`);
    }
  }

  // ICP to ETH swap using ICP Resolver
  async initiateICPToETH(amount, ethAddress) {
    try {
      const secret = generateSecret();
      const hashedSecret = hashSecret(secret);
      const lockTime = calculateLockTime(24);

      console.log("Initiating ICP to ETH swap...", {
        amount: ethers.formatEther(amount),
        ethAddress,
        hashedSecret,
        lockTime,
      });

      // Deploy destination escrow
      const tx = await this.icpResolver.deployDstWithICP(
        hashedSecret,
        lockTime,
        ethAddress
      );

      console.log("ICP to ETH transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("ICP to ETH transaction confirmed:", receipt);

      return {
        txHash: tx.hash,
        secret,
        hashedSecret,
        lockTime,
        amount: amount.toString(),
        ethAddress,
      };
    } catch (error) {
      console.error("ICP to ETH swap failed:", error);
      throw new Error(`ICP to ETH swap failed: ${error.message}`);
    }
  }

  // Complete swap by revealing secret
  async completeSwap(swapData, isETHToICP = true) {
    try {
      const { secret, hashedSecret } = swapData;

      console.log("Completing swap...", { hashedSecret, isETHToICP });

      let tx;
      if (isETHToICP) {
        // Complete ETH to ICP swap
        tx = await this.icpBridge.completeCrossChainSwap(hashedSecret, secret);
      } else {
        // Complete ICP to ETH swap
        tx = await this.icpResolver.withdrawWithICP(
          swapData.escrowAddress,
          secret
        );
      }

      console.log("Complete swap transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Swap completed:", receipt);

      return {
        txHash: tx.hash,
        receipt,
      };
    } catch (error) {
      console.error("Complete swap failed:", error);
      throw new Error(`Complete swap failed: ${error.message}`);
    }
  }

  // Cancel swap (timelock expired)
  async cancelSwap(swapData, isETHToICP = true) {
    try {
      const { hashedSecret } = swapData;

      console.log("Cancelling swap...", { hashedSecret, isETHToICP });

      let tx;
      if (isETHToICP) {
        tx = await this.icpBridge.cancelCrossChainSwap(hashedSecret);
      } else {
        tx = await this.icpResolver.cancelWithICP(swapData.escrowAddress);
      }

      console.log("Cancel swap transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Swap cancelled:", receipt);

      return {
        txHash: tx.hash,
        receipt,
      };
    } catch (error) {
      console.error("Cancel swap failed:", error);
      throw new Error(`Cancel swap failed: ${error.message}`);
    }
  }

  // Listen for events
  async waitForSwapEvents(hashedSecret, timeout = 300000) {
    // 5 minutes default
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timeout waiting for swap events"));
      }, timeout);

      // Listen for CrossChainMessage event
      this.icpBridge.on(
        "CrossChainMessage",
        (sender, icpAddress, amount, eventHashedSecret, lockTime, event) => {
          if (eventHashedSecret === hashedSecret) {
            clearTimeout(timeoutId);
            resolve({
              type: "CrossChainMessage",
              sender,
              icpAddress,
              amount: amount.toString(),
              hashedSecret: eventHashedSecret,
              lockTime: lockTime.toString(),
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            });
          }
        }
      );

      // Listen for ICP swap events
      this.icpResolver.on(
        "ICPSwapInitiated",
        (swapId, user, amount, icpAddress, event) => {
          clearTimeout(timeoutId);
          resolve({
            type: "ICPSwapInitiated",
            swapId,
            user,
            amount: amount.toString(),
            icpAddress,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      );
    });
  }

  // Get contract addresses for verification
  getContractAddresses() {
    return {
      icpBridge: this.icpBridge.target,
      fusionResolver: this.fusionResolver.target,
      icpResolver: this.icpResolver.target,
    };
  }

  // Check if contracts are deployed
  async verifyContracts() {
    try {
      const [icpBridgeCode, fusionResolverCode, icpResolverCode] =
        await Promise.all([
          this.signer.provider.getCode(CONTRACTS.ICP_BRIDGE),
          this.signer.provider.getCode(CONTRACTS.FUSION_RESOLVER),
          this.signer.provider.getCode(CONTRACTS.ICP_RESOLVER),
        ]);

      return {
        icpBridge: icpBridgeCode !== "0x",
        fusionResolver: fusionResolverCode !== "0x",
        icpResolver: icpResolverCode !== "0x",
      };
    } catch (error) {
      console.error("Contract verification failed:", error);
      return {
        icpBridge: false,
        fusionResolver: false,
        icpResolver: false,
      };
    }
  }
}

// Exchange rate helpers (mock for now, can be replaced with real price feeds)
export const getExchangeRate = async (fromToken, toToken) => {
  // Mock exchange rates - replace with real price feed
  const mockRates = {
    ETH_ICP: 250, // 1 ETH = 250 ICP
    ICP_ETH: 0.004, // 1 ICP = 0.004 ETH
  };

  const rateKey = `${fromToken}_${toToken}`;
  return mockRates[rateKey] || 1;
};

// Gas estimation helper
export const estimateSwapGas = async (signer, fromToken, toToken, amount) => {
  try {
    const contracts = new SwapContracts(signer);

    // Mock gas estimation
    const mockGasLimit = fromToken === "ETH" ? 150000 : 100000;
    const gasPrice = await signer.provider.getFeeData();

    const estimatedCost =
      BigInt(mockGasLimit) *
      BigInt(gasPrice.gasPrice || ethers.parseUnits("20", "gwei"));

    return {
      gasLimit: mockGasLimit,
      gasPrice:
        gasPrice.gasPrice?.toString() ||
        ethers.parseUnits("20", "gwei").toString(),
      estimatedCost: estimatedCost.toString(),
      estimatedCostETH: ethers.formatEther(estimatedCost),
    };
  } catch (error) {
    console.error("Gas estimation failed:", error);
    return {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits("20", "gwei").toString(),
      estimatedCost: ethers.parseUnits("0.004", "ether").toString(),
      estimatedCostETH: "0.004",
    };
  }
};
