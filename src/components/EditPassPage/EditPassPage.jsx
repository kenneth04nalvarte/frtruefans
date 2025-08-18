import React from 'react';
import { useParams } from 'react-router-dom';
import EditPass from '../EditPass/EditPass';
import './EditPassPage.css';

const EditPassPage = () => {
  const { passId } = useParams();
  
  console.log('=== EDIT PASS PAGE ===');
  console.log('Using dedicated EditPass component for passId:', passId);
  console.log('=== END EDIT PASS PAGE ===');

  return (
    <div className="edit-pass-page">
      <EditPass passId={passId} />
    </div>
  );
};

export default EditPassPage;
