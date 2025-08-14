import React from 'react';
import './SuccessMessage.css';

const SuccessMessage = ({ message, onAction, actionText }) => {
  return (
    <div className="success-message">
      <div className="success-icon">✓</div>
      <div className="success-content">
        <p className="success-text">{message}</p>
        {onAction && actionText && (
          <button className="btn btn-action" onClick={onAction}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;



