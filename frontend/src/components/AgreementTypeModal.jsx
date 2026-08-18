import React from 'react';

const AgreementTypeModal = ({ isOpen, onClose, onSelect, deviceOwnership }) => {
  if (!isOpen) return null;

  const isCustomer = deviceOwnership === 'Customer Owned' || deviceOwnership === 'customer';
  const options = isCustomer 
    ? [
        { id: 'Device Purchase Agreement', title: 'Device Purchase Agreement', desc: 'Standard agreement for outright equipment purchase.' },
        { id: 'Annual Maintenance Contract', title: 'Annual Maintenance Contract (AMC)', desc: 'Service and annual maintenance contract for customer-owned equipment.' }
      ]
    : [
        { id: 'Device Loan Agreement', title: 'Device Loan Agreement', desc: 'Agreement for temporary equipment loan.' },
        { id: 'Device Placement Agreement', title: 'Device Placement Agreement', desc: 'Agreement for long-term equipment placement at client site.' }
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-msd-teal-light text-msd-teal rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            📄
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Select Agreement Template
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Data logged successfully. Choose the agreement type to generate:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((opt) => (
            <div 
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="border-2 border-gray-200 hover:border-msd-teal rounded-lg p-4 cursor-pointer hover:bg-msd-teal-light transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 group-hover:text-msd-teal">{opt.title}</h4>
                <span className="text-msd-teal font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementTypeModal;
