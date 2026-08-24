import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgreementDetails, editAgreement, downloadAgreement, rollbackEntry } from '../services/api';
import FormField from '../components/FormField';

const AgreementPreview = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields state
  const [fields, setFields] = useState({
    customer_name: '',
    distributor_name: '',
    location: '',
    address: '',
    initiator_name_and_date: '',
    manager_name_and_date: '',
    receiver_name: '',
    receiver_title: '',
    intervet_name: '',
    intervet_title: '',
  });

  useEffect(() => {
    fetchDetails();
  }, [agreementId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getAgreementDetails(agreementId);
      setDetails(data);
      setFields({
        customer_name: data.customer_name || '',
        distributor_name: data.distributor_name || '',
        location: data.location || '',
        address: data.address || '',
        initiator_name_and_date: data.initiator_name_and_date || '',
        manager_name_and_date: data.manager_name_and_date || '',
        receiver_name: data.receiver_name || '',
        receiver_title: data.receiver_title || '',
        intervet_name: data.intervet_name || '',
        intervet_title: data.intervet_title || '',
      });
    } catch (err) {
      setError('Failed to load agreement details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyChanges = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await editAgreement(agreementId, fields);
      setSuccessMsg('Agreement updated and re-generated successfully!');
      if (res.agreement_id && res.agreement_id !== agreementId) {
        navigate(`/preview/${res.agreement_id}`, { replace: true });
      } else {
        await fetchDetails();
      }
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError('Failed to apply edits.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadAgreement(agreementId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${details?.agreement_type || 'Commercial_Agreement'}_${agreementId}.docx`;
      a.click();
    } catch (err) {
      setError('Failed to download document.');
    }
  };

  const handleRollback = async () => {
    if (window.confirm('Are you sure you want to cancel and rollback this agreement?')) {
      try {
        if (details?.entry_id) {
          await rollbackEntry(details.entry_id);
        }
        navigate('/generate');
      } catch (err) {
        setError('Failed to rollback.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-msd-teal mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Agreement Document...</p>
      </div>
    );
  }

  const isIndirect = details?.agreement_type?.includes('Indirect');
  const equipmentList = details?.equipment || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
              Generated & Active
            </span>
            <span className="text-xs text-gray-500">ID: {agreementId?.substring(0, 13)}...</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {details?.agreement_type}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-5 py-2.5 bg-msd-teal hover:bg-msd-teal-dark text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            📥 Download Word Document (.docx)
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-300 transition-colors cursor-pointer"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleRollback}
            className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200 transition-colors cursor-pointer"
          >
            Cancel & Rollback
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">{error}</div>}
      {successMsg && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-green-700 font-medium">{successMsg}</div>}

      {/* Main Grid: Document Preview (Left) & Edit Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Document Sheet Preview */}
        <div className="lg:col-span-8 bg-white border border-gray-300 rounded-xl shadow-lg p-8 sm:p-12 font-sans text-gray-800 space-y-6">
          <div className="text-center border-b pb-6">
            <h3 className="text-base font-bold text-msd-teal tracking-widest uppercase">
              INTERVET INDIA PRIVATE LIMITED
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">(A subsidiary of Merck & Co., Inc.)</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-4 uppercase">
              {details?.agreement_type}
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Effective Date: <strong>{details?.date}</strong>
            </p>
          </div>

          {/* Section 1: Parties */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-msd-teal border-b border-gray-100 pb-1 mb-3">
              1. Parties to the Agreement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-500 text-xs block">Party 1 (Company)</span>
                <span className="font-semibold text-gray-900">Intervet India Private Limited</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Customer Name</span>
                <span className="font-bold text-gray-900">{fields.customer_name || details?.customer_name}</span>
              </div>
              {isIndirect && (
                <div>
                  <span className="text-gray-500 text-xs block">Authorized Distributor</span>
                  <span className="font-bold text-msd-teal">{fields.distributor_name || details?.distributor_name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 text-xs block">Customer Location</span>
                <span className="font-medium text-gray-900">{fields.location || details?.location}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 text-xs block">Delivery Address (Release Form)</span>
                <span className="font-medium text-gray-900">{fields.address || details?.address}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Equipment Schedule */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-msd-teal border-b border-gray-100 pb-1 mb-3">
              2. Equipment Details & EXHIBIT A
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-msd-teal-light">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Item #</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Equipment Name / Description</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {equipmentList.length > 0 ? (
                    equipmentList.map((eq, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-xs text-gray-500">{i + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{eq.equipment_name}</td>
                        <td className="px-4 py-2 text-center font-bold text-gray-900">{eq.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-center text-gray-400 text-xs">No equipment specified</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Internal Approval */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-msd-teal border-b border-gray-100 pb-1 mb-3">
              3. Internal Approvals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-500 text-xs block">Initiator Name & Date</span>
                <span className="font-medium text-gray-900">{fields.initiator_name_and_date}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Manager Name & Date</span>
                <span className="font-medium text-gray-900">{fields.manager_name_and_date}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Signatures */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-msd-teal border-b border-gray-100 pb-1 mb-4">
              4. Signatures & Execution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Customer / Receiver</p>
                <div className="h-16 flex items-center justify-center text-xs font-semibold rounded border border-gray-200 bg-white text-gray-700">
                  {details?.customer_signature_path ? '✍️ Digital Signature Embedded' : '⏳ Optional (Can sign later)'}
                </div>
                <div className="text-left mt-3 text-xs space-y-1">
                  <p><strong>Name:</strong> {fields.receiver_name}</p>
                  <p><strong>Title:</strong> {fields.receiver_title}</p>
                  <p><strong>Date:</strong> {details?.receiver_date}</p>
                </div>
              </div>

              <div className="border-2 border-msd-teal/40 p-4 rounded-lg bg-msd-teal-light/20 text-center">
                <p className="text-xs font-bold text-msd-teal uppercase mb-2">Intervet India Private Limited</p>
                <div className="h-16 flex items-center justify-center text-xs font-semibold rounded border border-msd-teal/30 bg-white text-msd-teal">
                  ✍️ Authorized Digital Signature Attached
                </div>
                <div className="text-left mt-3 text-xs space-y-1">
                  <p><strong>Name:</strong> {fields.intervet_name}</p>
                  <p><strong>Title:</strong> {fields.intervet_title}</p>
                  <p><strong>Date:</strong> {details?.intervet_date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Edit & Update Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Edit Agreement Fields</h3>
            <p className="text-xs text-gray-500 mb-4">Adjust details and re-generate the Word document instantly.</p>
            
            <div className="space-y-4">
              <FormField 
                label="Customer Name" 
                name="customer_name" 
                value={fields.customer_name} 
                onChange={handleFieldChange} 
              />

              {isIndirect && (
                <FormField 
                  label="Distributor Name" 
                  name="distributor_name" 
                  value={fields.distributor_name} 
                  onChange={handleFieldChange} 
                />
              )}

              <FormField 
                label="Location" 
                name="location" 
                value={fields.location} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Address (Release Form)" 
                type="textarea"
                name="address" 
                value={fields.address} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Initiator Name & Date" 
                name="initiator_name_and_date" 
                value={fields.initiator_name_and_date} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Manager Name & Date" 
                name="manager_name_and_date" 
                value={fields.manager_name_and_date} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Receiver Name" 
                name="receiver_name" 
                value={fields.receiver_name} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Receiver Title" 
                name="receiver_title" 
                value={fields.receiver_title} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Intervet Signatory Name" 
                name="intervet_name" 
                value={fields.intervet_name} 
                onChange={handleFieldChange} 
              />

              <FormField 
                label="Intervet Signatory Title" 
                name="intervet_title" 
                value={fields.intervet_title} 
                onChange={handleFieldChange} 
              />

              <button
                onClick={handleApplyChanges}
                disabled={saving}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-xs transition-colors cursor-pointer ${
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-msd-teal hover:bg-msd-teal-dark'
                }`}
              >
                {saving ? 'Re-generating Document...' : '💾 Apply Edits & Re-generate'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgreementPreview;
