import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-msd-teal text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-2xl tracking-wider mr-2">MSD</span>
              <span className="text-sm font-medium border-l border-white pl-2">Agreement Platform</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-msd-teal-dark transition-colors">Home</Link>
              <Link to="/generate" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-msd-teal-dark transition-colors">Generate</Link>
              <Link to="/validate" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-msd-teal-dark transition-colors">Validate</Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-msd-teal-dark focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-msd-teal-dark">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-msd-teal" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/generate" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-msd-teal" onClick={() => setIsOpen(false)}>Generate</Link>
            <Link to="/validate" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-msd-teal" onClick={() => setIsOpen(false)}>Validate</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
