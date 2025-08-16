import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createPassTemplate, getPassTemplate } from '../../services/api';
import { COLOR_PRESETS, VALIDATION_RULES, ERROR_MESSAGES } from '../../utils/constants';
import AddressAutocomplete from '../PassCreate/AddressAutocomplete';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import './ModifyPass.css';

const ModifyPass = () => {
  const { passId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [originalPass, setOriginalPass] = useState(null);
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
  const [imageFiles, setImageFiles] = useState({
    icon: null,
    logo: null,
    strip: null
  });
  const [imagePreviews, setImagePreviews] = useState({
    icon: null,
    logo: null,
    strip: null
  });

  // Load existing pass data
  useEffect(() => {
    const loadPassData = async () => {
      try {
        setLoading(true);
        const passData = await getPassTemplate(passId);
        setOriginalPass(passData);
        
        // Pre-fill form with existing data
        setFormData({
          brandName: passData.brandName || '',
          address: passData.address || '',
          promoText: passData.promoText || '',
          backgroundColor: passData.backgroundColor || '#ffffff',
          foregroundColor: passData.foregroundColor || '#000000',
          brandId: passData.brandId || ''
        });

        // Set location data if available
        if (passData.latitude && passData.longitude) {
          setLocationData({
            latitude: passData.latitude,
            longitude: passData.longitude,
            placeId: passData.placeId || null
          });
        }
      } catch (err) {
        setError('Failed to load pass data. Please try again.');
        console.error('Error loading pass:', err);
      } finally {
        setLoading(false);
      }
    };

    if (passId) {
      loadPassData();
    }
  }, [passId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        setImagePreviews(prev => ({ ...prev, [type]: e.target.result }));
      };
      reader.readAsDataURL(file);

      // Store file for form submission
      setImageFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleRemoveImage = (type) => {
    setImageFiles(prev => ({ ...prev, [type]: null }));
    setImagePreviews(prev => ({ ...prev, [type]: null }));
  };

  const validateForm = () => {
    if (!formData.brandName.trim()) {
      setError('Brand name is required');
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

    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Prepare template data object
      const templateData = {
        brandName: formData.brandName,
        address: formData.address,
        promoText: formData.promoText,
        backgroundColor: formData.backgroundColor,
        foregroundColor: formData.foregroundColor,
        brandId: formData.brandId || `brand-${Date.now()}`,
        passId: passId // Include the original pass ID for update
      };

      // Add location data if available
      if (locationData.latitude && locationData.longitude) {
        templateData.latitude = locationData.latitude;
        templateData.longitude = locationData.longitude;
      }

      // Add each field to FormData
      Object.keys(templateData).forEach(key => {
        if (templateData[key] !== null && templateData[key] !== undefined) {
          formDataToSend.append(key, templateData[key]);
        }
      });

      // Add image files if provided
      if (imageFiles.icon) formDataToSend.append('iconImage', imageFiles.icon);
      if (imageFiles.logo) formDataToSend.append('logoImage', imageFiles.logo);
      if (imageFiles.strip) formDataToSend.append('stripImage', imageFiles.strip);

      console.log('FormData contents for update:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // eslint-disable-next-line no-unused-vars
      const result = await createPassTemplate(formDataToSend);

      setSuccess(true);
      
      // Navigate back to pass manager after a short delay
      setTimeout(() => {
        const brandId = searchParams.get('brandId');
        if (brandId) {
          navigate(`/brand/${brandId}/passes`);
        } else {
          navigate('/dashboard');
        }
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to update pass template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const brandId = searchParams.get('brandId');
    if (brandId) {
      navigate(`/brand/${brandId}/passes`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <Loading message="Loading pass data..." size="large" />;
  }

  if (success) {
    return (
      <div className="modify-pass-success">
        <SuccessMessage 
          message="Pass updated successfully! Redirecting to Pass Manager..." 
          actionText="Go to Pass Manager"
          onAction={() => {
            const brandId = searchParams.get('brandId');
            if (brandId) {
              navigate(`/brand/${brandId}/passes`);
            } else {
              navigate('/dashboard');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="modify-pass">
      <div className="modify-pass-header">
        <h1>Modify Pass Template</h1>
        <p>Update your Apple Wallet pass template</p>
      </div>

      <form onSubmit={handleSubmit} className="modify-pass-form">
        {error && (
          <ErrorMessage message={error} onRetry={() => setError('')} />
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

        <div className="form-section">
          <h3>Images (Optional)</h3>
          <div className="image-upload-grid">
            <div className="image-upload-item">
              <label htmlFor="iconImage" className="image-upload-label">
                <div className="upload-area">
                  {imagePreviews.icon ? (
                    <div className="image-preview">
                      <img src={imagePreviews.icon} alt="Icon preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImage('icon')}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">📱</div>
                      <span>Icon Image</span>
                      <small>Upload icon image</small>
                    </div>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="iconImage"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'icon')}
                style={{ display: 'none' }}
              />
            </div>

            <div className="image-upload-item">
              <label htmlFor="logoImage" className="image-upload-label">
                <div className="upload-area">
                  {imagePreviews.logo ? (
                    <div className="image-preview">
                      <img src={imagePreviews.logo} alt="Logo preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImage('logo')}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">🏢</div>
                      <span>Logo Image</span>
                      <small>Upload logo image</small>
                    </div>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="logoImage"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'logo')}
                style={{ display: 'none' }}
              />
            </div>

            <div className="image-upload-item">
              <label htmlFor="stripImage" className="image-upload-label">
                <div className="upload-area">
                  {imagePreviews.strip ? (
                    <div className="image-preview">
                      <img src={imagePreviews.strip} alt="Strip preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImage('strip')}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">🎨</div>
                      <span>Strip Image</span>
                      <small>Upload strip image</small>
                    </div>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="stripImage"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'strip')}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Updating Pass...' : 'Update Pass Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyPass;
