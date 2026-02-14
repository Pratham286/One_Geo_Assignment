import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiBarChart2 } from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2 text-white">
            <FiBarChart2 size={32} />
            <span className="text-xl font-bold">Well Log Analyzer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-blue-200 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/upload" 
              className="text-white hover:text-blue-200 transition-colors duration-200 font-medium"
            >
              Upload
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-white rounded p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block text-white hover:bg-blue-700 px-4 py-2 rounded transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className="block text-white hover:bg-blue-700 px-4 py-2 rounded transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Upload
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;