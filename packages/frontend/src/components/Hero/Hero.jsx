import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext";

const Hero = () => {
  const { ethConnected, icpConnected } = useWallet();
  const bothConnected = ethConnected && icpConnected;

  return (
    <section
      className="bg-slate-900 text-white py-24 px-8 min-h-screen flex items-center relative overflow-hidden"
      id="home"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-600/10 via-transparent to-transparent opacity-40"></div>
      <div
        className="absolute inset-0 bg-gradient-radial from-purple-600/10 via-transparent to-transparent opacity-40"
        style={{ backgroundPosition: "90% 80%" }}
      ></div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Cross-Chain DeFi Simplified
          </h1>
          <p className="text-xl text-slate-300 mb-6 leading-relaxed">
            Swap between Ethereum and Internet Computer seamlessly. Powered by
            1inch Fusion+ for intent-based trading with MEV protection and
            atomic swaps.
          </p>

          {/* Connection Status */}
          <div className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Wallet Status:</span>
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center space-x-1 ${ethConnected ? "text-green-400" : "text-slate-400"}`}
                >
                  <span>⟠ ETH</span>
                  <span>{ethConnected ? "✓" : "○"}</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${icpConnected ? "text-green-400" : "text-slate-400"}`}
                >
                  <span>∞ ICP</span>
                  <span>{icpConnected ? "✓" : "○"}</span>
                </div>
              </div>
            </div>
            {bothConnected && (
              <p className="text-green-400 text-xs mt-2">
                ✨ Ready for cross-chain swaps!
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/swap"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-center"
            >
              {bothConnected ? "Start Swapping" : "Connect & Swap"}
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-300 font-semibold rounded-full text-lg hover:bg-indigo-600/10 transform hover:-translate-y-0.5 transition-all duration-300 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="relative h-full min-h-96">
          {/* Gradient circle background */}
          <div className="absolute w-96 h-96 bg-gradient-radial from-indigo-600/20 to-transparent rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>

          {/* Crypto cards */}
          <div className="relative grid gap-6 p-8 bg-slate-800/50 backdrop-blur-lg rounded-3xl border border-white/10">
            <div className="flex justify-between items-center p-5 rounded-2xl font-semibold text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-gradient-to-br from-orange-500 to-yellow-500">
              <span className="text-lg">BTC</span>
              <span className="text-green-400">+5.2%</span>
            </div>
            <div className="flex justify-between items-center p-5 rounded-2xl font-semibold text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-lg">ETH</span>
              <span className="text-green-400">+3.8%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
