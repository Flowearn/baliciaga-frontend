import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current descriptions file
const descriptionsPath = path.join(__dirname, '../public/locales/en/descriptions.en.json');
const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

// Update Lusa By/Suka with the more detailed content
const lusaPlaceId = "ChIJcYpksxVH0i0RCDMFafUy5N4";

if (descriptions[lusaPlaceId]) {
  descriptions[lusaPlaceId].sections = [
    {
      title: "Concept & Ambience",
      body: "Lusa is a \"cafe & restaurant concept by Suka Espresso,\" a popular and well-regarded brand in Bali. Its concept is built on all-day versatility, serving \"Australian style breakfast\" and specialty coffee by day before transforming to serve \"housemade pasta and a range of steaks and roasts\" as the sun sets. The ambience is \"industrial-chic,\" creating a space that is \"both inspiring and welcoming\". It's a spacious, two-floor venue that has become a favorite for digital nomads, who appreciate the \"ample power outlets and fast Wi-Fi\" in a \"chic yet cozy\" environment."
    },
    {
      title: "Menu & Signature Experience",
      body: "The signature experience at Lusa is its seamless transition from a productive daytime cafe to a vibrant evening restaurant. The day menu features \"freshly brewed specialty coffee, cakes & pastries,\" while the evening brings \"housemade pasta\" like the popular Beef Ragu Pappardelle and mains such as a \"180g New Zealand grass fed beef tenderloin\". The vibe is further enhanced by \"live music four nights a week,\" making it the \"perfect way to spend a balmy evening in Bali\"."
    },
    {
      title: "Conclusion",
      body: "Lusa By/Suka is a smart and successful brand evolution, leveraging the reputation of Suka Espresso to create a dynamic, all-day destination. It perfectly caters to the modern Canggu lifestyle, offering a \"perfect blend of work and leisure\" where one can transition from a focused work session to a relaxed dinner with cocktails and live music, all within the same stylish space."
    }
  ];
  console.log(`Updated ${descriptions[lusaPlaceId].name} with more detailed content`);
} else {
  console.log(`Warning: Lusa By/Suka not found`);
}

// Write the updated descriptions back to file
fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
console.log('\nLusa By/Suka description updated successfully!');