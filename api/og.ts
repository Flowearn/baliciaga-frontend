import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_API_URL = process.env.VITE_API_BASE_URL || 'https://api.baliciaga.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the original path from query parameters
  const { path } = req.query;
  
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  // Check if this is a place detail page
  const placeMatch = path.match(/^\/places\/([^/?]+)(\?type=(\w+))?/);
  
  if (!placeMatch) {
    // Not a place detail page, return default OG tags
    return res.status(200).send(getDefaultHTML(path));
  }

  const placeId = placeMatch[1];
  const type = placeMatch[3] || 'cafe';

  try {
    // Fetch place details from backend API
    const response = await fetch(`${BACKEND_API_URL}/places/${placeId}?type=${type}`);
    
    if (!response.ok) {
      console.error('Failed to fetch place details:', response.status);
      return res.status(200).send(getDefaultHTML(path));
    }

    const place = await response.json();
    
    // Generate dynamic OG tags
    const html = generatePlaceHTML(place, type, path);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('Error fetching place details:', error);
    return res.status(200).send(getDefaultHTML(path));
  }
}

function generatePlaceHTML(place: any, type: string, path: string): string {
  const name = place.name || 'Unknown Place';
  const description = place.editorial_summary?.overview || 
                     place.formatted_address || 
                     place.vicinity || 
                     `Discover ${name} in Bali`;
  const rating = place.rating ? `Rated ${place.rating} stars` : '';
  const imageUrl = place.photos?.[0] || 'https://baliciaga.com/open-graph.png';
  const canonicalUrl = `https://baliciaga.com${path}`;
  
  const metaTitle = `${name} - ${type.charAt(0).toUpperCase() + type.slice(1)} in Bali | Baliciaga`;
  const metaDescription = `${description}. ${rating}`.trim();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />

    <!-- Open Graph Tags -->
    <meta property="og:title" content="${escapeHtml(metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:site_name" content="Baliciaga" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metaTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    
    <!-- Redirect to actual page for regular browsers -->
    <script>
      if (!navigator.userAgent.match(/bot|crawl|slurp|spider|mediapartners/i)) {
        window.location.href = '${escapeHtml(path)}';
      }
    </script>
  </head>
  <body>
    <h1>${escapeHtml(name)}</h1>
    <p>${escapeHtml(description)}</p>
    <p>Loading...</p>
  </body>
</html>`;
}

function getDefaultHTML(path: string): string {
  const canonicalUrl = `https://baliciaga.com${path}`;
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <title>Baliciaga</title>
    <meta name="description" content="Find the best food, bars, rentals and co-working space in Bali" />

    <!-- Open Graph Tags -->
    <meta property="og:title" content="Baliciaga" />
    <meta property="og:description" content="Find the best food, bars, rentals and co-working space in Bali" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://baliciaga.com/open-graph.png" />
    <meta property="og:image:secure_url" content="https://baliciaga.com/open-graph.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:site_name" content="Baliciaga" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Baliciaga" />
    <meta name="twitter:description" content="Find the best food, bars, rentals and co-working space in Bali" />
    <meta name="twitter:image" content="https://baliciaga.com/open-graph.png" />
    
    <!-- Redirect to actual page for regular browsers -->
    <script>
      if (!navigator.userAgent.match(/bot|crawl|slurp|spider|mediapartners/i)) {
        window.location.href = '${escapeHtml(path)}';
      }
    </script>
  </head>
  <body>
    <h1>Baliciaga</h1>
    <p>Find the best food, bars, rentals and co-working space in Bali</p>
    <p>Loading...</p>
  </body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}