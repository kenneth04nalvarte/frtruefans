import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPassTemplate, createDinerPass } from '../../services/api';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import './DinerRegistration.css';

const DinerRegistration = () => {
  const { passId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [dinerData, setDinerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    heardAbout: ''
  });

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPassTemplate(passId);
      setTemplate(data);
    } catch (err) {
      setError('Failed to load pass template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [passId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleInputChange = (field, value) => {
    setDinerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dinerData.firstName || !dinerData.lastName || !dinerData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await createDinerPass({
        passId,
        ...dinerData
      });
      
      setSuccess(true);
      
      // Navigate to diner view after a short delay
      setTimeout(() => {
        navigate(`/diner/${response.serialNumber}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to create diner pass');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading pass template..." size="large" />;
  }

  if (!template) {
    return (
      <div className="error-container">
        <h2>Pass Template Not Found</h2>
        <p>The requested pass template could not be found.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h2>Registration Successful!</h2>
        <p>Your Apple Pass is being generated...</p>
      </div>
    );
  }

  return (
    <div className="diner-registration">
      <div className="registration-header">
        <h1>Join {template.brandName}</h1>
        <p>Register to get your personalized Apple Wallet pass</p>
      </div>

      <div className="registration-content">
        <div className="template-preview">
          <h3>Pass Preview</h3>
          <div 
            className="pass-preview"
            style={{
              backgroundColor: template.backgroundColor,
              color: template.foregroundColor
            }}
          >
            <div className="preview-header">
              <h4>{template.brandName}</h4>
            </div>
            <div className="preview-body">
              <p>{template.promoText}</p>
              <p className="preview-address">{template.address}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={() => setError('')}
            />
          )}

          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={dinerData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={dinerData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={dinerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={dinerData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                value={dinerData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="heardAbout">How did you hear about us?</label>
              <select
                id="heardAbout"
                value={dinerData.heardAbout}
                onChange={(e) => handleInputChange('heardAbout', e.target.value)}
              >
                <option value="">Select an option</option>
                <option value="social-media">Social Media</option>
                <option value="friend">Friend/Family</option>
                <option value="advertisement">Advertisement</option>
                <option value="walk-in">Walk-in</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn submit-btn" disabled={submitting}>
              {submitting ? 'Creating Pass...' : 'Get My Apple Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DinerRegistration;
