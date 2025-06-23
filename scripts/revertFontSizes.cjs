const fs = require('fs');
const path = require('path');

// Font size mappings to revert
const revertMap = {
  'text-xl': 'text-lg',      // 20px → 18px
  'text-lg': 'text-base',     // 18px → 16px
  'text-base': 'text-sm',     // 16px → 14px
  'text-sm': 'text-xs',       // 14px → 12px
};

// Directories to process
const directories = [
  path.join(__dirname, '../src'),
];

// File extensions to process
const extensions = ['.tsx', '.ts', '.jsx', '.js'];

// Counter for changes
let totalChanges = 0;
let filesChanged = 0;

// Function to check if a file should be processed
function shouldProcessFile(filePath) {
  return extensions.some(ext => filePath.endsWith(ext));
}

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileChanges = 0;

  // Process each font size class
  Object.entries(revertMap).forEach(([oldClass, newClass]) => {
    // Match text-xl, text-lg, etc. with word boundaries
    // This regex ensures we match the whole class name, not partial matches
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    const matches = content.match(regex) || [];
    const count = matches.length;
    
    if (count > 0) {
      content = content.replace(regex, newClass);
      fileChanges += count;
      console.log(`  ${oldClass} → ${newClass}: ${count} occurrences`);
    }
  });

  // Write back if changes were made
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${filePath} (${fileChanges} changes)`);
    totalChanges += fileChanges;
    filesChanged++;
  }
}

// Function to recursively process directories
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  });
}

// Main execution
console.log('Starting font size reversion...');
console.log('Reverting to smaller font sizes:');
console.log('  text-xl (20px) → text-lg (18px)');
console.log('  text-lg (18px) → text-base (16px)');
console.log('  text-base (16px) → text-sm (14px)');
console.log('  text-sm (14px) → text-xs (12px)');
console.log('-----------------------------------\n');

directories.forEach(dir => {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
});

console.log('\n-----------------------------------');
console.log(`Font size reversion complete!`);
console.log(`Total files changed: ${filesChanged}`);
console.log(`Total replacements: ${totalChanges}`);