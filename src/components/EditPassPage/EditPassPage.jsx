import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPassTemplate } from '../../services/api';
import PassCreate from '../PassCreate/PassCreate';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import './EditPassPage.css';

const EditPassPage = () => {
  const { passId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [existingData, setExistingData] = useState(null);

  useEffect(() => {
    const loadPassData = async () => {
      try {
        console.log('=== LOADING PASS FOR EDIT ===');
        console.log('passId:', passId);
        
        setLoading(true);
        const passData = await getPassTemplate(passId);
        
        console.log('Loaded pass data:', passData);
        
        // Set existing data for PassCreate component
        setExistingData({
          brandName: passData.brandName || '',
          address: passData.address || '',
          promoText: passData.promoText || '',
          backgroundColor: passData.backgroundColor || '#ffffff',
          foregroundColor: passData.foregroundColor || '#000000',
          brandId: passData.brandId || ''
        });
        
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

  const handleBackToPassManager = () => {
    // Clear any cached data before navigating back
    localStorage.removeItem('passes');
    navigate(-1);
  };

  if (loading) {
    return <Loading message="Loading pass for editing..." />;
  }

  if (error) {
    return (
      <div className="edit-pass-page">
        <ErrorMessage message={error} />
        <button onClick={handleBackToPassManager} className="back-button">
          Back to Pass Manager
        </button>
      </div>
    );
  }

  if (!existingData) {
    return (
      <div className="edit-pass-page">
        <ErrorMessage message="No pass data found" />
        <button onClick={handleBackToPassManager} className="back-button">
          Back to Pass Manager
        </button>
      </div>
    );
  }

  return (
    <div className="edit-pass-page">
      <div className="edit-pass-header">
        <h1>Edit Pass Template</h1>
        <p>Modify your existing Apple Wallet pass template</p>
        <button onClick={handleBackToPassManager} className="back-button">
          ← Back to Pass Manager
        </button>
      </div>
      
      <PassCreate 
        isEditing={true}
        existingPassId={passId}
        existingData={existingData}
      />
    </div>
  );
};

export default EditPassPage;
