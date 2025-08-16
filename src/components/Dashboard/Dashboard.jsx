import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load brands from localStorage on component mount
  useEffect(() => {
    const savedBrands = localStorage.getItem('brands');
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    }
  }, []);

  // Save brands to localStorage whenever brands change
  useEffect(() => {
    localStorage.setItem('brands', JSON.stringify(brands));
  }, [brands]);

  const handleCreateBrand = (e) => {
    e.preventDefault();
    
    if (!newBrand.name.trim()) {
      setError('Brand name is required');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const brand = {
        id: `brand-${Date.now()}`,
        name: newBrand.name.trim(),
        description: newBrand.description.trim(),
        createdAt: new Date().toISOString(),
        passCount: 0
      };

      setBrands(prev => [...prev, brand]);
      setNewBrand({ name: '', description: '' });
      setShowCreateBrand(false);
      setLoading(false);
    }, 500);
  };

  const handleManageBrand = (brandId) => {
    navigate(`/brand/${brandId}/passes`);
  };

  const handleDeleteBrand = (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      setBrands(prev => prev.filter(brand => brand.id !== brandId));
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Brand Dashboard</h1>
        <p>Manage your brands and create Apple Wallet passes</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateBrand(true)}
          >
            + Create New Brand
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {showCreateBrand && (
          <div className="create-brand-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create New Brand</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateBrand(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateBrand}>
                <div className="form-group">
                  <label htmlFor="brandName">Brand Name *</label>
                  <input
                    type="text"
                    id="brandName"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your brand name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="brandDescription">Description</label>
                  <textarea
                    id="brandDescription"
                    value={newBrand.description}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter brand description (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateBrand(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="brands-grid">
          {brands.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No Brands Yet</h3>
              <p>Create your first brand to start building Apple Wallet passes</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateBrand(true)}
              >
                Create Your First Brand
              </button>
            </div>
          ) : (
            brands.map(brand => (
              <div key={brand.id} className="brand-card">
                <div className="brand-header">
                  <h3>{brand.name}</h3>
                  <div className="brand-actions">
                    <button 
                      className="btn btn-icon"
                      onClick={() => handleDeleteBrand(brand.id)}
                      title="Delete Brand"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {brand.description && (
                  <p className="brand-description">{brand.description}</p>
                )}
                
                <div className="brand-stats">
                  <div className="stat">
                    <span className="stat-label">Passes</span>
                    <span className="stat-value">{brand.passCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Created</span>
                    <span className="stat-value">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary manage-btn"
                  onClick={() => handleManageBrand(brand.id)}
                >
                  Manage Brand
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
