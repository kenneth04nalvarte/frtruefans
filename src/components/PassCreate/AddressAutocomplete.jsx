import React, { useEffect, useRef, useState } from 'react';
import { initializeAddressAutocomplete } from '../../services/googleMaps';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Enter address...",
  required = false,
  disabled = false,
  className = ""
}) => {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAddressComplete, setIsAddressComplete] = useState(false);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      let autocomplete = null;

      const initAutocomplete = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          autocomplete = await initializeAddressAutocomplete(
            inputRef.current,
            (placeData) => {
              console.log('AddressAutocomplete: Place selected:', placeData);
              
              // Update the input value with the formatted address
              if (placeData && placeData.address) {
                console.log('AddressAutocomplete: Setting address to:', placeData.address);
                
                // Force update the input field with the full address
                onChange(placeData.address);
                setSelectedPlace(placeData);
                
                // Also update the input element directly to ensure it shows the full address
                if (inputRef.current) {
                  inputRef.current.value = placeData.address;
                  console.log('AddressAutocomplete: Updated input.value to:', inputRef.current.value);
                }
                
                // Use setTimeout to ensure the input field gets updated after React re-render
                setTimeout(() => {
                  if (inputRef.current && inputRef.current.value !== placeData.address) {
                    console.log('AddressAutocomplete: Forcing input update after delay');
                    inputRef.current.value = placeData.address;
                    onChange(placeData.address);
                  }
                }, 10);
                
                // Check if address is complete (has street number, route, city, state)
                const isComplete = placeData.parsedAddress && 
                  placeData.parsedAddress.streetNumber && 
                  placeData.parsedAddress.route && 
                  placeData.parsedAddress.locality && 
                  placeData.parsedAddress.administrativeArea;
                
                setIsAddressComplete(isComplete);
                
                // Call the onPlaceSelect callback with full place data
                if (onPlaceSelect) {
                  onPlaceSelect(placeData);
                }
              }
            }
          );
          
          console.log('AddressAutocomplete: Initialized successfully');
        } catch (error) {
          console.error('Failed to initialize address autocomplete:', error);
          setError('Failed to load address autocomplete. Please check your Google Maps API key.');
        } finally {
          setIsLoading(false);
        }
      };

      // Add a small delay to ensure the input is fully rendered
      const timer = setTimeout(() => {
        initAutocomplete();
      }, 100);

      // Cleanup function
      return () => {
        clearTimeout(timer);
        if (autocomplete) {
          try {
            // Remove event listeners if needed
            window.google?.maps?.event?.clearInstanceListeners?.(autocomplete);
          } catch (e) {
            console.warn('Error cleaning up autocomplete:', e);
          }
        }
      };
    }
  }, [onChange, onPlaceSelect, disabled]);

  const handleInputChange = (e) => {
    // Only update if this is a manual input change (not from autocomplete selection)
    if (!selectedPlace || e.target.value !== selectedPlace.address) {
      onChange(e.target.value);
      // Clear selected place when user manually types
      setSelectedPlace(null);
      setIsAddressComplete(false);
    }
  };

  return (
    <div className={`address-autocomplete ${className}`}>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={isLoading ? "Loading autocomplete..." : placeholder}
          required={required}
          disabled={disabled || isLoading}
          className="address-input"
          autoComplete="off"
        />
        {isLoading && (
          <div className="autocomplete-loading">
            <small>Loading address autocomplete...</small>
          </div>
        )}
      </div>
      
      {error && (
        <div className="autocomplete-error">
          <small>{error}</small>
        </div>
      )}
      
      {disabled && !error && (
        <div className="autocomplete-disabled">
          <small>Address autocomplete is disabled. Please check your Google Maps API key.</small>
        </div>
      )}
      
      {!disabled && !isLoading && !error && !selectedPlace && (
        <div className="autocomplete-help">
          <small>Start typing to see address suggestions</small>
        </div>
      )}
      
      {selectedPlace && (
        <div className={`address-feedback ${isAddressComplete ? 'complete' : 'incomplete'}`}>
          <small>
            {isAddressComplete ? (
              <span className="address-complete">
                ✓ Complete address selected: {selectedPlace.address}
              </span>
            ) : (
              <span className="address-incomplete">
                ⚠ Address may be incomplete. Please verify: {selectedPlace.address}
              </span>
            )}
          </small>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;



