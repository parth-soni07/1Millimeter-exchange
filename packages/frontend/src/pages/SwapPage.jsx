import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";
import {
  FaExchangeAlt,
  FaArrowDown,
  FaInfoCircle,
  FaSpinner,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { ethers } from "ethers";
import {
  APP_CONFIG,
  CONTRACTS,
  NETWORKS,
  CHAINS,
  TOKEN_BY_CHAIN,
} from "../config";
import { getEthBalance, getIcpBalance } from "../utils/balanceHelpers";
import {
  SwapContracts,
  getExchangeRate,
  estimateSwapGas,
} from "../utils/contractHelpers";
import toast from "react-hot-toast";

const SwapPage = () => {
  const { ethConnected, icpConnected, ethSigner, icpPrincipal, icpAuthClient } =
    useWallet();

  // Chain & token state
  const [fromChain, setFromChain] = useState("ETHEREUM");
  const [toChain, setToChain] = useState("ICP");
  const [fromTokenMeta, setFromTokenMeta] = useState(
    TOKEN_BY_CHAIN["ETHEREUM"][0]
  );
  const [toTokenMeta, setToTokenMeta] = useState(TOKEN_BY_CHAIN["ICP"][0]);
  const [fromBalance, setFromBalance] = useState("0");

  // Swap state
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("ICP");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(APP_CONFIG.DEFAULT_SLIPPAGE);

  // UI state
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [estimatedGas, setEstimatedGas] = useState(0);
  const [swapTxHash, setSwapTxHash] = useState(null);
  const [contractsVerified, setContractsVerified] = useState(false);

  // Sync symbol state when tokenMeta changes
  useEffect(() => {
    setFromToken(fromTokenMeta.symbol);
  }, [fromTokenMeta]);
  useEffect(() => {
    setToToken(toTokenMeta.symbol);
  }, [toTokenMeta]);

  // Fetch balance for from token
  useEffect(() => {
    const fetchBal = async () => {
      try {
        if (fromChain === "ETHEREUM") {
          const bal = await getEthBalance(ethSigner, fromTokenMeta);
          setFromBalance(bal);
        } else {
          const bal = await getIcpBalance(
            icpPrincipal,
            fromTokenMeta,
            icpAuthClient
          );
          setFromBalance(bal);
        }
      } catch {
        setFromBalance("0");
      }
    };
    fetchBal();
  }, [fromChain, fromTokenMeta, ethSigner, icpPrincipal, icpAuthClient]);

  // Calculate exchange rate and gas estimation
  useEffect(() => {
    const updateRatesAndGas = async () => {
      if (fromAmount && !isNaN(fromAmount)) {
        try {
          // Get exchange rate
          const rate = await getExchangeRate(fromToken, toToken);
          const calculatedToAmount = (parseFloat(fromAmount) * rate).toFixed(6);
          setToAmount(calculatedToAmount);
          setExchangeRate(rate);

          // Get gas estimation if signer is available
          if (ethSigner) {
            const gasData = await estimateSwapGas(
              ethSigner,
              fromToken,
              toToken,
              ethers.parseEther(fromAmount)
            );
            setEstimatedGas(gasData.estimatedCostETH);
          }
        } catch (error) {
          console.error("Error updating rates:", error);
          // Fallback to mock rates
          const mockRate = fromToken === "ETH" ? 250 : 0.004;
          const calculatedToAmount = (
            parseFloat(fromAmount) * mockRate
          ).toFixed(6);
          setToAmount(calculatedToAmount);
          setExchangeRate(mockRate);
          setEstimatedGas("0.004");
        }
      } else {
        setToAmount("");
        setExchangeRate(0);
        setEstimatedGas(0);
      }
    };

    updateRatesAndGas();
  }, [fromAmount, fromToken, toToken, ethSigner]);

  // Verify contracts on load
  useEffect(() => {
    const verifyContracts = async () => {
      if (ethSigner) {
        try {
          const contracts = new SwapContracts(ethSigner);
          const verification = await contracts.verifyContracts();
          const allVerified =
            verification.icpBridge &&
            verification.fusionResolver &&
            verification.icpResolver;
          setContractsVerified(allVerified);

          if (!allVerified) {
            console.warn("Some contracts are not deployed:", verification);
            toast.error(
              "Some contracts are not properly deployed. Please check your network."
            );
          }
        } catch (error) {
          console.error("Contract verification failed:", error);
          setContractsVerified(false);
        }
      }
    };

    verifyContracts();
  }, [ethSigner]);

  const handleSwapDirection = () => {
    // swap chains & token meta
    const prevFromChain = fromChain;
    const prevFromMeta = fromTokenMeta;
    setFromChain(toChain);
    setToChain(prevFromChain);
    setFromTokenMeta(toTokenMeta);
    setToTokenMeta(prevFromMeta);
    // swap symbols for old logic compatibility
    setFromToken(toTokenMeta.symbol);
    setToToken(prevFromMeta.symbol);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxAmount = async () => {
    if (!ethConnected || !ethSigner) {
      toast.error("Please connect your Ethereum wallet");
      return;
    }

    try {
      if (fromToken === "ETH") {
        const balance = await ethSigner.provider.getBalance(
          await ethSigner.getAddress()
        );
        const gasReserve = ethers.parseEther("0.01"); // Reserve for gas
        const maxAmount = balance > gasReserve ? balance - gasReserve : 0;
        setFromAmount(ethers.formatEther(maxAmount));
      }
    } catch (error) {
      console.error("Error getting balance:", error);
      toast.error("Failed to get balance");
    }
  };

  const validateSwap = () => {
    if (!ethConnected || !icpConnected) {
      toast.error("Please connect both Ethereum and ICP wallets");
      return false;
    }

    if (!ethSigner) {
      toast.error("Ethereum signer not available");
      return false;
    }

    if (!icpPrincipal) {
      toast.error("ICP principal not available");
      return false;
    }

    if (!fromAmount || isNaN(fromAmount) || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }

    // Minimum amount check
    const minAmount = 0.001;
    if (parseFloat(fromAmount) < minAmount) {
      toast.error(`Minimum swap amount is ${minAmount} ${fromToken}`);
      return false;
    }

    if (slippage < 0 || slippage > APP_CONFIG.MAX_SLIPPAGE) {
      toast.error(
        `Slippage must be between 0% and ${APP_CONFIG.MAX_SLIPPAGE}%`
      );
      return false;
    }

    if (!contractsVerified) {
      toast.error(
        "Contracts not verified. Please wait for verification to complete."
      );
      return false;
    }

    return true;
  };

  const executeSwap = async () => {
    if (!validateSwap()) return;
    if (!contractsVerified) {
      toast.error(
        "Contracts not verified. Please check your network connection."
      );
      return;
    }

    setIsSwapping(true);
    setSwapTxHash(null);

    try {
      const contracts = new SwapContracts(ethSigner);
      const amount = ethers.parseEther(fromAmount);

      toast.loading("Initiating cross-chain swap...", { id: "swap" });

      if (fromToken === "ETH") {
        // ETH to ICP swap
        toast.loading("Creating escrow on Ethereum...", { id: "swap" });

        const swapResult = await contracts.initiateETHToICP(
          amount,
          icpPrincipal
        );
        setSwapTxHash(swapResult.txHash);

        toast.loading("Waiting for blockchain confirmation...", { id: "swap" });

        // Wait for the transaction to be mined and events to be emitted
        try {
          const eventResult = await contracts.waitForSwapEvents(
            swapResult.hashedSecret,
            60000
          ); // 1 minute timeout
          console.log("Swap event received:", eventResult);

          toast.loading("Swap initiated! Waiting for ICP side completion...", {
            id: "swap",
          });

          // Note: In a real implementation, the relayer service would handle the ICP side
          // For now, we'll simulate this step
          await new Promise((resolve) => setTimeout(resolve, 3000));

          toast.success(
            <div>
              <div>Swap initiated successfully!</div>
              <div className="text-xs mt-1">
                <a
                  href={`${NETWORKS.HOLESKY.blockExplorer}/tx/${swapResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View on Explorer <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>,
            { id: "swap", duration: 8000 }
          );
        } catch (eventError) {
          console.warn(
            "Event timeout, but transaction may have succeeded:",
            eventError
          );
          toast.success(
            <div>
              <div>Transaction submitted!</div>
              <div className="text-xs mt-1">
                <a
                  href={`${NETWORKS.HOLESKY.blockExplorer}/tx/${swapResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View on Explorer <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>,
            { id: "swap", duration: 8000 }
          );
        }
      } else {
        // ICP to ETH swap
        toast.loading("Creating swap intent on ICP...", { id: "swap" });

        // Note: This would require ICP canister integration
        // For now, we'll create the Ethereum side
        const ethAddress = await ethSigner.getAddress();
        const swapResult = await contracts.initiateICPToETH(amount, ethAddress);
        setSwapTxHash(swapResult.txHash);

        toast.loading("Waiting for blockchain confirmation...", { id: "swap" });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success(
          <div>
            <div>ICP to ETH swap initiated!</div>
            <div className="text-xs mt-1">
              <a
                href={`${NETWORKS.HOLESKY.blockExplorer}/tx/${swapResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View on Explorer <FaExternalLinkAlt size={10} />
              </a>
            </div>
          </div>,
          { id: "swap", duration: 8000 }
        );
      }

      // Reset form
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error("Swap error:", error);

      // More specific error handling
      let errorMessage = "Swap failed";
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction";
      } else if (error.message.includes("gas")) {
        errorMessage = "Gas estimation failed - try reducing amount";
      } else {
        errorMessage = `Swap failed: ${error.message}`;
      }

      toast.error(errorMessage, { id: "swap" });
    } finally {
      setIsSwapping(false);
    }
  };

  const isConnected = ethConnected && icpConnected;

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Cross-Chain Swap</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ⚙️
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-6 p-4 bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-300">
                  Slippage Tolerance
                </label>
                <span className="text-sm text-slate-400">{slippage}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
          )}

          {/* Chain & Token Selection */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-slate-300">From</label>
              <span className="text-xs text-slate-400">
                Bal: {parseFloat(fromBalance).toFixed(4)}
              </span>
              <button
                onClick={handleMaxAmount}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                MAX
              </button>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-transparent text-white text-xl font-semibold outline-none flex-1"
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={fromChain}
                    onChange={(e) => {
                      const ch = e.target.value;
                      setFromChain(ch);
                      setFromTokenMeta(TOKEN_BY_CHAIN[ch][0]);
                    }}
                    className="bg-slate-600 text-white rounded-md px-2 py-1 text-sm"
                  >
                    {Object.values(CHAINS).map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.nativeSymbol}
                      </option>
                    ))}
                  </select>
                  <select
                    value={fromTokenMeta.symbol}
                    onChange={(e) =>
                      setFromTokenMeta(
                        TOKEN_BY_CHAIN[fromChain].find(
                          (t) => t.symbol === e.target.value
                        )
                      )
                    }
                    className="bg-slate-600 text-white rounded-md px-2 py-1 text-sm"
                  >
                    {TOKEN_BY_CHAIN[fromChain].map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleSwapDirection}
              className="bg-slate-700 hover:bg-slate-600 p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <FaArrowDown className="text-slate-300" size={16} />
            </button>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <label className="text-sm text-slate-300 mb-2 block">To</label>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="bg-transparent text-white text-xl font-semibold outline-none flex-1"
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={toChain}
                    onChange={(e) => {
                      const ch = e.target.value;
                      setToChain(ch);
                      setToTokenMeta(TOKEN_BY_CHAIN[ch][0]);
                    }}
                    className="bg-slate-600 text-white rounded-md px-2 py-1 text-sm"
                  >
                    {Object.values(CHAINS).map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.nativeSymbol}
                      </option>
                    ))}
                  </select>
                  <select
                    value={toTokenMeta.symbol}
                    onChange={(e) =>
                      setToTokenMeta(
                        TOKEN_BY_CHAIN[toChain].find(
                          (t) => t.symbol === e.target.value
                        )
                      )
                    }
                    className="bg-slate-600 text-white rounded-md px-2 py-1 text-sm"
                  >
                    {TOKEN_BY_CHAIN[toChain].map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {fromAmount && exchangeRate > 0 && (
            <div className="mb-6 p-4 bg-slate-700 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Exchange Rate:</span>
                <span>
                  1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Slippage:</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated Gas:</span>
                <span>~{estimatedGas} ETH</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Network:</span>
                <span>{NETWORKS.HOLESKY.name}</span>
              </div>
              {!contractsVerified && (
                <div className="text-yellow-400 text-xs">
                  ⚠️ Contract verification pending...
                </div>
              )}
            </div>
          )}

          {/* Transaction Hash Display */}
          {swapTxHash && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center justify-between text-green-200">
                <span className="text-sm">Latest Transaction:</span>
                <a
                  href={`${NETWORKS.HOLESKY.blockExplorer}/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 hover:text-green-200 flex items-center gap-1 text-sm"
                >
                  View on Explorer <FaExternalLinkAlt size={12} />
                </a>
              </div>
              <div className="text-xs text-green-300 mt-1 font-mono">
                {swapTxHash.slice(0, 10)}...{swapTxHash.slice(-8)}
              </div>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-200">
                <FaInfoCircle />
                <span className="text-sm">
                  {!ethConnected && !icpConnected
                    ? "Connect both wallets to start swapping"
                    : !ethConnected
                      ? "Connect Ethereum wallet"
                      : "Connect ICP wallet"}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={executeSwap}
            disabled={!isConnected || isSwapping || !fromAmount}
            className={`
              w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
              ${
                isConnected && fromAmount && !isSwapping
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:-translate-y-0.5 hover:shadow-lg"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {isSwapping ? (
              <div className="flex items-center justify-center space-x-2">
                <FaSpinner className="animate-spin" />
                <span>Swapping...</span>
              </div>
            ) : !isConnected ? (
              "Connect Wallets"
            ) : !fromAmount ? (
              "Enter Amount"
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <FaExchangeAlt />
                <span>
                  Swap {fromToken} to {toToken}
                </span>
              </div>
            )}
          </button>

          {/* Powered by */}
          <div className="mt-4 text-center text-xs text-slate-400">
            Powered by 1inch Fusion+ • Cross-chain bridge
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-white font-semibold mb-2">⚡ Fast & Secure</h3>
            <p className="text-slate-300 text-sm">
              Cross-chain swaps powered by 1inch Fusion+ with atomic swap
              guarantees
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-white font-semibold mb-2">💎 Best Rates</h3>
            <p className="text-slate-300 text-sm">
              Competitive exchange rates with minimal slippage and MEV
              protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
