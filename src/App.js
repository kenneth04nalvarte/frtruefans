import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/common/NavBar';
import Dashboard from './components/Dashboard/Dashboard';
import PassManager from './components/PassManager/PassManager';
import PassCreate from './components/PassCreate/PassCreate';
import ModifyPass from './components/ModifyPass/ModifyPass';
import EditPassPage from './components/EditPassPage/EditPassPage';
import DinerRegistration from './components/DinerRegistration/DinerRegistration';
import DinerView from './components/DinerView/DinerView';
import QRCodeDisplay from './components/QRCodeDisplay/QRCodeDisplay';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="app-content">
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/brand/:brandId/passes" element={<PassManager />} />
            <Route path="/create" element={<PassCreate />} />
            <Route path="/edit/:passId" element={<EditPassPage />} />
            <Route path="/modify/:passId" element={<ModifyPass />} />
            <Route path="/register/:passId" element={<DinerRegistration />} />
            <Route path="/diner/:serialNumber" element={<DinerView />} />
            <Route path="/qr/:passId" element={<QRCodeDisplay />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;



