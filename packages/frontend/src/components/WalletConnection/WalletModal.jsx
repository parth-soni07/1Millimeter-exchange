import React from "react";
import Modal from "react-modal";
import { useWallet } from "../../contexts/WalletContext";
import {
  FaTimes,
  FaEthereum,
  FaInfinity,
  FaSpinner,
  FaCheck,
} from "react-icons/fa";

// Set app element for accessibility
Modal.setAppElement("#root");

const WalletModal = ({ isOpen, onClose }) => {
  const {
    ethConnected,
    ethConnecting,
    ethAccount,
    icpConnected,
    icpConnecting,
    icpPrincipal,
    connectEthereum,
    connectICP,
    disconnectEthereum,
    disconnectICP,
    isMetaMaskInstalled,
  } = useWallet();

  const modalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000,
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "#1e293b",
      border: "1px solid #475569",
      borderRadius: "16px",
      padding: "0",
      width: "90%",
      maxWidth: "500px",
      maxHeight: "80vh",
      overflow: "auto",
    },
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncatePrincipal = (principal) => {
    if (!principal) return "";
    return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <div className="bg-slate-800 text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 className="text-xl font-bold">Connect Wallets</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm">
            Connect both Ethereum and ICP wallets to enable cross-chain swaps
          </p>

          {/* Ethereum Connection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaEthereum className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold">Ethereum Wallet</h3>
              {ethConnected && <FaCheck className="text-green-400" size={16} />}
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              {ethConnected ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Address:</span>
                    <span className="text-sm font-mono">
                      {truncateAddress(ethAccount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Network:</span>
                    <span className="text-sm text-green-400">
                      Holesky Testnet
                    </span>
                  </div>
                  <button
                    onClick={disconnectEthereum}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!isMetaMaskInstalled() ? (
                    <div className="text-center">
                      <p className="text-sm text-slate-300 mb-3">
                        MetaMask not detected
                      </p>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-md transition-colors text-sm"
                      >
                        Install MetaMask
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={connectEthereum}
                      disabled={ethConnecting}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                      {ethConnecting && <FaSpinner className="animate-spin" />}
                      <span>
                        {ethConnecting ? "Connecting..." : "Connect MetaMask"}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ICP Connection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaInfinity className="text-purple-400" size={24} />
              <h3 className="text-lg font-semibold">ICP Wallet</h3>
              {icpConnected && <FaCheck className="text-green-400" size={16} />}
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              {icpConnected ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Principal:</span>
                    <span className="text-sm font-mono">
                      {truncatePrincipal(icpPrincipal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Network:</span>
                    <span className="text-sm text-green-400">
                      Local Testnet
                    </span>
                  </div>
                  <button
                    onClick={disconnectICP}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-300">
                    Connect using Internet Identity or other ICP wallet
                  </p>
                  <button
                    onClick={connectICP}
                    disabled={icpConnecting}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {icpConnecting && <FaSpinner className="animate-spin" />}
                    <span>
                      {icpConnecting ? "Connecting..." : "Connect ICP Wallet"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Cross-chain Ready:</span>
              <span
                className={`text-sm font-semibold ${
                  ethConnected && icpConnected
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {ethConnected && icpConnected ? "✅ Ready" : "⚠️ Partial"}
              </span>
            </div>
            {!(ethConnected && icpConnected) && (
              <p className="text-xs text-slate-400 mt-2">
                Connect both wallets to enable cross-chain swaps
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors"
          >
            {ethConnected && icpConnected ? "Start Trading" : "Close"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WalletModal;
