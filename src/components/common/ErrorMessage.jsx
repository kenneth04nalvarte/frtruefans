import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry, onClose }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠</div>
      <div className="error-content">
        <p className="error-text">{message}</p>
        <div className="error-actions">
          {onRetry && (
            <button className="btn btn-retry" onClick={onRetry}>
              Retry
            </button>
          )}
          {onClose && (
            <button className="btn btn-close" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;



