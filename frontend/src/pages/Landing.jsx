import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          MSD India Agreement Platform
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Streamline agreement generation and validation for the sales team.
        </p>
      </div>

      <div className="mt-10 max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-12 h-12 bg-msd-teal-light rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Generate Agreement</h3>
            <p className="text-gray-600 mb-6">
              Create new device and service agreements. Fill out customer details, capture signatures, and instantly generate the final document.
            </p>
          </div>
          <div className="px-8 pb-8">
            <Link to="/generate" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-msd-teal hover:bg-msd-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-msd-teal transition-colors">
              Generate Agreement
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-12 h-12 bg-msd-teal-light rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Validate Agreements</h3>
            <p className="text-gray-600 mb-6">
              Upload scanned agreements in bulk to automatically validate signatures, extracted fields, and check for discrepancies.
            </p>
          </div>
          <div className="px-8 pb-8">
            <Link to="/validate" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-msd-teal hover:bg-msd-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-msd-teal transition-colors">
              Validate Agreements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
