import React from "react";
import {
  FaEthereum,
  FaInfinity,
  FaShieldAlt,
  FaRocket,
  FaBolt,
  FaUsers,
} from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            About 1millimeter Exchange
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The first intent-based cross-chain swap protocol connecting Ethereum
            and Internet Computer, powered by 1inch Fusion+ technology for
            seamless, secure, and efficient trading.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-600/20 p-3 rounded-lg mr-4">
                <FaEthereum className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Ethereum Integration
              </h3>
            </div>
            <p className="text-slate-300">
              Seamless connection with Ethereum ecosystem through MetaMask and
              other Web3 wallets, supporting ERC-20 tokens and smart contract
              interactions.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600/20 p-3 rounded-lg mr-4">
                <FaInfinity className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">ICP Network</h3>
            </div>
            <p className="text-slate-300">
              Direct integration with Internet Computer using Internet Identity
              and native ICP protocols, enabling fast and low-cost transactions.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-green-600/20 p-3 rounded-lg mr-4">
                <FaShieldAlt className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">
                1inch Fusion+
              </h3>
            </div>
            <p className="text-slate-300">
              Built on 1inch Fusion+ technology providing intent-based swaps,
              MEV protection, and optimal execution with Dutch auction
              mechanisms.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600/20 p-3 rounded-lg mr-4">
                <FaBolt className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">Atomic Swaps</h3>
            </div>
            <p className="text-slate-300">
              Time-locked contracts ensure atomic execution - either both sides
              of the swap complete successfully, or the entire transaction is
              safely reverted.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-600/20 p-3 rounded-lg mr-4">
                <FaRocket className="text-yellow-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Cross-Chain Bridge
              </h3>
            </div>
            <p className="text-slate-300">
              Advanced relayer network facilitates communication between
              Ethereum and ICP networks, ensuring reliable and fast cross-chain
              transactions.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-pink-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-pink-600/20 p-3 rounded-lg mr-4">
                <FaUsers className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Community Driven
              </h3>
            </div>
            <p className="text-slate-300">
              Open-source protocol built for the community, with transparent
              governance and community-driven development roadmap.
            </p>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Technical Architecture
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaEthereum className="text-indigo-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Ethereum Layer
              </h3>
              <p className="text-slate-300 text-sm">
                Smart contracts deployed on Holesky testnet handling escrow,
                time locks, and 1inch Fusion+ integration.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-purple-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Relayer Network
              </h3>
              <p className="text-slate-300 text-sm">
                Off-chain service monitoring events and facilitating
                communication between Ethereum and ICP networks.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaInfinity className="text-green-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                ICP Canister
              </h3>
              <p className="text-slate-300 text-sm">
                Motoko-based HTLC canister managing ICP-side swap logic,
                timeouts, and cross-chain state verification.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 border border-indigo-500/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Security First
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Multi-Stage Timeouts
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Finality timeout for transaction confirmation</li>
                <li>• Withdrawal timeout for authorized claims</li>
                <li>• Public withdrawal for decentralized recovery</li>
                <li>• Cancellation timeout for safe refunds</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                MEV Protection
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li>• 1inch Fusion+ Dutch auction mechanism</li>
                <li>• Intent-based execution prevents front-running</li>
                <li>• Resolver competition for best prices</li>
                <li>• Gasless transactions for end users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
