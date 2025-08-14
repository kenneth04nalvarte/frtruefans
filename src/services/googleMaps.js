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
      isLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

// Address autocomplete functionality
export const initializeAddressAutocomplete = async (inputElement, onPlaceSelect) => {
  try {
    await loadGoogleMapsAPI();

    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['address'],
      componentRestrictions: { country: 'us' }, // Restrict to US addresses
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const address = place.formatted_address;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        onPlaceSelect({
          address,
          latitude: lat,
          longitude: lng,
          placeId: place.place_id
        });
      }
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

