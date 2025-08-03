import React from "react";
import Modal from "react-modal";
import { FaCheckCircle } from "react-icons/fa";

Modal.setAppElement("#root");

const TxVerifiedModal = ({ isOpen, onClose, txHash }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      className="outline-none"
    >
      <div className="bg-slate-800 rounded-2xl p-8 mx-4 shadow-xl border border-indigo-700/40 max-w-md w-full text-center">
        <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Transaction Verified
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Your cross-chain swap has been verified on-chain.
        </p>
        {txHash && (
          <div className="bg-slate-700/60 rounded-lg p-3 break-all text-xs text-slate-300 mb-6 font-mono">
            {txHash}
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default TxVerifiedModal;
