import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Restaurant descriptions data (simplified without nested quotes)
const restaurantData = {
  "ChIJA31WOU050i0ROZH_hS7ypXY": "Cinta Pererenan",
  "ChIJy1yJjCFH0i0REyjNQfSK0Vw": "HUT Bali", 
  "ChIJ7SHlDCg50i0RaM29YbEeVjg": "Penny Lane",
  "ChIJcUP9ogJB0i0R6EkIXLpYpUA": "YUME 夢 l Japanese Dining",
  "ChIJzX54qGJH0i0RVq590YDmdVY": "YUMEI NOODLES BALI"
};

// Check which restaurants are already in description files
const languages = ['zh', 'en', 'ru', 'ko'];

console.log('Checking for missing restaurant descriptions...\n');

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'public', 'locales', lang, `descriptions.${lang}.json`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`=== ${lang.toUpperCase()} descriptions ===`);
    Object.entries(restaurantData).forEach(([placeId, name]) => {
      if (data[placeId]) {
        console.log(`✅ ${name} - Already exists`);
      } else {
        console.log(`❌ ${name} - MISSING`);
      }
    });
    console.log('');
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
});

console.log('\nSummary: The 5 restaurant descriptions need to be added to all language files.');
console.log('The descriptions you provided earlier contain:');
console.log('- Concept & Ambiance section');
console.log('- Menu & Signature Experience section');
console.log('- Conclusion section');
console.log('\nWould you like me to create a proper script to add them?');