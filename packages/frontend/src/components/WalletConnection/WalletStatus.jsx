import React, { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { FaEthereum, FaInfinity, FaWallet, FaSpinner } from "react-icons/fa";
import WalletModal from "./WalletModal";
import toast from "react-hot-toast";

const WalletStatus = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    ethConnected,
    ethConnecting,
    ethAccount,
    icpConnected,
    icpConnecting,
    icpPrincipal,
  } = useWallet();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncatePrincipal = (principal) => {
    if (!principal) return "";
    return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  };

  const isAnyConnecting = ethConnecting || icpConnecting;
  const bothConnected = ethConnected && icpConnected;
  const anyConnected = ethConnected || icpConnected;

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Connection Status Indicators */}
        {anyConnected && (
          <div className="flex items-center space-x-1">
            {ethConnected && (
              <div
                onClick={() => copyToClipboard(ethAccount)}
                className="flex items-center space-x-1 bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-blue-600/30"
                title="Copy ETH address"
              >
                <FaEthereum size={12} />
                <span className="hidden sm:inline">
                  {truncateAddress(ethAccount)}
                </span>
              </div>
            )}
            {icpConnected && (
              <div
                onClick={() => copyToClipboard(icpPrincipal)}
                className="flex items-center space-x-1 bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-purple-600/30"
                title="Copy ICP principal"
              >
                <FaInfinity size={12} />
                <span className="hidden sm:inline">
                  {truncatePrincipal(icpPrincipal)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main Connect Button */}
        <button
          onClick={openModal}
          disabled={isAnyConnecting}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${
              bothConnected
                ? "bg-green-600 hover:bg-green-700 text-white"
                : anyConnected
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }
            ${isAnyConnecting ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg transform hover:-translate-y-0.5"}
          `}
        >
          {isAnyConnecting ? (
            <>
              <FaSpinner className="animate-spin" size={14} />
              <span className="hidden sm:inline">Connecting...</span>
            </>
          ) : bothConnected ? (
            <>
              <FaWallet size={14} />
              <span className="hidden sm:inline">Connected</span>
            </>
          ) : anyConnected ? (
            <>
              <FaWallet size={14} />
              <span className="hidden sm:inline">Partial</span>
            </>
          ) : (
            <>
              <FaWallet size={14} />
              <span className="hidden sm:inline">Connect Wallets</span>
              <span className="sm:hidden">Connect</span>
            </>
          )}
        </button>
      </div>

      {/* Wallet Modal */}
      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default WalletStatus;
