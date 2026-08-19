/**
 * Drag-and-drop file uploader component
 */
import React, { useRef, useState } from 'react';

const FileUploader = ({ onFileSelect, accept = ".zip", label = "Upload File" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div 
        className={`relative border-2 border-dashed rounded-lg p-10 text-center ${dragActive ? 'border-msd-teal bg-msd-teal-light' : 'border-gray-300 hover:border-msd-teal bg-gray-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef} 
          type="file" 
          accept={accept} 
          className="hidden" 
          onChange={handleChange} 
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white rounded-full shadow-sm">
            <svg className="w-8 h-8 text-msd-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">Drag & Drop your {accept} file here</p>
            <p className="text-sm text-gray-500 mt-1">or</p>
          </div>
          <button 
            type="button" 
            onClick={onButtonClick}
            className="px-4 py-2 border border-msd-teal text-msd-teal rounded-md hover:bg-msd-teal hover:text-white transition-colors text-sm font-medium"
          >
            Browse File
          </button>
          {fileName && <p className="text-sm font-semibold text-gray-900 mt-4">Selected: {fileName}</p>}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
