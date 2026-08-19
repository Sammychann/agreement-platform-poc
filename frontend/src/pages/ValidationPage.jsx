/**
 * Batch Agreement Verification & Upload Page
 */
import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ValidationReport from '../components/ValidationReport';
import { uploadForValidation, downloadValidationReport } from '../services/api';

const ValidationPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!file) {
      setError('Please select a ZIP file to validate.');
      return;
    }
    setError('');
    setLoading(true);
    setReport(null);
    try {
      const data = await uploadForValidation(file);
      // data IS the ValidationReport object
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Failed to validate the agreements. ' + (err.response?.data?.detail || err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!report || !report.report_id) return;
    try {
      const blob = await downloadValidationReport(report.report_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Validation_Report_${report.report_id}.xlsx`;
      a.click();
    } catch (err) {
      setError('Failed to download report.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-extrabold text-gray-900">Validate Agreements</h2>
          <p className="mt-1 text-sm text-gray-500">Upload a ZIP file containing scanned agreements for bulk validation.</p>
        </div>
        
        <div className="p-8">
          {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">{error}</div>}
          
          {!report && !loading && (
            <div className="space-y-6">
              <FileUploader 
                onFileSelect={setFile} 
                accept=".zip" 
                label="Upload Agreement ZIP" 
              />
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleValidate}
                  disabled={loading || !file}
                  className={`py-3 px-6 rounded-md text-white font-medium shadow-sm transition-colors ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-msd-teal hover:bg-msd-teal-dark'}`}
                >
                  {loading ? 'Validating...' : 'Validate'}
                </button>
              </div>
            </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-msd-teal mb-4"></div>
               <p className="text-gray-600 font-medium">Processing documents and validating fields...</p>
             </div>
          )}

          {report && !loading && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">Validation Complete</h3>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 bg-msd-teal text-white rounded-md text-sm font-medium hover:bg-msd-teal-dark shadow-sm transition-colors flex items-center gap-2"
                >
                  📥 Download Report as Excel
                </button>
              </div>

              <ValidationReport report={report} />
              
              <div className="pt-4 flex justify-start">
                <button
                  onClick={() => { setReport(null); setFile(null); }}
                  className="text-msd-teal hover:text-msd-teal-dark font-medium"
                >
                  &larr; Upload another batch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationPage;
