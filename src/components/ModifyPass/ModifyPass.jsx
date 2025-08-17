import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPassTemplate } from '../../services/api';
import PassCreate from '../PassCreate/PassCreate';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import './ModifyPass.css';

const ModifyPass = () => {
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
        setLoading(true);
        const passData = await getPassTemplate(passId);
        
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
      <div className="modify-pass-error">
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
      <div className="modify-pass-error">
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
    <div className="modify-pass">
      <PassCreate 
        isEditing={true}
        existingPassId={passId}
        existingData={existingData}
        onSuccess={handleBackToPassManager}
      />
    </div>
  );
};

export default ModifyPass;
