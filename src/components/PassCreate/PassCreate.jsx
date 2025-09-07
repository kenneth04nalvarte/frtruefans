import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPassTemplateWithImages, updatePassTemplate } from '../../services/api';
import { COLOR_PRESETS, VALIDATION_RULES, ERROR_MESSAGES } from '../../utils/constants';
import AddressAutocomplete from './AddressAutocomplete';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import './PassCreate.css';

const PassCreate = ({ 
  isEditing = false, 
  existingPassId = null, 
  existingData = null 
}) => {
  console.log('=== COMPONENT VERSION TEST ===');
  console.log('This is the DEDICATED PassCreate component - ONLY for creation');
  console.log('=== END VERSION TEST ===');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdTemplate, setCreatedTemplate] = useState(null);
  
  const [formData, setFormData] = useState(
    isEditing && existingData ? existingData : {
      brandName: '',
      address: '',
      promoText: '',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      brandId: ''
    }
  );

  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    placeId: null
  });

  // Image upload state
  const [imageFiles, setImageFiles] = useState({
    iconImage: null,
    logoImage: null,
    stripImage: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    iconImage: null,
    logoImage: null,
    stripImage: null
  });

  // Load brand data for form pre-filling
  useEffect(() => {
    const brandId = searchParams.get('brandId');
    
    if (brandId) {
      const savedBrands = localStorage.getItem('brands');
      if (savedBrands) {
        const brands = JSON.parse(savedBrands);
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
          setFormData(prev => ({
            ...prev,
            brandName: brand.name,
            brandId: brand.id
          }));
        }
      }
    }
  }, [searchParams]);
  


  // Image validation function
  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and GIF images are allowed';
    }
    
    return null;
  };

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setError(error);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Store file for form submission - convert type to correct property name
      const propertyName = type === 'icon' ? 'iconImage' : 
                          type === 'logo' ? 'logoImage' : 
                          type === 'strip' ? 'stripImage' : type;
      
      setImageFiles(prev => ({
        ...prev,
        [propertyName]: file
      }));
      
      setError(''); // Clear any previous errors
    }
  };

  // Remove image
  const handleRemoveImage = (type) => {
    // Convert type to the correct property name
    const propertyName = type === 'icon' ? 'iconImage' : 
                        type === 'logo' ? 'logoImage' : 
                        type === 'strip' ? 'stripImage' : type;
    
    setImageFiles(prev => ({
      ...prev,
      [propertyName]: null
    }));
    setImagePreviews(prev => ({
      ...prev,
      [propertyName]: null
    }));
  };

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

      let result;
      if (isEditing && existingPassId) {
        // UPDATE existing pass using JSON endpoint
        console.log('=== SUBMITTING UPDATE ===');
        console.log('Using PUT JSON endpoint for passId:', existingPassId);
        console.log('Template data:', templateData);
        
        result = await updatePassTemplate(existingPassId, templateData);
        
        setSuccess(true);
        setCreatedTemplate(result);
        
        // Navigate back to PassManager after a short delay to show updated data
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const brandId = urlParams.get('brandId');
          if (brandId) {
            navigate(`/brand/${brandId}`);
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        // CREATE new pass (unchanged)
        console.log('=== SUBMITTING CREATE ===');
        console.log('Using POST endpoint for new pass');
        console.log('Template data:', templateData);
        result = await createPassTemplateWithImages(templateData, imageFiles);
        setCreatedTemplate(result);
        setSuccess(true);
        
        // Navigate to QR code display after a short delay
        setTimeout(() => {
          navigate(`/qr/${result.passId}`);
        }, 2000);
      }
      
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} pass template`);
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
    setImageFiles({
      iconImage: null,
      logoImage: null,
      stripImage: null
    });
    setImagePreviews({
      iconImage: null,
      logoImage: null,
      stripImage: null
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
          message={isEditing ? 
            `Pass template "${createdTemplate.brandName}" updated successfully! All existing passes will update automatically on phones!` :
            `Pass template "${createdTemplate.brandName}" created successfully!`}
          actionText="View QR Code"
          onAction={() => {
            navigate(`/qr/${createdTemplate.passId}`);
          }}
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
        <h1>{isEditing ? 'Edit Apple Pass Template' : 'Create Apple Pass Template'}</h1>
        <p>{isEditing ? 'Modify your existing Apple Wallet pass template' : 'Design your Apple Wallet pass for customers to download'}</p>
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
          <h3>Pass Images</h3>
          <p className="section-description">Upload images for your pass. All images are optional but recommended for better appearance.</p>
          
          <div className="image-upload-grid">
            {/* Icon Image */}
            <div className="image-preview">
              <label htmlFor="iconImage" className="image-upload-label">
                <div className="upload-area">
                  {imagePreviews.iconImage ? (
                    <img src={imagePreviews.iconImage} alt="Icon preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📱</span>
                      <span>Icon Image</span>
                      <small>Recommended: 29x29px</small>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="iconImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'icon')}
                  style={{ display: 'none' }}
                />
              </label>
              {imagePreviews.iconImage && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage('icon')}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Logo Image */}
            <div className="image-preview">
              <label htmlFor="logoImage" className="image-upload-label">
                <div className="upload-area">
                  {imagePreviews.logoImage ? (
                    <img src={imagePreviews.logoImage} alt="Logo preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">🏢</span>
                      <span>Logo Image</span>
                      <small>Recommended: 160x50px</small>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="logoImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'logo')}
                  style={{ display: 'none' }}
                />
              </label>
              {imagePreviews.logoImage && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage('logo')}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Strip Image */}
            <div className="image-preview">
              <label htmlFor="stripImage" className="image-upload-label">
                <div className="upload-area">
                  {imagePreviews.stripImage ? (
                    <img src={imagePreviews.stripImage} alt="Strip preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">🎨</span>
                      <span>Strip Image</span>
                      <small>Recommended: 320x123px</small>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="stripImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'strip')}
                  style={{ display: 'none' }}
                />
              </label>
              {imagePreviews.stripImage && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage('strip')}
                >
                  Remove
                </button>
              )}
            </div>
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
                      {isEditing ? 'Update Pass Template' : 'Create Pass Template'}
        </button>
        </div>
      </form>
    </div>
  );
};

export default PassCreate;



