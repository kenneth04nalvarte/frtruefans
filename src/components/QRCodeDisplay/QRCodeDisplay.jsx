import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getPassTemplate } from '../../services/api';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const { passId } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrSize, setQrSize] = useState(256);

  useEffect(() => {
    loadTemplate();
  }, [passId]);

  const loadTemplate = async () => {
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
  };

  const getRegistrationUrl = () => {
    if (!template) return '';
    return `${window.location.origin}/register/${passId}`;
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('.qr-code canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-${passId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyRegistrationUrl = async () => {
    const url = getRegistrationUrl();
    try {
      await navigator.clipboard.writeText(url);
      alert('Registration URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Registration URL copied to clipboard!');
    }
  };

  if (loading) {
    return <Loading message="Loading QR code..." size="large" />;
  }

  if (!template) {
    return (
      <div className="error-container">
        <h2>Pass Template Not Found</h2>
        <p>The requested pass template could not be found.</p>
      </div>
    );
  }

  return (
    <div className="qr-display-container">
      <div className="qr-display-card">
        <div className="qr-header">
          <h1>QR Code for {template.brandName}</h1>
          <p>Share this QR code with your customers to register for Apple Wallet passes</p>
        </div>

        <div className="qr-content">
          <div className="qr-section">
            <h3>Registration QR Code</h3>
            <div className="qr-code">
              <QRCodeSVG
                value={getRegistrationUrl()}
                size={qrSize}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="qr-url">{getRegistrationUrl()}</p>
          </div>

          <div className="template-info">
            <h3>Pass Template Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Brand Name:</span>
                <span className="value">{template.brandName}</span>
              </div>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">{template.address}</span>
              </div>
              <div className="info-item">
                <span className="label">Promo Text:</span>
                <span className="value">{template.promoText}</span>
              </div>
              <div className="info-item">
                <span className="label">Pass ID:</span>
                <span className="value">{template.passId}</span>
              </div>
              <div className="info-item">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="qr-actions">
          <button onClick={downloadQRCode} className="btn btn-primary">
            Download QR Code
          </button>
          <button onClick={copyRegistrationUrl} className="btn btn-secondary">
            Copy Registration URL
          </button>
        </div>

        <div className="usage-instructions">
          <h3>How to Use This QR Code</h3>
          <ol>
            <li>Print this QR code and display it in your restaurant</li>
            <li>Customers can scan it with their phone camera</li>
            <li>They'll be taken to the registration page</li>
            <li>After registration, they can download their Apple Wallet pass</li>
            <li>You can also share the registration URL directly</li>
          </ol>
        </div>

        <div className="qr-size-controls">
          <label htmlFor="qrSize">QR Code Size:</label>
          <input
            type="range"
            id="qrSize"
            min="128"
            max="512"
            step="32"
            value={qrSize}
            onChange={(e) => setQrSize(parseInt(e.target.value))}
          />
          <span>{qrSize}px</span>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
