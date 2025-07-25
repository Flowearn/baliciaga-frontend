// Debug helper specifically for the 5 restaurants issue

export async function debugRestaurants() {
  console.log('=== DEBUGGING 5 RESTAURANTS ISSUE ===');
  
  const targetRestaurants = [
    { name: 'Cinta Pererenan', id: 'ChIJA31WOU050i0ROZH_hS7ypXY', type: 'cafe' },
    { name: 'HUT Bali', id: 'ChIJy1yJjCFH0i0REyjNQfSK0Vw', type: 'cafe' },
    { name: 'Penny Lane', id: 'ChIJ7SHlDCg50i0RaM29YbEeVjg', type: 'dining' },
    { name: 'YUME 夢 l Japanese Dining', id: 'ChIJcUP9ogJB0i0R6EkIXLpYpUA', type: 'dining' },
    { name: 'YUMEI NOODLES BALI', id: 'ChIJzX54qGJH0i0RVq590YDmdVY', type: 'dining' }
  ];
  
  // Check React Query cache
  const queryClient = (window as any).__REACT_QUERY_CLIENT__;
  if (queryClient) {
    console.log('\n--- REACT QUERY CACHE ---');
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Find cafe and dining queries
    const cafeQuery = queries.find((q: any) => 
      Array.isArray(q.queryKey) && q.queryKey[0] === 'cafes' && q.queryKey[1] === 'cafe'
    );
    const diningQuery = queries.find((q: any) => 
      Array.isArray(q.queryKey) && q.queryKey[0] === 'cafes' && q.queryKey[1] === 'dining'
    );
    const foodQuery = queries.find((q: any) => 
      Array.isArray(q.queryKey) && q.queryKey[0] === 'cafes' && q.queryKey[1] === 'food'
    );
    
    if (cafeQuery && cafeQuery.state.data) {
      const cafes = cafeQuery.state.data;
      console.log(`Cached CAFE data: ${cafes.length} items`);
      targetRestaurants.filter(r => r.type === 'cafe').forEach(({ name, id }) => {
        const found = cafes.find((c: any) => c.placeId === id);
        console.log(`  ${name}: ${found ? '✅ In cache' : '❌ Not in cache'}`);
      });
    }
    
    if (diningQuery && diningQuery.state.data) {
      const dining = diningQuery.state.data;
      console.log(`\nCached DINING data: ${dining.length} items`);
      targetRestaurants.filter(r => r.type === 'dining').forEach(({ name, id }) => {
        const found = dining.find((d: any) => d.placeId === id);
        console.log(`  ${name}: ${found ? '✅ In cache' : '❌ Not in cache'}`);
      });
    }
    
    if (foodQuery && foodQuery.state.data) {
      const food = foodQuery.state.data;
      console.log(`\nCached FOOD data: ${food.length} items`);
      targetRestaurants.forEach(({ name, id }) => {
        const found = food.find((f: any) => f.placeId === id);
        console.log(`  ${name}: ${found ? '✅ In cache' : '❌ Not in cache'}`);
      });
    }
  }
  
  // Check what's currently rendered
  console.log('\n--- CURRENTLY RENDERED ON PAGE ---');
  const cafeCards = document.querySelectorAll('[data-testid="cafe-card"]');
  console.log(`Total cards rendered: ${cafeCards.length}`);
  
  // Check if any of our target restaurants are rendered
  targetRestaurants.forEach(({ name, id }) => {
    const found = Array.from(cafeCards).some(card => {
      const text = card.textContent || '';
      return text.includes(name);
    });
    console.log(`${name}: ${found ? '✅ Visible on page' : '❌ Not visible'}`);
  });
  
  // Check environment
  console.log('\n--- ENVIRONMENT ---');
  console.log('Current URL:', window.location.href);
  console.log('API Base:', import.meta.env.VITE_API_BASE_URL);
  console.log('Environment Mode:', import.meta.env.MODE);
  console.log('Is Production:', import.meta.env.PROD);
  console.log('Is Development:', import.meta.env.DEV);
  
  // Clear cache suggestion
  console.log('\n--- TO CLEAR CACHE AND RELOAD ---');
  console.log('Run: __REACT_QUERY_CLIENT__.clear(); location.reload();');
}

// Add to window for console access
(window as any).debugRestaurants = debugRestaurants;