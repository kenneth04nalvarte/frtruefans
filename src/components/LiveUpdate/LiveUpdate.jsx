import React, { useState } from 'react';
import { sendLiveUpdate, getPassUpdateHistory } from '../../services/api';
import './LiveUpdate.css';

const LiveUpdate = ({ passId, onUpdateSuccess }) => {
  const [updateData, setUpdateData] = useState({
    balance: '',
    memberName: '',
    promoText: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Filter out empty fields
      const filteredData = Object.keys(updateData).reduce((acc, key) => {
        if (updateData[key] && updateData[key].trim() !== '') {
          acc[key] = updateData[key].trim();
        }
        return acc;
      }, {});

      if (Object.keys(filteredData).length === 0) {
        throw new Error('Please provide at least one field to update');
      }

      console.log('Sending live update for passId:', passId);
      console.log('Update data:', filteredData);

      const result = await sendLiveUpdate(passId, filteredData);
      
      setSuccess('Live update sent successfully!');
      setUpdateData({ balance: '', memberName: '', promoText: '' });
      
      // Call the success callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess(result);
      }

      // Refresh update history
      loadUpdateHistory();
      
    } catch (err) {
      setError(err.message || 'Failed to send live update');
      console.error('Live update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUpdateHistory = async () => {
    try {
      const history = await getPassUpdateHistory(passId);
      setUpdateHistory(history);
    } catch (err) {
      console.error('Failed to load update history:', err);
    }
  };

  const handleShowHistory = async () => {
    if (!showHistory) {
      await loadUpdateHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="live-update">
      <div className="live-update-header">
        <h3>Live Pass Update</h3>
        <p>Send real-time updates to Apple Wallet passes</p>
      </div>

      <form onSubmit={handleSubmit} className="live-update-form">
        <div className="form-group">
          <label htmlFor="balance">Balance</label>
          <input
            type="text"
            id="balance"
            name="balance"
            value={updateData.balance}
            onChange={handleInputChange}
            placeholder="e.g., $50.00"
            className="form-control"
          />
          <small>Enter the new balance for the pass</small>
        </div>

        <div className="form-group">
          <label htmlFor="memberName">Member Name</label>
          <input
            type="text"
            id="memberName"
            name="memberName"
            value={updateData.memberName}
            onChange={handleInputChange}
            placeholder="e.g., John Doe"
            className="form-control"
          />
          <small>Update the member name on the pass</small>
        </div>

        <div className="form-group">
          <label htmlFor="promoText">Promotional Text</label>
          <textarea
            id="promoText"
            name="promoText"
            value={updateData.promoText}
            onChange={handleInputChange}
            placeholder="e.g., Special offer: 20% off today!"
            className="form-control"
            rows="3"
          />
          <small>Update the promotional text on the pass</small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Sending Update...' : 'Send Live Update'}
          </button>
          
          <button
            type="button"
            onClick={handleShowHistory}
            className="btn btn-secondary"
          >
            {showHistory ? 'Hide History' : 'Show Update History'}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success:</strong> {success}
        </div>
      )}

      {showHistory && (
        <div className="update-history">
          <h4>Update History</h4>
          {updateHistory.length === 0 ? (
            <p>No update history available</p>
          ) : (
            <div className="history-list">
              {updateHistory.map((update, index) => (
                <div key={index} className="history-item">
                  <div className="history-timestamp">
                    {new Date(update.timestamp).toLocaleString()}
                  </div>
                  <div className="history-data">
                    {Object.entries(update.data).map(([key, value]) => (
                      <div key={key} className="history-field">
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="live-update-info">
        <h4>How Live Updates Work</h4>
        <ul>
          <li>Updates are sent directly to Apple's servers</li>
          <li>Passes will update automatically in users' Apple Wallets</li>
          <li>Only fill in the fields you want to update</li>
          <li>Updates are sent with secure authentication</li>
        </ul>
      </div>
    </div>
  );
};

export default LiveUpdate;
