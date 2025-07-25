// Debug API helper to test if restaurants are returned

export async function debugRestaurantsAPI() {
  console.log('=== DEBUG: Testing Restaurants API ===');
  
  // Get current API base URL
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  console.log('API Base URL:', apiBase);
  console.log('Current environment:', import.meta.env.MODE);
  
  // Test restaurants we're looking for
  const targetRestaurants = {
    'Cinta Pererenan': 'ChIJA31WOU050i0ROZH_hS7ypXY',
    'HUT Bali': 'ChIJy1yJjCFH0i0REyjNQfSK0Vw',
    'Penny Lane': 'ChIJ7SHlDCg50i0RaM29YbEeVjg',
    'YUME 夢': 'ChIJcUP9ogJB0i0R6EkIXLpYpUA',
    'YUMEI NOODLES': 'ChIJzX54qGJH0i0RVq590YDmdVY'
  };
  
  try {
    // Test cafe endpoint
    console.log('\n--- Testing CAFE endpoint ---');
    const cafeResponse = await fetch(`${apiBase}/places?type=cafe`);
    const cafes = await cafeResponse.json();
    console.log(`Total cafes returned: ${cafes.length}`);
    
    // Check for our restaurants in cafe
    ['Cinta Pererenan', 'HUT Bali'].forEach(name => {
      const found = cafes.find((c: any) => c.placeId === targetRestaurants[name]);
      console.log(`${name}: ${found ? '✅ Found' : '❌ Not found'}`);
      if (found) {
        console.log(`  Data:`, found);
      }
    });
    
    // Test dining endpoint
    console.log('\n--- Testing DINING endpoint ---');
    const diningResponse = await fetch(`${apiBase}/places?type=dining`);
    const dining = await diningResponse.json();
    console.log(`Total dining returned: ${dining.length}`);
    
    // Check for our restaurants in dining
    ['Penny Lane', 'YUME 夢', 'YUMEI NOODLES'].forEach(name => {
      const found = dining.find((d: any) => d.placeId === targetRestaurants[name]);
      console.log(`${name}: ${found ? '✅ Found' : '❌ Not found'}`);
    });
    
    // Test food endpoint
    console.log('\n--- Testing FOOD endpoint ---');
    const foodResponse = await fetch(`${apiBase}/places?type=food`);
    const food = await foodResponse.json();
    console.log(`Total food returned: ${food.length}`);
    
    // Check all restaurants in food
    Object.entries(targetRestaurants).forEach(([name, placeId]) => {
      const found = food.find((f: any) => f.placeId === placeId);
      console.log(`${name}: ${found ? '✅ Found' : '❌ Not found'}`);
    });
    
    // Check React Query cache
    console.log('\n--- Checking React Query Cache ---');
    const queryClient = (window as any).__REACT_QUERY_CLIENT__;
    if (queryClient) {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      console.log('Cached queries:', queries.map((q: any) => q.queryKey));
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Add to window for easy access in console
(window as any).debugRestaurantsAPI = debugRestaurantsAPI;