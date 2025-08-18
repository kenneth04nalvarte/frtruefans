import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPassTemplatesByBrand } from '../../services/api';
import './PassManager.css';

const PassManager = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [brand, setBrand] = useState(null);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-renders

  // Load brand and passes from API and localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load brand data from localStorage
        const savedBrands = localStorage.getItem('brands');
        if (savedBrands) {
          const brands = JSON.parse(savedBrands);
          const currentBrand = brands.find(b => b.id === brandId);
          if (currentBrand) {
            setBrand(currentBrand);
          } else {
            setError('Brand not found');
            return;
          }
        }

        // Load passes from API
        console.log('=== LOADING PASSES FROM API ===');
        console.log('brandId:', brandId);
        
                 try {
           const apiPasses = await getPassTemplatesByBrand(brandId);
           console.log('API passes:', apiPasses);
           
           if (apiPasses && Array.isArray(apiPasses)) {
             setPasses(apiPasses);
             // DO NOT save to localStorage to prevent conflicts
           } else {
             setPasses([]); // Empty array if no passes
           }
         } catch (apiError) {
           console.error('API Error loading passes:', apiError);
           setPasses([]); // Empty array on error
         }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    }, [brandId, location.pathname]); // Re-run when location changes (returning from edit)

  // Define refreshPasses with useCallback to prevent infinite re-renders
  const refreshPasses = useCallback(async () => {
    try {
      console.log('=== REFRESHING PASSES ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('brandId:', brandId);
      const apiPasses = await getPassTemplatesByBrand(brandId);
      console.log('Refreshed passes:', apiPasses);
      console.log('Pass IDs:', apiPasses?.map(p => p.passId) || 'No passes');
      console.log('Pass names:', apiPasses?.map(p => p.brandName) || 'No names');
      
      if (apiPasses && Array.isArray(apiPasses)) {
        setPasses(apiPasses);
        // DO NOT save to localStorage to prevent conflicts
        console.log('Updated passes state with', apiPasses.length, 'passes');
        
        // Check for duplicates
        const passIds = apiPasses.map(p => p.passId);
        const uniqueIds = [...new Set(passIds)];
        if (passIds.length !== uniqueIds.length) {
          console.error('DUPLICATE PASS IDs DETECTED!');
          console.error('Original IDs:', passIds);
          console.error('Unique IDs:', uniqueIds);
        }
      }
    } catch (error) {
      console.error('Error refreshing passes:', error);
    }
  }, [brandId]);

  // Force refresh when component mounts or when returning from edit page
  useEffect(() => {
    if (brandId && !loading) {
      console.log('=== FORCE REFRESH ON MOUNT OR RETURN ===');
      console.log('Current pathname:', location.pathname);
      console.log('Refresh key:', refreshKey);
      refreshPasses();
    }
  }, [brandId, loading, refreshPasses, location.pathname, refreshKey]); // Include refreshKey to force updates

  // Detect when returning from edit page and force refresh
  useEffect(() => {
    // Check if we're returning from an edit page (URL contains /edit/)
    const isReturningFromEdit = location.pathname.includes('/brand/') && 
                               !location.pathname.includes('/edit/') && 
                               !location.pathname.includes('/create') &&
                               !location.pathname.includes('/qr/');
    
    if (isReturningFromEdit && brandId) {
      console.log('=== DETECTED RETURN FROM EDIT PAGE ===');
      console.log('Forcing refresh of pass data');
      setRefreshKey(prev => prev + 1); // Increment refresh key to force re-render
    }
  }, [location.pathname, brandId]);

  // Remove automatic localStorage saving to prevent conflicts with API data

  const handleCreatePass = () => {
    navigate(`/create?brandId=${brandId}`);
  };

  const handleViewPass = (passId) => {
    navigate(`/qr/${passId}`);
  };

  const handleDeletePass = (passId) => {
    if (window.confirm('Are you sure you want to delete this pass? This action cannot be undone.')) {
      // Remove from local state immediately for better UX
      setPasses(prev => prev.filter(pass => pass.passId !== passId));
      
      // TODO: Add API call to delete pass from backend
      // Note: localStorage will be updated when API data is refreshed
    }
  };

  const handleModifyPass = (passId) => {
    navigate(`/edit/${passId}?brandId=${brandId}`);
  };

  const clearLocalStorage = () => {
    // Force refresh from API
    console.log('Forcing refresh from API');
    setRefreshKey(prev => prev + 1); // Increment refresh key to force re-render
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="pass-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading passes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pass-manager">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="pass-manager">
        <div className="error-container">
          <h2>Brand Not Found</h2>
          <p>The requested brand could not be found.</p>
          <button className="btn btn-primary" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pass-manager">
      <div className="pass-manager-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <div className="brand-info">
            <h1>{brand.name}</h1>
            <p>Pass Manager</p>
          </div>
        </div>
                 <div className="header-actions">
           <button className="btn btn-secondary refresh-btn" onClick={refreshPasses} title="Refresh Passes">
             🔄 Refresh
           </button>
           <button className="btn btn-secondary clear-cache-btn" onClick={clearLocalStorage} title="Clear Cache">
             🗑️ Clear Cache
           </button>
           <button className="btn btn-primary create-pass-btn" onClick={handleCreatePass}>
             + Create Pass
           </button>
         </div>
      </div>

      <div className="pass-manager-content">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-info">
              <span className="stat-value">{passes.length}</span>
              <span className="stat-label">Total Passes</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <span className="stat-value">
                {passes.filter(pass => {
                  const createdDate = new Date(pass.createdAt);
                  const today = new Date();
                  const diffTime = Math.abs(today - createdDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length}
              </span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-value">
                {passes.filter(pass => pass.status === 'active').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        <div className="passes-section">
          <div className="section-header">
            <h2>All Passes</h2>
            <div className="section-actions">
              <select className="filter-select">
                <option value="all">All Passes</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {passes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📱</div>
              <h3>No Passes Yet</h3>
              <p>Create your first Apple Wallet pass for {brand.name}</p>
              <button className="btn btn-primary" onClick={handleCreatePass}>
                Create Your First Pass
              </button>
            </div>
          ) : (
            <div className="passes-grid">
              {passes.map(pass => (
                <div key={pass.passId} className="pass-card">
                  <div className="pass-header">
                    <h3>{pass.brandName}</h3>
                    <div className="pass-actions">
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleDeletePass(pass.passId)}
                        title="Delete Pass"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="pass-preview" style={{
                    backgroundColor: pass.backgroundColor || '#ffffff',
                    color: pass.foregroundColor || '#000000'
                  }}>
                    <div className="preview-header">
                      <h4>{pass.brandName}</h4>
                    </div>
                    <div className="preview-body">
                      <p>{pass.promoText}</p>
                      <p className="preview-address">{pass.address}</p>
                    </div>
                  </div>
                  
                  <div className="pass-info">
                    <div className="info-row">
                      <span className="label">Pass ID:</span>
                      <span className="value">{pass.passId}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Created:</span>
                      <span className="value">
                        {new Date(pass.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Status:</span>
                      <span className={`status ${pass.status || 'active'}`}>
                        {pass.status || 'Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pass-actions-bottom">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleViewPass(pass.passId)}
                    >
                      View QR Code
                    </button>
                    <button 
                      className="btn btn-warning"
                      onClick={() => handleModifyPass(pass.passId)}
                    >
                      Modify Pass
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate(`/register/${pass.passId}`)}
                    >
                      Test Registration
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassManager;
