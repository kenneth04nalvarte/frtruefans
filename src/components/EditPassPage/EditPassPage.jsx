import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPassTemplate } from '../../services/api';
import PassCreate from '../PassCreate/PassCreate';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import './EditPassPage.css';

const EditPassPage = () => {
  const { passId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [existingData, setExistingData] = useState(null);

  // Load existing pass data
  useEffect(() => {
    const loadPassData = async () => {
      try {
        console.log('=== LOADING PASS TEMPLATE FOR EDIT ===');
        console.log('passId:', passId);
        
        setLoading(true);
        const passData = await getPassTemplate(passId);
        
        console.log('Loaded template data:', passData);
        
        // Prepare existing data for PassCreate component
        const dataForPassCreate = {
          brandName: passData.brandName || '',
          address: passData.address || '',
          promoText: passData.promoText || '',
          backgroundColor: passData.backgroundColor || '#ffffff',
          foregroundColor: passData.foregroundColor || '#000000',
          brandId: passData.brandId || '',
          latitude: passData.latitude || null,
          longitude: passData.longitude || null,
          placeId: passData.placeId || null
        };
        
        console.log('=== PASS CREATE PROPS DEBUG ===');
        console.log('isEditing: true');
        console.log('existingPassId:', passId);
        console.log('existingData:', dataForPassCreate);
        console.log('=== END DEBUG ===');
        
        setExistingData(dataForPassCreate);
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
    const brandId = searchParams.get('brandId');
    if (brandId) {
      // Force refresh when returning to pass manager
      // Clear any cached data and force API refresh
      localStorage.removeItem(`passes_${brandId}`);
      console.log('Cleared localStorage before returning to PassManager');
      navigate(`/brand/${brandId}/passes`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <Loading message="Loading pass data..." size="large" />;
  }

  if (error) {
    return (
      <div className="edit-pass-error">
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
        <button className="btn btn-secondary" onClick={handleBackToPassManager}>
          Back to Pass Manager
        </button>
      </div>
    );
  }

  if (!existingData) {
    return (
      <div className="edit-pass-error">
        <ErrorMessage 
          message="No pass data found" 
          onRetry={() => window.location.reload()} 
        />
        <button className="btn btn-secondary" onClick={handleBackToPassManager}>
          Back to Pass Manager
        </button>
      </div>
    );
  }

  return (
    <div className="edit-pass-page">
      <PassCreate 
        isEditing={true}
        existingPassId={passId}
        existingData={existingData}
        onSuccess={handleBackToPassManager}
      />
    </div>
  );
};

export default EditPassPage;
