import React from 'react';

const EquipmentTable = ({ equipment = [], onChange }) => {
  const handleCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < 1) return;
    
    let newEquipment = [...equipment];
    if (count > newEquipment.length) {
      const toAdd = count - newEquipment.length;
      for (let i = 0; i < toAdd; i++) {
        newEquipment.push({ equipment_name: '', quantity: 1 });
      }
    } else if (count < newEquipment.length) {
      newEquipment = newEquipment.slice(0, count);
    }
    onChange(newEquipment);
  };

  const handleRowChange = (index, field, value) => {
    const newEquipment = equipment.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newEquipment);
  };

  const handleAddRow = () => {
    onChange([...equipment, { equipment_name: '', quantity: 1 }]);
  };

  const handleRemoveRow = (index) => {
    if (equipment.length <= 1) return;
    const newEquipment = equipment.filter((_, idx) => idx !== index);
    onChange(newEquipment);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <label htmlFor="equipment-count" className="block text-sm font-semibold text-gray-800">
            How many equipment items need to be entered? <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Rows in the table below will automatically adjust to this count.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="equipment-count"
            type="number"
            min="1"
            max="50"
            value={equipment.length || 1}
            onChange={handleCountChange}
            className="w-24 text-center font-bold text-base py-2 px-3 border border-gray-300 rounded-md focus:ring-msd-teal focus:border-msd-teal shadow-xs bg-white"
          />
          <button
            type="button"
            onClick={handleAddRow}
            className="px-3 py-2 text-xs font-semibold text-msd-teal hover:text-white hover:bg-msd-teal border border-msd-teal rounded-md transition-colors"
          >
            + Add Row
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-2xs">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-msd-teal-light">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-16">
                #
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Equipment Name / Model <span className="text-red-500">*</span>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-36">
                Quantity <span className="text-red-500">*</span>
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {equipment.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innoject Pro Needle-Free Injector"
                    value={item.equipment_name || ''}
                    onChange={(e) => handleRowChange(index, 'equipment_name', e.target.value)}
                    className="w-full text-sm py-1.5 px-3 border border-gray-300 rounded-md focus:ring-msd-teal focus:border-msd-teal"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                    className="w-full text-sm py-1.5 px-3 border border-gray-300 rounded-md focus:ring-msd-teal focus:border-msd-teal text-center"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    disabled={equipment.length <= 1}
                    onClick={() => handleRemoveRow(index)}
                    title={equipment.length <= 1 ? "At least one equipment row is required" : "Remove this row"}
                    className={`text-sm px-2 py-1 rounded transition-colors ${
                      equipment.length <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 italic">
        Note: The equipment entered here will automatically populate both the <strong>Equipment Details</strong> section and <strong>EXHIBIT A</strong> of the generated Word agreement.
      </p>
    </div>
  );
};

export default EquipmentTable;
