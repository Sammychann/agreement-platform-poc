import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import SignaturePad from '../components/SignaturePad';
import AgreementTypeModal from '../components/AgreementTypeModal';
import { submitForm, createAgreement } from '../services/api';

const GenerationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    customer_address: '',
    contact_person_name: '',
    contact_person_designation: '',
    contact_person_email: '',
    contact_person_phone: '',
    agreement_start_date: '',
    agreement_end_date: '',
    device_name: '',
    device_serial_number: '',
    territory: '',
    agreement_value: '',
    device_ownership: 'Customer Owned'
  });

  const [customerSignature, setCustomerSignature] = useState(null);
  const [msdSignature, setMsdSignature] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [entryId, setEntryId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Telangana', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Kerala', 'Punjab', 'Haryana', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return formData.company_name && formData.customer_address && formData.contact_person_name &&
      formData.contact_person_email && formData.agreement_start_date && formData.agreement_end_date &&
      formData.device_name && formData.device_serial_number && formData.agreement_value &&
      customerSignature && msdSignature && acceptedTerms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError('Please fill all required fields and provide signatures.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Submit form
      const data = await submitForm(formData, customerSignature, msdSignature);
      setEntryId(data.entry_id);
      // 2. Show Modal
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = async (agreementType) => {
    try {
      setShowModal(false);
      setLoading(true);
      const res = await createAgreement(entryId, agreementType);
      navigate(`/preview/${res.agreement_id}`);
    } catch (err) {
      setError('Failed to create agreement document.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Generate New Agreement</h2>
      
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* Section 1: Customer Details */}
        <div>
          <h3 className="text-xl font-semibold text-msd-teal mb-4 border-b pb-2">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Company / Customer Name" name="company_name" value={formData.company_name} onChange={handleChange} required />
            <FormField label="Contact Person Name" name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} required />
            <FormField label="Contact Person Designation" name="contact_person_designation" value={formData.contact_person_designation} onChange={handleChange} required />
            <FormField label="Contact Person Email" type="email" name="contact_person_email" value={formData.contact_person_email} onChange={handleChange} required />
            <FormField label="Contact Person Phone" type="tel" name="contact_person_phone" value={formData.contact_person_phone} onChange={handleChange} required />
            <div className="md:col-span-2">
              <FormField label="Customer Address" type="textarea" name="customer_address" value={formData.customer_address} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Section 2: Agreement Details */}
        <div>
          <h3 className="text-xl font-semibold text-msd-teal mb-4 border-b pb-2">Agreement Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Agreement Start Date" type="date" name="agreement_start_date" value={formData.agreement_start_date} onChange={handleChange} required />
            <FormField label="Agreement End Date" type="date" name="agreement_end_date" value={formData.agreement_end_date} onChange={handleChange} required />
            <FormField label="Device / Product Name or Model" name="device_name" value={formData.device_name} onChange={handleChange} required />
            <FormField label="Device Serial Number" name="device_serial_number" value={formData.device_serial_number} onChange={handleChange} required />
            <FormField label="Territory / Region" type="select" options={states} name="territory" value={formData.territory} onChange={handleChange} />
            <FormField label="Agreement Value (₹)" type="number" name="agreement_value" value={formData.agreement_value} onChange={handleChange} required />
          </div>
        </div>

        {/* Section 3: Device Ownership */}
        <div>
          <h3 className="text-xl font-semibold text-msd-teal mb-4 border-b pb-2">Device Ownership</h3>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="device_ownership" value="Customer Owned" checked={formData.device_ownership === 'Customer Owned'} onChange={handleChange} className="text-msd-teal focus:ring-msd-teal" />
              <span>Customer Owned</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="device_ownership" value="MSD Owned" checked={formData.device_ownership === 'MSD Owned'} onChange={handleChange} className="text-msd-teal focus:ring-msd-teal" />
              <span>MSD Owned</span>
            </label>
          </div>
        </div>

        {/* Section 4: Signatures */}
        <div>
          <h3 className="text-xl font-semibold text-msd-teal mb-4 border-b pb-2">Signatures</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SignaturePad label="Customer Signature" onSignatureChange={setCustomerSignature} required />
            <SignaturePad label="MSD Authorized Signature" onSignatureChange={setMsdSignature} required />
          </div>
        </div>

        {/* Section 5: Terms */}
        <div className="flex items-center">
          <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="h-4 w-4 text-msd-teal focus:ring-msd-teal border-gray-300 rounded" />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I accept the Terms & Conditions
          </label>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={!isFormValid() || loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!isFormValid() || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-msd-teal hover:bg-msd-teal-dark'} transition-colors`}
          >
            {loading ? 'Processing...' : 'Submit Form'}
          </button>
        </div>
      </form>

      <AgreementTypeModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSelect={handleTypeSelect} 
        deviceOwnership={formData.device_ownership} 
      />
    </div>
  );
};

export default GenerationForm;
