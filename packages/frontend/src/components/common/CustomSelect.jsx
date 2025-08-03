import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

/**
 * Generic dropdown replacement for native <select> to enable full Tailwind styling.
 *
 * Props:
 *  - value: current value (primitive)
 *  - options: Array<{ label: string; value: string | number }>
 *  - onChange: (newValue) => void
 *  - widthClass: optional tailwind width override (defaults w-24 sm:w-28)
 */
const CustomSelect = ({
  value,
  options,
  onChange,
  widthClass = "w-24 sm:w-28",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={containerRef} className={`relative text-left ${widthClass}`}>
      <button
        type="button"
        className="bg-slate-700/80 text-white rounded-md px-3 py-2 text-sm border border-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between w-full"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate mr-2">{selectedLabel}</span>
        <FaChevronDown className="text-xs" />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-md bg-slate-800 border border-indigo-600/40 shadow-lg max-h-60 overflow-auto backdrop-blur-md">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-indigo-600/60 hover:text-white ${
                opt.value === value
                  ? "bg-indigo-600/40 text-white"
                  : "text-slate-300"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
