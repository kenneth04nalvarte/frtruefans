import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getDinerPass, getPassTemplate, downloadPassFile, downloadPassWithFetch, downloadPassNewWindow } from '../../services/api';
import PassUpdateService from '../../services/PassUpdateService';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import './DinerView.css';

const DinerView = () => {
  const { serialNumber } = useParams();
  const [dinerPass, setDinerPass] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  const [downloadStatus, setDownloadStatus] = useState(null); // 'success', 'error', null
  const [updateService] = useState(new PassUpdateService());
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, polling: false });

  const loadDinerPass = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDinerPass(serialNumber);
      setDinerPass(data);
      
      // Load template data for display
      if (data.passId) {
        try {
          const templateData = await getPassTemplate(data.passId);
          setTemplate(templateData);
        } catch (templateError) {
          console.warn('Could not load template data:', templateError);
        }
      }
    } catch (err) {
      setError('Failed to load diner pass');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [serialNumber]);

  // Handle pass updates from SSE
  const handlePassUpdate = useCallback((update) => {
    console.log('Pass updated:', update);
    
    // Refresh pass data
    loadDinerPass();
    
    // Show success message
    alert('Your pass has been updated!');
  }, [loadDinerPass]);

  // Connect to SSE when component mounts
  useEffect(() => {
    if (dinerPass && dinerPass.passId) {
      // Generate a simple user ID from the serial number for demo purposes
      const userId = `user-${serialNumber}`;
      
      // Connect to SSE
      updateService.connect(userId, handlePassUpdate);
      
      // Subscribe to this specific pass
      updateService.subscribeToPass(dinerPass.passId);
      
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission();
      }
      
      // Update connection status periodically
      const statusInterval = setInterval(() => {
        setConnectionStatus(updateService.getConnectionStatus());
      }, 5000);
      
      // Cleanup on unmount
      return () => {
        updateService.unsubscribeFromPass(dinerPass.passId);
        updateService.disconnect();
        clearInterval(statusInterval);
      };
    }
  }, [dinerPass, serialNumber, updateService, handlePassUpdate]);

  useEffect(() => {
    loadDinerPass();
  }, [loadDinerPass]);

  const handleDownload = async (method = 'direct') => {
    setDownloading(true);
    setDownloadStatus(null);

    try {
      switch (method) {
        case 'direct':
          downloadPassFile(serialNumber);
          break;
        case 'fetch':
          await downloadPassWithFetch(serialNumber);
          break;
        case 'window':
          downloadPassNewWindow(serialNumber);
          break;
        default:
          downloadPassFile(serialNumber);
      }

      // Show success after a short delay
      setTimeout(() => {
        setDownloadStatus('success');
        setDownloading(false);
      }, 2000);

    } catch (err) {
      console.error('Download failed:', err);
      setDownloadStatus('error');
      setDownloading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your pass..." size="large" />;
  }

  if (!dinerPass) {
    return (
      <div className="error-container">
        <h2>Pass Not Found</h2>
        <p>The requested pass could not be found.</p>
      </div>
    );
  }

  return (
    <div className="diner-view-container">
      <div className="diner-view-card">
        <div className="success-icon">✓</div>
        <h1>Your Apple Pass is Ready!</h1>
        
        <div className="pass-info">
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{dinerPass.dinerName}</span>
          </div>
          {template && (
            <div className="info-row">
              <span className="label">Restaurant:</span>
              <span className="value">{template.brandName}</span>
            </div>
          )}
          <div className="info-row">
            <span className="label">Pass ID:</span>
            <span className="value">{dinerPass.passId}</span>
          </div>
          <div className="info-row">
            <span className="label">Serial Number:</span>
            <span className="value">{dinerPass.serialNumber}</span>
          </div>
        </div>

        <div className="download-section">
          <button 
            className={`download-btn ${downloading ? 'disabled' : ''}`}
            onClick={() => handleDownload('direct')}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download Apple Pass'}
          </button>
          
          {downloadStatus === 'success' && (
            <SuccessMessage 
              message="Pass downloaded successfully! Check your downloads folder."
            />
          )}
          
          {downloadStatus === 'error' && (
            <ErrorMessage 
              message="Download failed. Please try again or contact support."
              onRetry={() => handleDownload('direct')}
            />
          )}
        </div>

        <div className="instructions">
          <h3>How to add to Apple Wallet:</h3>
          <ol>
            <li>Download the pass file (it will be saved to your Downloads folder)</li>
            <li>Open the downloaded .pkpass file</li>
            <li>Your device will automatically open Apple Wallet</li>
            <li>Tap "Add" to add the pass to your wallet</li>
            <li>You'll receive location-based notifications when you're near the restaurant</li>
          </ol>
        </div>

        {/* Connection status for real-time updates */}
        <div className="connection-status">
          <h4>Real-time Updates:</h4>
          <div className="status-indicator">
            <span className={`status-dot ${connectionStatus.connected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {connectionStatus.connected ? 'Connected' : connectionStatus.polling ? 'Polling' : 'Disconnected'}
            </span>
          </div>
          <small>You'll be notified when your pass is updated by the restaurant</small>
        </div>

        {/* Alternative download methods for testing */}
        <div className="alternative-methods">
          <h4>Alternative Download Methods (if needed):</h4>
          <div className="method-buttons">
            <button 
              onClick={() => handleDownload('fetch')}
              className="btn btn-secondary"
              disabled={downloading}
            >
              Download with Fetch
            </button>
            <button 
              onClick={() => handleDownload('window')}
              className="btn btn-secondary"
              disabled={downloading}
            >
              Open in New Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DinerView;
