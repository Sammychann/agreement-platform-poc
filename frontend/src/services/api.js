import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

/**
 * Submit the agreement form data along with signature files.
 * Backend expects: form_data (JSON string), customer_signature (file), msd_signature (file)
 */
export const submitForm = async (formData, customerSignatureDataUrl, msdSignatureDataUrl) => {
  const multipart = new FormData();

  // Backend expects form_data as a JSON string
  const payload = { ...formData };
  // Map ownership values to backend format
  if (payload.device_ownership === 'Customer Owned') payload.device_ownership = 'customer';
  if (payload.device_ownership === 'MSD Owned') payload.device_ownership = 'msd';
  // Ensure agreement_value is a number
  if (payload.agreement_value) payload.agreement_value = parseFloat(payload.agreement_value);
  // agreement_type is set later via the modal, but backend schema requires it
  if (!payload.agreement_type) payload.agreement_type = 'pending';
  
  multipart.append('form_data', JSON.stringify(payload));

  // Convert base64 data URLs to Blob files for signatures
  if (customerSignatureDataUrl) {
    const customerBlob = await dataUrlToBlob(customerSignatureDataUrl);
    multipart.append('customer_signature', customerBlob, 'customer_signature.png');
  }
  if (msdSignatureDataUrl) {
    const msdBlob = await dataUrlToBlob(msdSignatureDataUrl);
    multipart.append('msd_signature', msdBlob, 'msd_signature.png');
  }

  const response = await api.post('/generate/submit', multipart, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const createAgreement = async (entryId, agreementType) => {
  const response = await api.post(`/generate/create/${entryId}`, { agreement_type: agreementType });
  return response.data;
};

export const getPreviewUrl = (agreementId) => {
  return `/api/generate/preview/${agreementId}`;
};

export const editAgreement = async (agreementId, updatedFields) => {
  const response = await api.put(`/generate/edit/${agreementId}`, updatedFields);
  return response.data;
};

export const downloadAgreement = async (agreementId) => {
  const response = await api.get(`/generate/download/${agreementId}`, { responseType: 'blob' });
  return response.data;
};

export const rollbackEntry = async (entryId) => {
  const response = await api.delete(`/generate/rollback/${entryId}`);
  return response.data;
};

export const uploadForValidation = async (zipFile) => {
  const formData = new FormData();
  formData.append('file', zipFile);
  const response = await api.post('/validate/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const downloadValidationReport = async (reportId) => {
  const response = await api.get(`/validate/download-report/${reportId}`, { responseType: 'blob' });
  return response.data;
};

// Helper: convert base64 data URL to Blob
async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}
