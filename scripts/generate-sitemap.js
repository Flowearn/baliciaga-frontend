import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 configuration
const BUCKET_NAME = 'baliciaga-database';
const s3Client = new S3Client({ region: "ap-southeast-1" });

// S3 object keys for production data files
const DATA_KEYS = {
  cafes: 'data/cafes.json',
  dining: 'data/dining.json',
  bars: 'data/bars.json',
  cowork: 'data/cowork.json'
};

// Base URL for the website
const BASE_URL = 'https://baliciaga.com';

// Helper function to convert stream to string
async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

// Function to fetch data from S3
async function fetchFromS3(bucket, key) {
  try {
    console.log(`Fetching ${key} from S3...`);
    const command = new GetObjectCommand({ 
      Bucket: bucket, 
      Key: key 
    });
    
    const response = await s3Client.send(command);
    const bodyContents = await streamToString(response.Body);
    return JSON.parse(bodyContents);
  } catch (error) {
    console.error(`Error fetching ${key} from S3:`, error.message);
    throw error;
  }
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
    
    // Fetch all data files from S3
    console.log('Fetching data files from S3...');
    const [cafesData, diningData, barsData, coworkData] = await Promise.all([
      fetchFromS3(BUCKET_NAME, DATA_KEYS.cafes),
      fetchFromS3(BUCKET_NAME, DATA_KEYS.dining),
      fetchFromS3(BUCKET_NAME, DATA_KEYS.bars),
      fetchFromS3(BUCKET_NAME, DATA_KEYS.cowork)
    ]);
    
    console.log(`Downloaded: ${cafesData.length} cafes, ${diningData.length} dining, ${barsData.length} bars, ${coworkData.length} cowork spaces`);
    
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