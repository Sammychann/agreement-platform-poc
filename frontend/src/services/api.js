import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const submitForm = async (formData, customerSignatureDataUrl, intervetSignatureDataUrl) => {
  const multipart = new FormData();

  const payload = { ...formData };
  
  multipart.append('form_data', JSON.stringify(payload));

  if (customerSignatureDataUrl) {
    const customerBlob = await dataUrlToBlob(customerSignatureDataUrl);
    multipart.append('customer_signature', customerBlob, 'customer_signature.png');
  }
  if (intervetSignatureDataUrl) {
    const intervetBlob = await dataUrlToBlob(intervetSignatureDataUrl);
    multipart.append('intervet_signature', intervetBlob, 'intervet_signature.png');
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

export const getAgreementDetails = async (agreementId) => {
  const response = await api.get(`/generate/details/${agreementId}`);
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

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}
