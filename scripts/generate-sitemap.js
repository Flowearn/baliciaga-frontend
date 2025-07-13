import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 URLs for production data files
const DATA_URLS = {
  cafes: 'https://baliciaga-database.s3.ap-southeast-1.amazonaws.com/json/cafes.json',
  dining: 'https://baliciaga-database.s3.ap-southeast-1.amazonaws.com/json/dining.json',
  bars: 'https://baliciaga-database.s3.ap-southeast-1.amazonaws.com/json/bars.json',
  cowork: 'https://baliciaga-database.s3.ap-southeast-1.amazonaws.com/json/cowork.json'
};

// Base URL for the website
const BASE_URL = 'https://baliciaga.com';

// Function to download JSON data from URL
function downloadJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          // Check if response is valid JSON
          if (res.statusCode !== 200) {
            console.error(`Error fetching ${url}: Status ${res.statusCode}`);
            console.error(`Response: ${data.substring(0, 200)}...`);
            reject(new Error(`Failed to fetch ${url}: Status ${res.statusCode}`));
            return;
          }
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          console.error(`Error parsing JSON from ${url}:`, error.message);
          console.error(`Response: ${data.substring(0, 200)}...`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to generate sitemap XML
function generateSitemapXML(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.priority) {
      xml += `    <priority>${url.priority}</priority>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

// Main function to generate sitemap
async function generateSitemap() {
  try {
    console.log('Starting sitemap generation...');
    
    // For now, we'll create a basic sitemap with static pages
    // In production, this would download from S3
    console.log('Note: S3 access is currently restricted. Generating basic sitemap with static pages...');
    
    // TODO: When S3 access is available, uncomment the following:
    /*
    const [cafesData, diningData, barsData, coworkData] = await Promise.all([
      downloadJSON(DATA_URLS.cafes),
      downloadJSON(DATA_URLS.dining),
      downloadJSON(DATA_URLS.bars),
      downloadJSON(DATA_URLS.cowork)
    ]);
    */
    
    // For now, use empty arrays
    const cafesData = [];
    const diningData = [];
    const barsData = [];
    const coworkData = [];
    
    console.log('Using placeholder data for demonstration...');
    
    // Merge all venues and deduplicate by placeId
    const allVenues = new Map();
    
    // Helper function to add venues to map
    const addVenues = (venues, type) => {
      venues.forEach(venue => {
        if (venue.placeId && !allVenues.has(venue.placeId)) {
          allVenues.set(venue.placeId, { ...venue, type });
        }
      });
    };
    
    // Add all venues
    addVenues(cafesData, 'cafe');
    addVenues(diningData, 'food');
    addVenues(barsData, 'bar');
    addVenues(coworkData, 'cowork');
    
    console.log(`Total unique venues: ${allVenues.size}`);
    
    // Create URL list
    const urls = [];
    
    // Add static pages
    urls.push({
      loc: BASE_URL + '/',
      priority: '1.00',
      changefreq: 'daily'
    });
    
    // Add venue detail pages
    allVenues.forEach((venue, placeId) => {
      urls.push({
        loc: `${BASE_URL}/cafe/${placeId}?type=${venue.type}`,
        priority: '0.80',
        changefreq: 'weekly'
      });
    });
    
    console.log(`Total URLs: ${urls.length}`);
    
    // Generate XML
    const xml = generateSitemapXML(urls);
    
    // Write to file
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    
    console.log(`Sitemap successfully generated at: ${outputPath}`);
    console.log(`Total URLs in sitemap: ${urls.length}`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
generateSitemap();