// API Configuration
export const API_BASE_URL = 'https://applepass-originator-ojhsb2liva-uc.a.run.app';

// Google Maps API Key - REPLACE WITH YOUR ACTUAL API KEY
// Get your API key from: https://console.cloud.google.com/apis/credentials
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

// Color presets for pass templates
export const COLOR_PRESETS = [
  { name: 'Classic', backgroundColor: '#ffffff', foregroundColor: '#000000' },
  { name: 'Dark', backgroundColor: '#1a1a1a', foregroundColor: '#ffffff' },
  { name: 'Blue', backgroundColor: '#1e3a8a', foregroundColor: '#ffffff' },
  { name: 'Green', backgroundColor: '#059669', foregroundColor: '#ffffff' },
  { name: 'Purple', backgroundColor: '#7c3aed', foregroundColor: '#ffffff' },
  { name: 'Orange', backgroundColor: '#ea580c', foregroundColor: '#ffffff' },
  { name: 'Red', backgroundColor: '#dc2626', foregroundColor: '#ffffff' },
  { name: 'Pink', backgroundColor: '#db2777', foregroundColor: '#ffffff' }
];

// Form validation
export const VALIDATION_RULES = {
  brandName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  address: {
    required: true,
    minLength: 5
  },
  promoText: {
    required: true,
    maxLength: 100
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  firstName: {
    required: true,
    minLength: 2
  },
  lastName: {
    required: true,
    minLength: 2
  }
};

// Error messages
export const ERROR_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be no more than ${max} characters`,
  networkError: 'Network error. Please try again.',
  serverError: 'Server error. Please try again later.',
  downloadError: 'Download failed. Please try again.'
};



