import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPassTemplate } from '../../services/api';
import { COLOR_PRESETS, VALIDATION_RULES, ERROR_MESSAGES } from '../../utils/constants';
import AddressAutocomplete from './AddressAutocomplete';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import './PassCreate.css';

const PassCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdTemplate, setCreatedTemplate] = useState(null);
  
  const [formData, setFormData] = useState({
    brandName: '',
    address: '',
    promoText: '',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    brandId: ''
  });

  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    placeId: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleAddressSelect = (placeData) => {
    setLocationData({
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      placeId: placeData.placeId
    });
  };

  const handleColorPresetSelect = (preset) => {
    setFormData(prev => ({
      ...prev,
      backgroundColor: preset.backgroundColor,
      foregroundColor: preset.foregroundColor
    }));
  };

  const validateForm = () => {
    if (!formData.brandName.trim()) {
      setError(ERROR_MESSAGES.required);
      return false;
    }
    if (formData.brandName.length < VALIDATION_RULES.brandName.minLength) {
      setError(ERROR_MESSAGES.minLength(VALIDATION_RULES.brandName.minLength));
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.promoText.trim()) {
      setError('Promotional text is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const templateData = {
        ...formData,
        // Auto-generate brandId if not provided
        brandId: formData.brandId || `brand-${Date.now()}`,
        // Include location data if available
        ...(locationData.latitude && locationData.longitude && {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        })
      };

      const result = await createPassTemplate(templateData);
      
      setCreatedTemplate(result);
      setSuccess(true);
      
      // Navigate to QR code display after a short delay
      setTimeout(() => {
        navigate(`/qr/${result.passId}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to create pass template');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      brandName: '',
      address: '',
      promoText: '',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      brandId: ''
    });
    setLocationData({
      latitude: null,
      longitude: null,
      placeId: null
    });
    setError('');
    setSuccess(false);
    setCreatedTemplate(null);
  };

  if (loading) {
    return <Loading message="Creating your pass template..." size="large" />;
  }

  if (success && createdTemplate) {
    return (
      <div className="pass-create-success">
        <SuccessMessage 
          message={`Pass template "${createdTemplate.brandName}" created successfully!`}
          actionText="View QR Code"
          onAction={() => navigate(`/qr/${createdTemplate.passId}`)}
        />
        <div className="template-preview">
          <h3>Template Preview</h3>
          <div 
            className="pass-preview"
            style={{
              backgroundColor: createdTemplate.backgroundColor,
              color: createdTemplate.foregroundColor
            }}
          >
            <div className="preview-header">
              <h4>{createdTemplate.brandName}</h4>
            </div>
            <div className="preview-body">
              <p>{createdTemplate.promoText}</p>
              <p className="preview-address">{createdTemplate.address}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pass-create">
      <div className="pass-create-header">
        <h1>Create Apple Pass Template</h1>
        <p>Design your Apple Wallet pass for customers to download</p>
      </div>

      <form onSubmit={handleSubmit} className="pass-create-form">
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => setError('')}
          />
        )}

        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="brandName">Brand/Restaurant Name *</label>
            <input
              type="text"
              id="brandName"
              value={formData.brandName}
              onChange={(e) => handleInputChange('brandName', e.target.value)}
              placeholder="Enter your brand or restaurant name"
              maxLength={VALIDATION_RULES.brandName.maxLength}
              required
            />
            <small>Maximum {VALIDATION_RULES.brandName.maxLength} characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              onPlaceSelect={handleAddressSelect}
              placeholder="Enter your business address"
              required
            />
            {locationData.latitude && locationData.longitude && (
              <small className="location-info">
                ✓ Location verified: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="promoText">Promotional Text *</label>
            <textarea
              id="promoText"
              value={formData.promoText}
              onChange={(e) => handleInputChange('promoText', e.target.value)}
              placeholder="Enter promotional message for your pass"
              maxLength={VALIDATION_RULES.promoText.maxLength}
              rows={3}
              required
            />
            <small>Maximum {VALIDATION_RULES.promoText.maxLength} characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="brandId">Brand ID (Optional)</label>
            <input
              type="text"
              id="brandId"
              value={formData.brandId}
              onChange={(e) => handleInputChange('brandId', e.target.value)}
              placeholder="Leave empty to auto-generate"
            />
            <small>Used to group related passes. Auto-generated if not provided.</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Pass Design</h3>
          
          <div className="color-presets">
            <label>Color Presets</label>
            <div className="preset-grid">
              {COLOR_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className={`color-preset ${formData.backgroundColor === preset.backgroundColor ? 'selected' : ''}`}
                  style={{
                    backgroundColor: preset.backgroundColor,
                    color: preset.foregroundColor
                  }}
                  onClick={() => handleColorPresetSelect(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="color-inputs">
            <div className="form-group">
              <label htmlFor="backgroundColor">Background Color</label>
              <input
                type="color"
                id="backgroundColor"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="foregroundColor">Text Color</label>
              <input
                type="color"
                id="foregroundColor"
                value={formData.foregroundColor}
                onChange={(e) => handleInputChange('foregroundColor', e.target.value)}
              />
            </div>
          </div>

          <div className="pass-preview">
            <label>Preview</label>
            <div 
              className="preview-card"
              style={{
                backgroundColor: formData.backgroundColor,
                color: formData.foregroundColor
              }}
            >
              <div className="preview-header">
                <h4>{formData.brandName || 'Your Brand Name'}</h4>
              </div>
              <div className="preview-body">
                <p>{formData.promoText || 'Your promotional message will appear here'}</p>
                <p className="preview-address">{formData.address || 'Your address will appear here'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Reset Form
          </button>
          <button type="submit" className="btn btn-primary">
            Create Pass Template
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassCreate;



