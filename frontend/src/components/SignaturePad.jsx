import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ label, onSignatureChange, required }) => {
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const sigCanvas = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSignatureChange(null);
    }
    setPreviewUrl(null);
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      onSignatureChange(sigCanvas.current.toDataURL());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        onSignatureChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex space-x-2 mb-2">
        <button 
          type="button"
          onClick={() => setMode('draw')}
          className={`px-3 py-1 text-sm rounded ${mode === 'draw' ? 'bg-msd-teal text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Draw
        </button>
        <button 
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1 text-sm rounded ${mode === 'upload' ? 'bg-msd-teal text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Upload
        </button>
      </div>

      {mode === 'draw' ? (
        <div className="border-2 border-gray-300 border-dashed rounded bg-white relative">
          <SignatureCanvas 
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ className: 'w-full h-40' }}
            onEnd={handleEnd}
          />
          <button 
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 text-xs text-gray-500 hover:text-red-500"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="border-2 border-gray-300 border-dashed rounded bg-gray-50 p-4 h-40 flex flex-col items-center justify-center relative">
          {previewUrl ? (
             <>
               <img src={previewUrl} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
               <button 
                 type="button"
                 onClick={clear}
                 className="absolute top-2 right-2 text-xs bg-white px-2 py-1 shadow rounded text-gray-500 hover:text-red-500"
               >
                 Clear
               </button>
             </>
          ) : (
            <div className="text-center w-full">
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-msd-teal-light file:text-msd-teal hover:file:bg-gray-200"
              />
              <p className="mt-2 text-xs text-gray-500">PNG, JPG up to 2MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
