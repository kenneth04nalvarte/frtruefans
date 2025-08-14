import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (inputRef.current && !disabled) {
      let autocomplete = null;

      const initAutocomplete = async () => {
        try {
          autocomplete = await initializeAddressAutocomplete(
            inputRef.current,
            (placeData) => {
              // Update the input value with the formatted address
              onChange(placeData.address);
              
              // Call the onPlaceSelect callback with full place data
              if (onPlaceSelect) {
                onPlaceSelect(placeData);
              }
            }
          );
        } catch (error) {
          console.error('Failed to initialize address autocomplete:', error);
        }
      };

      initAutocomplete();

      // Cleanup function
      return () => {
        if (autocomplete) {
          // Remove event listeners if needed
          window.google?.maps?.event?.clearInstanceListeners?.(autocomplete);
        }
      };
    }
  }, [onChange, onPlaceSelect, disabled]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`address-autocomplete ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="address-input"
        autoComplete="off"
      />
      {disabled && (
        <div className="autocomplete-disabled">
          <small>Address autocomplete is disabled. Please check your Google Maps API key.</small>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;



