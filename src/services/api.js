import { API_BASE_URL } from '../utils/constants';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // For download endpoints, return the response directly
    if (endpoint.includes('/download')) {
      return response;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Pass Template API calls
export const createPassTemplate = async (templateData) => {
  return apiCall('/api/passes/templates/json', {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
};

export const getPassTemplate = async (passId) => {
  return apiCall(`/api/passes/templates/${passId}`);
};

export const getPassTemplatesByBrand = async (brandId) => {
  return apiCall(`/api/passes/templates/brand/${brandId}`);
};

// Diner Pass API calls
export const createDinerPass = async (dinerData) => {
  return apiCall('/api/generate-diner-pass', {
    method: 'POST',
    body: JSON.stringify(dinerData),
  });
};

export const getDinerPass = async (serialNumber) => {
  return apiCall(`/api/passes/diners/${serialNumber}`);
};

// Download API call
export const downloadPass = async (serialNumber) => {
  return apiCall(`/api/passes/diners/${serialNumber}/download`);
};

// Download helper functions
export const downloadPassFile = (serialNumber) => {
  const downloadUrl = `${API_BASE_URL}/api/passes/diners/${serialNumber}/download`;
  
  // Method 1: Direct download (recommended)
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${serialNumber}.pkpass`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPassWithFetch = async (serialNumber) => {
  try {
    const response = await downloadPass(serialNumber);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serialNumber}.pkpass`;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export const downloadPassNewWindow = (serialNumber) => {
  const downloadUrl = `${API_BASE_URL}/api/passes/diners/${serialNumber}/download`;
  window.open(downloadUrl, '_blank');
};
