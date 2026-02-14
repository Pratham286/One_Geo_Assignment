import React from 'react';
import { FiGithub, FiLinkedin, FiGlobe, FiHeart } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Left Side - Brand/Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">
              © {currentYear} Well Log Analyzer.
            </p>
          </div>

          {/* Center - Developer Credit */}
          <div className="flex items-center space-x-1 text-sm text-gray-300">
            <span>Developed by Pratham</span>
          </div>

          {/* Right Side - Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/Pratham286"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="GitHub"
            >
              <FiGithub size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/pratham-chaurasiya-a3a96a251/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={20} />
            </a>
            <a
              href="https://portfolio-giye.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Portfolio"
            >
              <FiGlobe size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;