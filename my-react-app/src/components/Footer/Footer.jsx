import React from "react";
import { FaTwitter, FaGithub, FaTelegram, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-200 pt-20 relative overflow-hidden">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-600/40 to-transparent"></div>

      <div className="max-w-6xl mx-auto px-8">
        <div className="grid lg:grid-cols-3 gap-16 mb-16">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Unite DeFi
            </h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Empowering the future of decentralized finance with innovative
              solutions for everyone.
            </p>
            <div className="flex gap-5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-slate-400 text-2xl hover:text-indigo-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaTwitter />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-400 text-2xl hover:text-indigo-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaGithub />
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="text-slate-400 text-2xl hover:text-indigo-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaTelegram />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="text-slate-400 text-2xl hover:text-indigo-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaDiscord />
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600">
                Platform
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#tokenomics"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Tokenomics
                  </a>
                </li>
                <li>
                  <a
                    href="#roadmap"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#documentation"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#whitepaper"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a
                    href="#blog"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#about"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#team"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#careers"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-slate-400 hover:text-indigo-600 transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-slate-700/20 pt-6 pb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Unite DeFi. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="#privacy"
              className="text-slate-400 hover:text-indigo-600 transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="#terms"
              className="text-slate-400 hover:text-indigo-600 transition-colors duration-300"
            >
              Terms of Service
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="#cookies"
              className="text-slate-400 hover:text-indigo-600 transition-colors duration-300"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
