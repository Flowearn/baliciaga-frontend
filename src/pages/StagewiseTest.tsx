import React from 'react';

/**
 * Test page for Stagewise integration
 * This page helps verify that Stagewise toolbar is working correctly
 */
const StagewiseTest: React.FC = () => {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Stagewise Integration Test
        </h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              What to Look For
            </h2>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Stagewise toolbar should appear in the top-left corner</li>
              <li>The toolbar should be interactive and responsive</li>
              <li>No console errors related to Stagewise</li>
              <li>The toolbar should not interfere with page scrolling or interactions</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Test Interactions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Test Button 1
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                Test Button 2
              </button>
              <input 
                type="text" 
                placeholder="Test input field" 
                className="border border-gray-300 px-3 py-2 rounded"
              />
              <select className="border border-gray-300 px-3 py-2 rounded">
                <option>Test Option 1</option>
                <option>Test Option 2</option>
              </select>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Environment Info
            </h2>
            <div className="text-base text-yellow-700">
              <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
              <p><strong>Stagewise Enabled:</strong> {
                import.meta.env.MODE === 'development' || 
                import.meta.env.VITE_ENABLE_STAGEWISE === 'true' 
                  ? 'Yes' : 'No'
              }</p>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Troubleshooting
            </h2>
            <div className="text-base text-gray-600 space-y-2">
              <p>If Stagewise toolbar is not visible:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Check browser console for errors</li>
                <li>Verify you're in development mode</li>
                <li>Try refreshing the page</li>
                <li>Check network tab for failed requests</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagewiseTest;