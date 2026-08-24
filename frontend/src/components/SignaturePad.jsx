import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ label, onSignatureChange, required = false, subtitle = '' }) => {
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f172a';
    }
  }, [mode]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        onSignatureChange(canvas.toDataURL('image/png'));
      }
    }
  };

  const clear = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    setPreviewUrl(null);
    onSignatureChange(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
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
    <div className="flex flex-col space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-800">
          {label}
        </label>
        {required ? (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            Mandatory *
          </span>
        ) : (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            Optional (Can sign later)
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
      
      <div className="flex space-x-2 my-1">
        <button 
          type="button"
          onClick={() => { setMode('draw'); clear(); }}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            mode === 'draw' ? 'bg-msd-teal text-white shadow-2xs' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✏️ Draw Signature
        </button>
        <button 
          type="button"
          onClick={() => { setMode('upload'); clear(); }}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            mode === 'upload' ? 'bg-msd-teal text-white shadow-2xs' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📁 Upload Image
        </button>
      </div>

      {mode === 'draw' ? (
        <div className="border-2 border-gray-300 border-dashed rounded-lg bg-white relative overflow-hidden shadow-2xs">
          <canvas 
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full h-36 touch-none cursor-crosshair block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {hasSignature && (
            <button 
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 text-xs bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 px-2 py-1 rounded border border-gray-300 shadow-2xs transition-colors"
            >
              Clear
            </button>
          )}
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs font-medium">
              ✍️ Draw signature here using mouse or touch
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-gray-300 border-dashed rounded-lg bg-white p-4 h-36 flex flex-col items-center justify-center relative shadow-2xs">
          {previewUrl ? (
             <>
               <img src={previewUrl} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
               <button 
                 type="button"
                 onClick={clear}
                 className="absolute top-2 right-2 text-xs bg-white px-2 py-1 shadow rounded text-gray-500 hover:text-red-500 border"
               >
                 Remove
               </button>
             </>
          ) : (
            <div className="text-center w-full">
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileUpload}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-msd-teal-light file:text-msd-teal hover:file:bg-gray-200 cursor-pointer"
              />
              <p className="mt-1 text-2xs text-gray-400">Supported formats: PNG, JPG, JPEG</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
