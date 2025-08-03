import React from "react";
import { Link, useLocation } from "react-router-dom";
import WalletStatus from "../WalletConnection/WalletStatus";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Swap", path: "/swap" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="bg-gray-900 h-20 flex justify-center items-center text-lg sticky top-0 z-50 shadow-md">
      <div className="flex justify-between items-center h-20 w-full max-w-[1500px] px-4 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent cursor-pointer"
        >
          1millimeter Exchange
        </Link>

        <div className="flex items-center space-x-4 sm:space-x-8">
          <ul className="hidden md:flex list-none text-center">
            {navItems.map((item) => (
              <li key={item.name} className="h-20 mx-4 flex items-center">
                <Link
                  to={item.path}
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "text-indigo-300 border-b-2 border-indigo-300"
                      : "hover:text-indigo-300"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <WalletStatus />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
