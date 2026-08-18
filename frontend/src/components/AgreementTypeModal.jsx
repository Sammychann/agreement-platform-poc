import React from 'react';

const AgreementTypeModal = ({ isOpen, onClose, onSelect, deviceOwnership }) => {
  if (!isOpen) return null;

  const options = deviceOwnership === 'Customer Owned' 
    ? [
        { id: 'Device Purchase Agreement', title: 'Device Purchase Agreement', desc: 'Standard agreement for outright purchase.' },
        { id: 'Annual Maintenance Contract', title: 'Annual Maintenance Contract (AMC)', desc: 'Service and maintenance contract for customer-owned devices.' }
      ]
    : [
        { id: 'Device Loan Agreement', title: 'Device Loan Agreement', desc: 'Agreement for temporary device loan.' },
        { id: 'Device Placement Agreement', title: 'Device Placement Agreement', desc: 'Agreement for device placement at customer site.' }
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Select Agreement Type
                </h3>
                <div className="mt-4 space-y-3">
                  {options.map((opt) => (
                    <div 
                      key={opt.id}
                      onClick={() => onSelect(opt.id)}
                      className="border rounded-lg p-4 cursor-pointer hover:border-msd-teal hover:bg-msd-teal-light transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">{opt.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementTypeModal;
