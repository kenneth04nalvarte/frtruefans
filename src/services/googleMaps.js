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

    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error('Google Maps API script failed to load:', error);
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

// Enhanced address parsing function
const parseAddressComponents = (addressComponents) => {
  const address = {
    streetNumber: '',
    route: '',
    locality: '',
    administrativeArea: '',
    postalCode: '',
    country: '',
    fullAddress: ''
  };

  if (addressComponents) {
    addressComponents.forEach(component => {
      const types = component.types;
      const value = component.long_name;

      if (types.includes('street_number')) {
        address.streetNumber = value;
      } else if (types.includes('route')) {
        address.route = value;
      } else if (types.includes('locality')) {
        address.locality = value;
      } else if (types.includes('administrative_area_level_1')) {
        address.administrativeArea = value;
      } else if (types.includes('postal_code')) {
        address.postalCode = value;
      } else if (types.includes('country')) {
        address.country = value;
      }
    });

    // Build full address
    const parts = [];
    if (address.streetNumber && address.route) {
      parts.push(`${address.streetNumber} ${address.route}`);
    } else if (address.route) {
      parts.push(address.route);
    }
    if (address.locality) parts.push(address.locality);
    if (address.administrativeArea) parts.push(address.administrativeArea);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    address.fullAddress = parts.join(', ');
  }

  return address;
};

// Address autocomplete functionality
export const initializeAddressAutocomplete = async (inputElement, onPlaceSelect) => {
  try {
    await loadGoogleMapsAPI();

    // Enhanced autocomplete options for better results
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['address'], // Use only 'address' type to avoid mixing errors
      fields: [
        'formatted_address', 
        'geometry', 
        'place_id', 
        'name', 
        'address_components',
        'vicinity',
        'types'
      ],
      strictBounds: false
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      console.log('=== PLACE SELECTED ===');
      console.log('Full place object:', place);
      console.log('Formatted address:', place.formatted_address);
      console.log('Name:', place.name);
      console.log('Vicinity:', place.vicinity);
      console.log('Types:', place.types);
      console.log('Address components:', place.address_components);
      
      // Parse address components for better address construction
      const parsedAddress = parseAddressComponents(place.address_components);
      console.log('Parsed address:', parsedAddress);
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        // Use the most complete address available
        let bestAddress = '';
        if (place.formatted_address) {
          bestAddress = place.formatted_address;
        } else if (parsedAddress.fullAddress) {
          bestAddress = parsedAddress.fullAddress;
        } else if (place.name && place.vicinity) {
          bestAddress = `${place.name}, ${place.vicinity}`;
        } else if (place.name) {
          bestAddress = place.name;
        } else if (place.vicinity) {
          bestAddress = place.vicinity;
        }
        
        const placeData = {
          address: bestAddress,
          latitude: lat,
          longitude: lng,
          placeId: place.place_id,
          name: place.name,
          vicinity: place.vicinity,
          types: place.types,
          addressComponents: place.address_components,
          parsedAddress: parsedAddress,
          formattedAddress: place.formatted_address
        };
        
        console.log('=== FINAL PLACE DATA ===');
        console.log('Selected address:', bestAddress);
        console.log('Latitude:', lat);
        console.log('Longitude:', lng);
        console.log('=== END PLACE DATA ===');
        
        onPlaceSelect(placeData);
      } else {
        console.warn('No geometry found for selected place:', place);
        
        // Still try to get the best address possible
        let bestAddress = '';
        if (place.formatted_address) {
          bestAddress = place.formatted_address;
        } else if (parsedAddress.fullAddress) {
          bestAddress = parsedAddress.fullAddress;
        } else if (place.name && place.vicinity) {
          bestAddress = `${place.name}, ${place.vicinity}`;
        } else if (place.name) {
          bestAddress = place.name;
        } else if (place.vicinity) {
          bestAddress = place.vicinity;
        }
        
        const placeData = {
          address: bestAddress,
          latitude: null,
          longitude: null,
          placeId: place.place_id,
          name: place.name,
          vicinity: place.vicinity,
          types: place.types,
          addressComponents: place.address_components,
          parsedAddress: parsedAddress,
          formattedAddress: place.formatted_address
        };
        
        console.log('=== PLACE DATA (NO GEOMETRY) ===');
        console.log('Selected address:', bestAddress);
        console.log('=== END PLACE DATA ===');
        
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

