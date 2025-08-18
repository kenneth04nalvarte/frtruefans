import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updatePassTemplateWithImages, getPassTemplate } from '../../services/api';
import { API_BASE_URL } from '../../utils/constants';
import { COLOR_PRESETS, ERROR_MESSAGES } from '../../utils/constants';
import AddressAutocomplete from '../PassCreate/AddressAutocomplete';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import './EditPass.css';

const EditPass = ({ passId }) => {
  console.log('=== EDIT PASS COMPONENT ===');
  console.log('This is the DEDICATED EditPass component - ONLY for updates');
  console.log('passId:', passId);
  console.log('=== END EDIT PASS COMPONENT ===');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [updatedTemplate, setUpdatedTemplate] = useState(null);
  
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

  // Image upload state
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
        console.log('=== LOADING PASS FOR EDIT ===');
        console.log('passId:', passId);
        
        setLoading(true);
        const passData = await getPassTemplate(passId);
        
        console.log('Loaded pass data:', passData);
        
        // Set form data from existing pass
        setFormData({
          brandName: passData.brandName || '',
          address: passData.address || '',
          promoText: passData.promoText || '',
          backgroundColor: passData.backgroundColor || '#ffffff',
          foregroundColor: passData.foregroundColor || '#000000',
          brandId: passData.brandId || ''
        });

        // Set location data
        setLocationData({
          latitude: passData.latitude || null,
          longitude: passData.longitude || null,
          placeId: passData.placeId || null
        });

                 // Brand data is not needed since we're not using localStorage
        
        console.log('=== PASS DATA LOADED ===');
        console.log('=== END PASS DATA LOADED ===');
        
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (type, color) => {
    setFormData(prev => ({
      ...prev,
      [type]: color
    }));
  };

  const handleLocationSelect = (place) => {
    setLocationData({
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      placeId: place.place_id
    });
    setFormData(prev => ({
      ...prev,
      address: place.formatted_address
    }));
  };

  const handleImageUpload = (type, file) => {
    if (file) {
      setImageFiles(prev => ({
        ...prev,
        [type]: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.brandName.trim()) {
      errors.push(ERROR_MESSAGES.brandName.required);
    }
    
    if (!formData.address.trim()) {
      errors.push(ERROR_MESSAGES.address.required);
    }
    
    if (!formData.promoText.trim()) {
      errors.push(ERROR_MESSAGES.promoText.required);
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      console.log('=== SUBMITTING UPDATE ===');
      console.log('passId:', passId);
      console.log('Form data:', formData);
      console.log('Image files:', imageFiles);
      console.log('=== END SUBMITTING UPDATE ===');

      // Prepare template data
      const templateData = {
        brandName: formData.brandName,
        address: formData.address,
        promoText: formData.promoText,
        backgroundColor: formData.backgroundColor,
        foregroundColor: formData.foregroundColor,
        brandId: formData.brandId || `brand-${Date.now()}`
      };
      
      // Add location data if available
      if (locationData.latitude && locationData.longitude) {
        templateData.latitude = locationData.latitude;
        templateData.longitude = locationData.longitude;
      }

      // UPDATE existing pass (NOT create)
      console.log('=== CALLING UPDATE API ===');
      console.log('passId:', passId);
      console.log('URL:', `${API_BASE_URL}/api/passes/templates/${passId}`);
      console.log('Method: PUT');
      const result = await updatePassTemplateWithImages(passId, templateData, imageFiles);
      
      console.log('=== UPDATE SUCCESS ===');
      console.log('Updated pass result:', result);
      console.log('=== END UPDATE SUCCESS ===');

      // DO NOT update localStorage - let API be the source of truth
      console.log('NOT updating localStorage - API is source of truth');
      
      setUpdatedTemplate(result);
      setSuccess(true);
      
      // Navigate back to pass manager after success
      setTimeout(() => {
        const brandId = searchParams.get('brandId');
        if (brandId) {
          console.log('Navigating back to PassManager');
          navigate(`/brand/${brandId}/passes`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to update pass template');
      console.error('Error updating pass:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    // Reset to original data
    window.location.reload();
  };

  if (loading) {
    return <Loading message="Loading pass data..." size="large" />;
  }

  if (success && updatedTemplate) {
    return (
      <div className="edit-pass-success">
        <SuccessMessage 
          message={`Pass "${updatedTemplate.brandName}" updated successfully!`}
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
        <div className="template-preview">
          <h3>Updated Template Preview</h3>
          <div 
            className="pass-preview"
            style={{
              backgroundColor: updatedTemplate.backgroundColor,
              color: updatedTemplate.foregroundColor
            }}
          >
            <div className="preview-header">
              <h4>{updatedTemplate.brandName}</h4>
            </div>
            <div className="preview-body">
              <p>{updatedTemplate.promoText}</p>
              <p className="preview-address">{updatedTemplate.address}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-pass">
      <div className="edit-pass-header">
        <h1>Update Pass Template</h1>
        <p>Modify your existing Apple Wallet pass</p>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => setError('')} 
        />
      )}

      <form onSubmit={handleSubmit} className="edit-pass-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="brandName">Brand Name *</label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              placeholder="Enter brand name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <AddressAutocomplete
              value={formData.address}
              onPlaceSelect={handleLocationSelect}
              placeholder="Enter address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="promoText">Promotional Text *</label>
            <textarea
              id="promoText"
              name="promoText"
              value={formData.promoText}
              onChange={handleInputChange}
              placeholder="Enter promotional text"
              rows="3"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Design & Colors</h2>
          
          <div className="color-section">
            <div className="form-group">
              <label>Background Color</label>
              <div className="color-inputs">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Foreground Color</label>
              <div className="color-inputs">
                <input
                  type="color"
                  value={formData.foregroundColor}
                  onChange={(e) => handleColorChange('foregroundColor', e.target.value)}
                />
                <input
                  type="text"
                  value={formData.foregroundColor}
                  onChange={(e) => handleColorChange('foregroundColor', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div className="color-presets">
            <h3>Quick Color Presets</h3>
            <div className="preset-grid">
              {COLOR_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className="preset-btn"
                  style={{
                    background: `linear-gradient(45deg, ${preset.backgroundColor}, ${preset.foregroundColor})`
                  }}
                  onClick={() => {
                    handleColorChange('backgroundColor', preset.backgroundColor);
                    handleColorChange('foregroundColor', preset.foregroundColor);
                  }}
                  title={`${preset.name} - ${preset.backgroundColor} / ${preset.foregroundColor}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Images (Optional)</h2>
          <p>Upload new images to replace existing ones</p>
          
          <div className="image-upload-section">
            <div className="image-upload-group">
              <label>Icon Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('icon', e.target.files[0])}
              />
              {imagePreviews.icon && (
                <div className="image-preview">
                  <img src={imagePreviews.icon} alt="Icon preview" />
                </div>
              )}
            </div>

            <div className="image-upload-group">
              <label>Logo Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('logo', e.target.files[0])}
              />
              {imagePreviews.logo && (
                <div className="image-preview">
                  <img src={imagePreviews.logo} alt="Logo preview" />
                </div>
              )}
            </div>

            <div className="image-upload-group">
              <label>Strip Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('strip', e.target.files[0])}
              />
              {imagePreviews.strip && (
                <div className="image-preview">
                  <img src={imagePreviews.strip} alt="Strip preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={submitting}
          >
            Reset to Original
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Pass'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPass;
