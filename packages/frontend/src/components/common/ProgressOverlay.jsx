import React from "react";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

const ProgressOverlay = ({ isOpen, message, done }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm text-center border border-indigo-700/40 shadow-xl">
        {done ? (
          <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-4" />
        ) : (
          <FaSpinner className="animate-spin text-purple-400 text-4xl mx-auto mb-4" />
        )}
        <p className="text-lg text-slate-200 whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
};

export default ProgressOverlay;
