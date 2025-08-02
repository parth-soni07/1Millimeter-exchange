import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 h-20 flex justify-center items-center text-lg sticky top-0 z-10 shadow-md">
      <div className="flex justify-between items-center h-20 w-full max-w-[1500px] px-12">
        <div className="text-white text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent cursor-pointer">
          Unite DeFi
        </div>
        <ul className="flex list-none text-center mr-8">
          {['Home', 'Features', 'About', 'Contact'].map((item) => (
            <li key={item} className="h-20 mx-4 flex items-center">
              <a 
                href={`#${item.toLowerCase()}`} 
                className="text-white px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-300 transition-colors duration-200"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
