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
    company_name: '',
    customer_address: '',
    contact_person_name: '',
    contact_person_phone: '',
    agreement_value: '',
    device_name: '',
    device_serial_number: '',
    territory: '',
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
        company_name: data.company_name || '',
        customer_address: data.customer_address || '',
        contact_person_name: data.contact_person_name || '',
        contact_person_phone: data.contact_person_phone || '',
        agreement_value: data.agreement_value || '',
        device_name: data.device_name || '',
        device_serial_number: data.device_serial_number || '',
        territory: data.territory || '',
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
      setSuccessMsg('Agreement updated successfully!');
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
              Generated & Active
            </span>
            <span className="text-xs text-gray-500">ID: {agreementId}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {details?.agreement_type || 'Commercial Agreement'}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-msd-teal hover:bg-msd-teal-dark text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            📥 Download Word Document (.docx)
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border transition-colors"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleRollback}
            className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200 transition-colors"
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
        <div className="lg:col-span-8 bg-white border border-gray-300 rounded-xl shadow-lg p-8 sm:p-12 font-serif text-gray-800 space-y-6">
          <div className="text-center border-b pb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-gray-900 uppercase">
              Commercial Agreement
            </h1>
            <p className="text-sm font-sans font-semibold text-msd-teal mt-1 uppercase">
              {details?.agreement_type}
            </p>
            <p className="text-xs font-sans text-gray-400 mt-2">
              Ref: AGR-{agreementId?.substring(0, 8)} | Date: {details?.agreement_start_date}
            </p>
          </div>

          <div className="text-sm leading-relaxed font-sans">
            <p className="mb-4">
              This Agreement is entered into on <strong>{details?.agreement_start_date}</strong> by and between the <strong>Authorized Company Provider</strong> and <strong>{fields.company_name || details?.company_name}</strong>.
            </p>
          </div>

          {/* Section 1 */}
          <div className="font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-3">
              1. Customer & Signatory Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-500 text-xs block">Company / Customer Name</span>
                <span className="font-medium text-gray-900">{fields.company_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Customer Address</span>
                <span className="font-medium text-gray-900">{fields.customer_address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Contact Person</span>
                <span className="font-medium text-gray-900">{fields.contact_person_name} ({details?.contact_person_designation || 'Signatory'})</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Contact Phone & Email</span>
                <span className="font-medium text-gray-900">{fields.contact_person_phone} | {details?.contact_person_email}</span>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-3">
              2. Equipment & Location Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-500 text-xs block">Device / Product Model</span>
                <span className="font-medium text-gray-900">{fields.device_name}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Serial Number</span>
                <span className="font-medium text-gray-900">{fields.device_serial_number}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Territory / Region</span>
                <span className="font-medium text-gray-900">{fields.territory}</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-3">
              3. Commercial & Term Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-500 text-xs block">Agreement Value</span>
                <span className="font-bold text-green-700 text-base">₹{Number(fields.agreement_value).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Term Duration</span>
                <span className="font-medium text-gray-900">{details?.agreement_start_date} to {details?.agreement_end_date}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Ownership Model</span>
                <span className="font-medium text-gray-900 capitalize">{details?.device_ownership} Owned</span>
              </div>
            </div>
          </div>

          {/* Section 4: Signatures */}
          <div className="font-sans pt-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-4">
              4. Execution & Digital Signatures
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">For Authorized Signatory</p>
                <div className="h-16 flex items-center justify-center text-xs text-green-700 font-semibold bg-green-50 rounded border border-green-200">
                  ✍️ Verified Company Digital Signature
                </div>
              </div>
              <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">For {fields.company_name}</p>
                <div className="h-16 flex items-center justify-center text-xs text-green-700 font-semibold bg-green-50 rounded border border-green-200">
                  ✍️ Verified Customer Digital Signature
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Edit & Update Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Edit Agreement Fields</h3>
            <p className="text-xs text-gray-500 mb-4">Make inline adjustments and re-generate document instantly.</p>
            
            <div className="space-y-4">
              <FormField 
                label="Company Name" 
                name="company_name" 
                value={fields.company_name} 
                onChange={handleFieldChange} 
              />
              <FormField 
                label="Customer Address" 
                type="textarea"
                name="customer_address" 
                value={fields.customer_address} 
                onChange={handleFieldChange} 
              />
              <FormField 
                label="Contact Person" 
                name="contact_person_name" 
                value={fields.contact_person_name} 
                onChange={handleFieldChange} 
              />
              <FormField 
                label="Phone Number" 
                name="contact_person_phone" 
                value={fields.contact_person_phone} 
                onChange={handleFieldChange} 
              />
              <FormField 
                label="Device Model" 
                name="device_name" 
                value={fields.device_name} 
                onChange={handleFieldChange} 
              />
              <FormField 
                label="Agreement Value (₹)" 
                type="number" 
                name="agreement_value" 
                value={fields.agreement_value} 
                onChange={handleFieldChange} 
              />

              <button
                onClick={handleApplyChanges}
                disabled={saving}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-sm transition-colors ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-msd-teal hover:bg-msd-teal-dark'}`}
              >
                {saving ? 'Re-generating...' : '💾 Apply Edits & Re-generate'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgreementPreview;
