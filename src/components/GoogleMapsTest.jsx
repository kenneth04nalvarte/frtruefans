import React, { useEffect, useState } from 'react';
import { initializeAddressAutocomplete, validateApiKey, testApiKeyPermissions } from '../services/googleMaps';

const GoogleMapsTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [autocompleteInput, setAutocompleteInput] = useState('');

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    const results = {};

    try {
      // Test 1: API Key Validation
      console.log('=== TESTING API KEY VALIDATION ===');
      results.apiKeyValid = await validateApiKey();
      console.log('API Key Valid:', results.apiKeyValid);

      // Test 2: API Key Permissions
      console.log('=== TESTING API KEY PERMISSIONS ===');
      results.permissionsValid = await testApiKeyPermissions();
      console.log('Permissions Valid:', results.permissionsValid);

      // Test 3: Autocomplete Initialization
      console.log('=== TESTING AUTOCOMPLETE INITIALIZATION ===');
      const testInput = document.createElement('input');
      testInput.id = 'test-autocomplete';
      testInput.style.position = 'absolute';
      testInput.style.left = '-9999px';
      document.body.appendChild(testInput);

      try {
        await initializeAddressAutocomplete(testInput, (placeData) => {
          console.log('Test autocomplete place selected:', placeData);
          results.autocompleteWorking = true;
          results.lastPlaceData = placeData;
        });
        results.autocompleteInitialized = true;
        console.log('Autocomplete initialized successfully');
      } catch (error) {
        results.autocompleteInitialized = false;
        results.autocompleteError = error.message;
        console.error('Autocomplete initialization failed:', error);
      } finally {
        document.body.removeChild(testInput);
      }

    } catch (error) {
      console.error('Test suite failed:', error);
      results.testError = error.message;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const handleAutocompleteTest = async () => {
    const input = document.getElementById('autocomplete-test-input');
    if (input) {
      try {
        await initializeAddressAutocomplete(input, (placeData) => {
          console.log('Manual test place selected:', placeData);
          setAutocompleteInput(placeData.address || 'No address found');
        });
        console.log('Manual autocomplete test initialized');
      } catch (error) {
        console.error('Manual autocomplete test failed:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Google Maps API Test Suite</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runTests} 
          disabled={isLoading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Results:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Manual Autocomplete Test:</h3>
        <input
          id="autocomplete-test-input"
          type="text"
          placeholder="Type an address to test autocomplete..."
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button onClick={handleAutocompleteTest} style={{ padding: '10px 20px' }}>
          Initialize Autocomplete
        </button>
        {autocompleteInput && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
            <strong>Selected Address:</strong> {autocompleteInput}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Common Issues & Solutions:</h3>
        <ul>
          <li><strong>API Key Not Configured:</strong> Check constants.js for correct API key</li>
          <li><strong>Domain Restrictions:</strong> Ensure your domain is allowed in Google Cloud Console</li>
          <li><strong>API Not Enabled:</strong> Enable Maps JavaScript API and Places API</li>
          <li><strong>Billing Issues:</strong> Ensure billing is enabled for the Google Cloud project</li>
          <li><strong>Quota Exceeded:</strong> Check usage limits in Google Cloud Console</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Information:</h3>
        <p><strong>API Key:</strong> {testResults.apiKeyValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Permissions:</strong> {testResults.permissionsValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Autocomplete:</strong> {testResults.autocompleteInitialized ? '✅ Working' : '❌ Failed'}</p>
        {testResults.autocompleteError && (
          <p><strong>Error:</strong> {testResults.autocompleteError}</p>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsTest;
