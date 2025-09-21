import React, { useState } from 'react';
import { gstAPI } from '../services/gstAPI';

const HSNAPITest = () => {
  const [testResult, setTestResult] = useState('');
  const [searchText, setSearchText] = useState('9403');
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing HSN API...');
    
    try {
      const isWorking = await gstAPI.testHSNAPI();
      if (isWorking) {
        setTestResult('✅ Real HSN API is working correctly!');
      } else {
        setTestResult('❌ HSN API test failed - using fallback data');
      }
    } catch (error) {
      setTestResult(`❌ Error testing API: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const searchHSN = async () => {
    if (!searchText.trim()) return;
    
    setIsLoading(true);
    setSearchResult(null);
    
    try {
      const response = await gstAPI.search(searchText, 'code');
      setSearchResult(response);
    } catch (error) {
      setSearchResult({ error: error.message });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">HSN API Test</h1>
        <p className="text-gray-600">
          Test the Government HSN API integration to ensure real data is being used.
        </p>
      </div>

      <div className="space-y-6">
        {/* API Test */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Connection Test</h3>
          <button 
            onClick={testAPI}
            disabled={isLoading}
            className="btn btn-primary mb-4"
          >
            {isLoading ? 'Testing...' : 'Test HSN API Connection'}
          </button>
          
          {testResult && (
            <div className={`p-3 rounded-md ${
              testResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {testResult}
            </div>
          )}
        </div>

        {/* Search Test */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">HSN Search Test</h3>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Enter HSN code (e.g., 9403)"
              className="input flex-1"
            />
            <button 
              onClick={searchHSN}
              disabled={isLoading || !searchText.trim()}
              className="btn btn-primary"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResult && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Search Result:</h4>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </div>
              
              {searchResult.statusText && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  searchResult.statusText.includes('Fallback') 
                    ? 'bg-yellow-50 text-yellow-800' 
                    : 'bg-green-50 text-green-800'
                }`}>
                  <strong>Source:</strong> {searchResult.statusText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card p-6 bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Using Real HSN API</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>Current Setup:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>✅ Backend proxy endpoint: <code>/api/master-data/hsn-search/</code></li>
              <li>✅ Government GST API integration with proper headers</li>
              <li>✅ Fallback to comprehensive mock data when API is unavailable</li>
              <li>✅ Error handling and logging for debugging</li>
            </ul>
            
            <p className="mt-4"><strong>What this means:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your application tries to use the real Government HSN API first</li>
              <li>If the government API is down/blocked, it falls back to local data</li>
              <li>The local data contains 200+ HSN codes relevant to furniture business</li>
              <li>This ensures your application always works, even when the government API is unavailable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSNAPITest;