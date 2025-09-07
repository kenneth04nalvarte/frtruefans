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
  // Always use FormData for the backend
  const url = `${API_BASE_URL}/api/passes/templates`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: templateData,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const createPassTemplateWithImages = async (templateData, imageFiles) => {
  const formData = new FormData();
  
  // Add template data
  Object.keys(templateData).forEach(key => {
    if (templateData[key] !== null && templateData[key] !== undefined) {
      formData.append(key, templateData[key]);
    }
  });
  
  // Add image files if provided
  if (imageFiles.icon) formData.append('iconImage', imageFiles.icon);
  if (imageFiles.logo) formData.append('logoImage', imageFiles.logo);
  if (imageFiles.strip) formData.append('stripImage', imageFiles.strip);
  
  return createPassTemplate(formData);
};

// UPDATE existing pass template (not create new one)
export const updatePassTemplate = async (passId, updatedData) => {
  console.log('=== UPDATING PASS TEMPLATE ===');
  console.log('passId:', passId);
  console.log('updatedData:', updatedData);
  console.log('Using JSON endpoint: /api/passes/templates/{passId}/json');
  
  const response = await fetch(`${API_BASE_URL}/api/passes/templates/${passId}/json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData)
  });
  
  if (response.ok) {
    // Success! All existing passes will now update automatically
    console.log('Pass template updated successfully!');
    console.log('All existing passes will update automatically on phones!');
    return await response.json();
  } else {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
};

export const getPassTemplate = async (passId) => {
  console.log('=== GET PASS TEMPLATE ===');
  console.log('passId:', passId);
  console.log('URL:', `${API_BASE_URL}/api/passes/templates/${passId}`);
  
  const result = await apiCall(`/api/passes/templates/${passId}`);
  
  console.log('Received template data:', result);
  console.log('=== END GET PASS TEMPLATE ===');
  
  return result;
};

export const getPassTemplatesByBrand = async (brandId) => {
  console.log('=== GET PASSES BY BRAND ===');
  console.log('brandId:', brandId);
  console.log('URL:', `${API_BASE_URL}/api/passes/templates/brand/${brandId}`);
  
  const result = await apiCall(`/api/passes/templates/brand/${brandId}`);
  
  console.log('Received passes:', result);
  console.log('Number of passes:', Array.isArray(result) ? result.length : 'Not an array');
  console.log('=== END GET PASSES BY BRAND ===');
  
  return result;
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


