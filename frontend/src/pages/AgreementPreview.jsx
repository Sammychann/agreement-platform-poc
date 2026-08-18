import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPreviewUrl, editAgreement, downloadAgreement, rollbackEntry } from '../services/api';
import FormField from '../components/FormField';

const AgreementPreview = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Example placeholder for editable fields (in a real app, fetch these from API by agreementId)
  const [fields, setFields] = useState({
    company_name: '',
    agreement_value: '',
    device_name: '',
  });

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyChanges = async () => {
    setLoading(true);
    try {
      await editAgreement(agreementId, fields);
      setSuccessMsg('Changes applied and document updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
      // Reload iframe somehow, usually by appending a timestamp query param
    } catch (err) {
      setError('Failed to edit agreement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocs = async (format) => {
    try {
      const blob = await downloadAgreement(agreementId); // You may want to pass format if backend supports
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreement_${agreementId}.${format}`;
      a.click();
    } catch (err) {
      setError(`Failed to download ${format}.`);
    }
  };

  const handleRollback = async () => {
    if(window.confirm('Are you sure you want to cancel and rollback this entry?')) {
      try {
        // Here we might need the entryId. If backend supports rollback by agreementId, we use that. 
        // For now, assuming backend can handle it or we pass agreementId to rollback.
        await rollbackEntry(agreementId);
        navigate('/generate');
      } catch (err) {
        setError('Failed to rollback.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-64px)]">
      {/* Left side: Document Preview */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Document Preview</h3>
          <span className="text-xs text-gray-500">ID: {agreementId}</span>
        </div>
        <div className="flex-1 p-4 overflow-auto bg-gray-100 flex items-center justify-center">
          {/* iframe or direct download link */}
          <div className="text-center">
             <p className="mb-4 text-gray-600">Live preview of DOCX files may require external viewers.</p>
             <a 
               href={getPreviewUrl(agreementId)} 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-msd-teal hover:bg-msd-teal-dark"
             >
               Open Document Viewer
             </a>
          </div>
        </div>
      </div>

      {/* Right side: Edit Panel & Actions */}
      <div className="w-full md:w-96 flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Details</h3>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm mb-4">{successMsg}</p>}
          
          <div className="space-y-4">
            <FormField label="Company Name" name="company_name" value={fields.company_name} onChange={handleFieldChange} />
            <FormField label="Agreement Value" type="number" name="agreement_value" value={fields.agreement_value} onChange={handleFieldChange} />
            <FormField label="Device Name" name="device_name" value={fields.device_name} onChange={handleFieldChange} />
            
            <button 
              onClick={handleApplyChanges}
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-msd-teal hover:bg-msd-teal-dark transition-colors"
            >
              {loading ? 'Applying...' : 'Apply Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h3>
          <div className="space-y-3">
            <button onClick={() => handleDownloadDocs('docx')} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              Download DOCX
            </button>
            <button onClick={() => handleDownloadDocs('pdf')} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Download PDF
            </button>
            <button onClick={handleRollback} className="w-full py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Cancel & Rollback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementPreview;
