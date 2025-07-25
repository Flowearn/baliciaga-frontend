import React, { useEffect, useState } from 'react';
import { fetchCafes } from '../services/cafeService';

const DebugRestaurants = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const targetRestaurants = [
    { name: 'Cinta Pererenan', id: 'ChIJA31WOU050i0ROZH_hS7ypXY', type: 'cafe' },
    { name: 'HUT Bali', id: 'ChIJy1yJjCFH0i0REyjNQfSK0Vw', type: 'cafe' },
    { name: 'Penny Lane', id: 'ChIJ7SHlDCg50i0RaM29YbEeVjg', type: 'dining' },
    { name: 'YUME 夢 l Japanese Dining', id: 'ChIJcUP9ogJB0i0R6EkIXLpYpUA', type: 'dining' },
    { name: 'YUMEI NOODLES BALI', id: 'ChIJzX54qGJH0i0RVq590YDmdVY', type: 'dining' }
  ];

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {
        environment: {
          mode: import.meta.env.MODE,
          apiBase: import.meta.env.VITE_API_BASE_URL,
          isProd: import.meta.env.PROD,
          isDev: import.meta.env.DEV,
          url: window.location.href
        },
        apiTests: {},
        restaurantStatus: {}
      };

      try {
        // Test cafe endpoint
        const cafes = await fetchCafes('cafe');
        info.apiTests.cafe = {
          total: cafes.length,
          error: null
        };

        // Check cafe restaurants
        targetRestaurants.filter(r => r.type === 'cafe').forEach(({ name, id }) => {
          const found = cafes.find(c => c.placeId === id);
          info.restaurantStatus[name] = {
            found: !!found,
            data: found || null
          };
        });

        // Test dining endpoint
        const dining = await fetchCafes('dining');
        info.apiTests.dining = {
          total: dining.length,
          error: null
        };

        // Check dining restaurants
        targetRestaurants.filter(r => r.type === 'dining').forEach(({ name, id }) => {
          const found = dining.find(d => d.placeId === id);
          info.restaurantStatus[name] = {
            found: !!found,
            data: found || null
          };
        });

        // Test food endpoint
        const food = await fetchCafes('food');
        info.apiTests.food = {
          total: food.length,
          error: null
        };

        // Direct API test
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        const directResponse = await fetch(`${apiBase}/places?type=food`);
        const directData = await directResponse.json();
        
        info.directApiTest = {
          url: `${apiBase}/places?type=food`,
          statusCode: directResponse.status,
          dataLength: directData.length,
          headers: Object.fromEntries(directResponse.headers.entries())
        };

        // Check if our restaurants are in direct API response
        info.directApiRestaurants = {};
        targetRestaurants.forEach(({ name, id }) => {
          const found = directData.find((item: any) => item.placeId === id);
          info.directApiRestaurants[name] = !!found;
        });

      } catch (error: any) {
        info.error = error.message;
      }

      setDebugInfo(info);
      setLoading(false);
    };

    runDebug();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug information...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Restaurant Debug Information</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Environment</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.environment, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">API Tests</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.apiTests, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Direct API Test</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.directApiTest, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Restaurant Status (via fetchCafes)</h2>
          <div className="space-y-2">
            {Object.entries(debugInfo.restaurantStatus).map(([name, status]: any) => (
              <div key={name} className="flex items-center gap-2">
                <span className={status.found ? 'text-green-600' : 'text-red-600'}>
                  {status.found ? '✅' : '❌'}
                </span>
                <span className="font-medium">{name}</span>
                {status.found && (
                  <span className="text-sm text-gray-600">
                    (ID: {status.data?.placeId})
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Direct API Restaurants</h2>
          <div className="space-y-2">
            {Object.entries(debugInfo.directApiRestaurants || {}).map(([name, found]: any) => (
              <div key={name} className="flex items-center gap-2">
                <span className={found ? 'text-green-600' : 'text-red-600'}>
                  {found ? '✅' : '❌'}
                </span>
                <span className="font-medium">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {debugInfo.error && (
          <section>
            <h2 className="text-xl font-semibold mb-3 text-red-600">Error</h2>
            <pre className="bg-red-50 p-4 rounded text-red-800">
              {debugInfo.error}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
};

export default DebugRestaurants;