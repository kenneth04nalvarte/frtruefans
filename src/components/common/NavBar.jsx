import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  // Don't show navbar on dashboard page to avoid redundancy
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleLogoClick}>
          <span className="navbar-logo">🍎</span>
          <span className="navbar-title">Apple Pass Creator</span>
        </div>
        
        <div className="navbar-actions">
          <button 
            className="navbar-btn dashboard-btn"
            onClick={handleDashboardClick}
          >
            <span className="btn-icon">📊</span>
            <span className="btn-text">Dashboard</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
