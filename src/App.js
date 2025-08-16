import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PassManager from './components/PassManager/PassManager';
import PassCreate from './components/PassCreate/PassCreate';
import DinerRegistration from './components/DinerRegistration/DinerRegistration';
import DinerView from './components/DinerView/DinerView';
import QRCodeDisplay from './components/QRCodeDisplay/QRCodeDisplay';
import PassUpdateService from './services/PassUpdateService';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize global pass update service
    const initializePassUpdateService = () => {
      // For demo purposes, we'll use a simple user ID
      // In a real app, this would come from authentication
      const userId = 'global-user';
      
      const updateService = new PassUpdateService();
      updateService.connect(userId, (update) => {
        // Global pass update handler
        console.log('Global pass update received:', update);
        
        // You could show a toast notification here
        if (update.message) {
          // Simple alert for demo - in production, use a proper toast library
          console.log('Pass Update:', update.message);
        }
      });
      
      // Store service instance for cleanup
      window.globalPassUpdateService = updateService;
    };

    // Initialize the service
    initializePassUpdateService();
    
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    
    // Cleanup on unmount
    return () => {
      if (window.globalPassUpdateService) {
        window.globalPassUpdateService.disconnect();
      }
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brand/:brandId/passes" element={<PassManager />} />
          <Route path="/create" element={<PassCreate />} />
          <Route path="/register/:passId" element={<DinerRegistration />} />
          <Route path="/diner/:serialNumber" element={<DinerView />} />
          <Route path="/qr/:passId" element={<QRCodeDisplay />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



