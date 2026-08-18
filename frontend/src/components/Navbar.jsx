import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-msd-teal shadow-md text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-wider text-white">AGREEMENT</span>
              <span className="text-xs bg-white text-msd-teal font-bold px-2 py-0.5 rounded uppercase">PLATFORM</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-msd-teal-dark transition-colors">
              Home
            </Link>
            <Link to="/generate" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-msd-teal-dark transition-colors">
              Generate Agreement
            </Link>
            <Link to="/validate" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-msd-teal-dark transition-colors">
              Validate Agreements
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
