import React, { useState } from 'react';

const ValidationReport = ({ report }) => {
  if (!report) return null;

  const totalCompanies = report.total_companies ?? 0;
  const passedCount = report.passed ?? 0;
  const failedCount = report.failed ?? 0;
  const warningsCount = report.warnings ?? 0;
  const companies = report.companies || [];

  const [expanded, setExpanded] = useState({});

  const toggleExpand = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
          <span className="text-3xl font-bold text-blue-700">{totalCompanies}</span>
          <span className="text-sm text-blue-600 font-medium uppercase tracking-wide">Total Companies</span>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
          <span className="text-3xl font-bold text-green-700">{passedCount}</span>
          <span className="text-sm text-green-600 font-medium uppercase tracking-wide">Passed</span>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
          <span className="text-3xl font-bold text-red-700">{failedCount}</span>
          <span className="text-sm text-red-600 font-medium uppercase tracking-wide">Failed</span>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
          <span className="text-3xl font-bold text-yellow-700">{warningsCount}</span>
          <span className="text-sm text-yellow-600 font-medium uppercase tracking-wide">Warnings / Dups</span>
        </div>
      </div>

      {/* Companies List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
        {companies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No company records found in uploaded file.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {companies.map((company, idx) => {
              const isCompanyPass = company.files?.every(f => f.found && (!f.missing_fields || f.missing_fields.length === 0));
              const companyStatus = isCompanyPass ? 'Pass' : 'Fail';

              return (
                <div key={idx} className="flex flex-col">
                  <div 
                    className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${expanded[idx] ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleExpand(idx)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${expanded[idx] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <h4 className="text-md font-semibold text-gray-900">{company.company_name}</h4>
                        {company.month && <span className="text-xs text-gray-500">Folder: {company.month}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {company.duplicates && company.duplicates.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠️ Duplicate
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${companyStatus === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {companyStatus}
                      </span>
                    </div>
                  </div>
                  
                  {expanded[idx] && (
                    <div className="px-6 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Required</th>
                              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presence</th>
                              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Validation Details</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {company.files?.map((file, fidx) => (
                              <tr key={fidx}>
                                <td className="px-4 py-3 font-medium text-gray-900 capitalize">{file.filename}</td>
                                <td className="px-4 py-3">
                                  {file.found ? (
                                    <span className="text-green-600 font-medium flex items-center gap-1"><span className="text-base">✅</span> Present</span>
                                  ) : (
                                    <span className="text-red-600 font-medium flex items-center gap-1"><span className="text-base">❌</span> Missing File</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {file.missing_fields?.map((mf, i) => (
                                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Missing field: {mf}
                                      </span>
                                    ))}
                                    {file.found && (!file.missing_fields || file.missing_fields.length === 0) && (
                                      <span className="text-gray-500 text-xs italic">All required fields present</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationReport;
