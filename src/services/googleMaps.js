import { GOOGLE_MAPS_API_KEY } from '../utils/constants';

// Load Google Maps API script
let isLoaded = false;
let loadPromise = null;

const loadGoogleMapsAPI = () => {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  // Check if API key is configured
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return Promise.reject(new Error('Google Maps API key is not configured. Please update the API key in constants.js'));
  }

  // Validate API key format
  if (!GOOGLE_MAPS_API_KEY.startsWith('AIza')) {
    return Promise.reject(new Error('Invalid Google Maps API key format. Please check your API key.'));
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      clearTimeout(timeout);
      isLoaded = true;
      console.log('Google Maps API loaded successfully');
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load Google Maps API. Please check your internet connection and API key.'));
    };

    // Add timeout for loading
    const timeout = setTimeout(() => {
      reject(new Error('Google Maps API loading timeout. Please check your internet connection.'));
    }, 10000); // 10 second timeout

    document.head.appendChild(script);
  });

  return loadPromise;
};

// Address autocomplete functionality
export const initializeAddressAutocomplete = async (inputElement, onPlaceSelect) => {
  try {
    await loadGoogleMapsAPI();

    // Enhanced autocomplete options for better results
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['address'], // Only use 'address' type to avoid mixing errors
      componentRestrictions: { country: 'us' }, // Restrict to US addresses
      fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components'],
      strictBounds: false
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      console.log('Place selected:', place); // Debug logging
      
      if (place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || '';
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        const placeData = {
          address,
          latitude: lat,
          longitude: lng,
          placeId: place.place_id,
          name: place.name,
          addressComponents: place.address_components
        };
        
        console.log('Place data:', placeData); // Debug logging
        onPlaceSelect(placeData);
      } else {
        console.warn('No geometry found for selected place:', place);
        // Still call onPlaceSelect with available data
        const placeData = {
          address: place.formatted_address || place.name || '',
          latitude: null,
          longitude: null,
          placeId: place.place_id,
          name: place.name,
          addressComponents: place.address_components
        };
        onPlaceSelect(placeData);
      }
    });

    // Add error handling for autocomplete
    autocomplete.addListener('error', (error) => {
      console.error('Autocomplete error:', error);
    });

    return autocomplete;
  } catch (error) {
    console.error('Error initializing address autocomplete:', error);
    throw error;
  }
};

// Geocoding function
export const geocodeAddress = async (address) => {
  try {
    await loadGoogleMapsAPI();

    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            address: results[0].formatted_address,
            latitude: location.lat(),
            longitude: location.lng(),
            placeId: results[0].place_id
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

// Reverse geocoding function
export const reverseGeocode = async (lat, lng) => {
  try {
    await loadGoogleMapsAPI();

    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            address: results[0].formatted_address,
            placeId: results[0].place_id
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

// Validate Google Maps API Key
export const validateApiKey = async () => {
  try {
    await loadGoogleMapsAPI();
    
    // Try a simple geocoding request to validate the key
    const testResult = await geocodeAddress('New York, NY');
    return testResult ? true : false;
  } catch (error) {
    console.error('Invalid Google Maps API Key:', error);
    return false;
  }
};

// Test API key permissions
export const testApiKeyPermissions = async () => {
  try {
    await loadGoogleMapsAPI();
    
    // Test if Places API is working
    const testInput = document.createElement('input');
    new window.google.maps.places.Autocomplete(testInput, {
      types: ['address']
    });
    
    console.log('API key permissions test passed');
    return true;
  } catch (error) {
    console.error('API key permissions test failed:', error);
    return false;
  }
};

