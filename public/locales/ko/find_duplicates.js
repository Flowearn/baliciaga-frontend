const fs = require('fs');
const data = JSON.parse(fs.readFileSync('descriptions.ko.json', 'utf-8'));

const targetVenues = [
  "Lusa By/Suka",
  "Neighbourhood Food", 
  "Hungry Bird Coffee Roaster",
  "Secret Spot Canggu",
  "HOME CAFE",
  "MIEL SPECIALTY COFFEE"
];

const results = {};

// Find all entries for target venues
Object.entries(data).forEach(([key, value]) => {
  targetVenues.forEach(venue => {
    if (value.name && value.name.includes(venue)) {
      if (\!results[venue]) results[venue] = [];
      results[venue].push({
        googlePlaceId: key,
        name: value.name,
        internalId: value.id,
        sectionsCount: value.sections ? value.sections.length : 0
      });
    }
  });
});

// Print results
Object.entries(results).forEach(([venue, entries]) => {
  console.log(`\n${venue}:`);
  entries.forEach(entry => {
    console.log(`  - Google ID: ${entry.googlePlaceId}`);
    console.log(`    Name: ${entry.name}`);
    console.log(`    Internal ID: ${entry.internalId}`);
    console.log(`    Sections: ${entry.sectionsCount}`);
  });
});

// Find duplicate internal IDs
console.log("\n\nDuplicate Internal IDs:");
const idMap = {};
Object.entries(data).forEach(([key, value]) => {
  if (\!idMap[value.id]) idMap[value.id] = [];
  idMap[value.id].push({ googleId: key, name: value.name });
});

Object.entries(results).forEach(([venue, entries]) => {
  entries.forEach(entry => {
    const duplicates = idMap[entry.internalId];
    if (duplicates.length > 1) {
      console.log(`\n${venue} (Internal ID: ${entry.internalId}):`);
      duplicates.forEach(dup => {
        console.log(`  - ${dup.googleId}: ${dup.name}`);
      });
    }
  });
});
