const fs = require('fs');
const path = require('path');

// We need to restore fonts based on what they were BEFORE yesterday's changes
// Yesterday we changed: 12→14, 14→16, 16→18, 18→20
// So now we need to identify which were originally 12, 14, 16, 18
// Since everything is now text-xs (12px), we need context to determine original sizes

// Common patterns to help identify original font sizes
const contextPatterns = {
  'text-xs': [
    // Things that should typically be 12px (text-xs)
    /text-xs.*(?:meta|caption|hint|help|small|tiny|footnote|copyright|badge|tag|label.*secondary|timestamp|date.*small)/i,
    /(?:meta|caption|hint|help|small|tiny|footnote|copyright|badge|tag|label.*secondary|timestamp|date.*small).*text-xs/i,
  ],
  'text-sm': [
    // Things that should typically be 14px (text-sm)
    /text-xs.*(?:button|btn|input|field|form|description|subtitle|secondary|body.*small|paragraph.*small|nav|menu)/i,
    /(?:button|btn|input|field|form|description|subtitle|secondary|body.*small|paragraph.*small|nav|menu).*text-xs/i,
  ],
  'text-base': [
    // Things that should typically be 16px (text-base)
    /text-xs.*(?:body|paragraph|content|main.*text|article|section.*text|card.*content|modal.*content)/i,
    /(?:body|paragraph|content|main.*text|article|section.*text|card.*content|modal.*content).*text-xs/i,
  ],
  'text-lg': [
    // Things that should typically be 18px (text-lg)
    /text-xs.*(?:title|heading|header|h[1-6]|lead|intro)/i,
    /(?:title|heading|header|h[1-6]|lead|intro).*text-xs/i,
  ],
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

// Function to determine what size a text-xs should be based on context
function determineOriginalSize(line, position) {
  const contextWindow = 100; // Characters to look at before and after
  const start = Math.max(0, position - contextWindow);
  const end = Math.min(line.length, position + contextWindow + 7); // 7 is length of "text-xs"
  const context = line.substring(start, end).toLowerCase();

  // Check patterns in order of specificity
  for (const [size, patterns] of Object.entries(contextPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(context)) {
        return size;
      }
    }
  }

  // Default fallback based on common component patterns
  if (context.includes('heading') || context.includes('title')) return 'text-lg';
  if (context.includes('button') || context.includes('input')) return 'text-sm';
  if (context.includes('body') || context.includes('content')) return 'text-base';
  
  return 'text-xs'; // Keep as is if no pattern matches
}

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileChanges = 0;

  // Split into lines for better context analysis
  const lines = content.split('\n');
  const newLines = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum];
    let newLine = line;
    
    // Find all text-xs occurrences in this line
    const regex = /\btext-xs\b/g;
    let match;
    const replacements = [];
    
    while ((match = regex.exec(line)) !== null) {
      const position = match.index;
      const originalSize = determineOriginalSize(line, position);
      
      if (originalSize !== 'text-xs') {
        replacements.push({
          start: position,
          end: position + 7,
          replacement: originalSize
        });
      }
    }
    
    // Apply replacements in reverse order to maintain positions
    for (let i = replacements.length - 1; i >= 0; i--) {
      const rep = replacements[i];
      newLine = newLine.substring(0, rep.start) + rep.replacement + newLine.substring(rep.end);
      fileChanges++;
    }
    
    newLines.push(newLine);
  }

  const newContent = newLines.join('\n');

  // Write back if changes were made
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
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
console.log('Starting font size restoration based on context...');
console.log('This will analyze the context of each text-xs and restore appropriate sizes');
console.log('-----------------------------------\n');

directories.forEach(dir => {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
});

console.log('\n-----------------------------------');
console.log(`Font size restoration complete!`);
console.log(`Total files changed: ${filesChanged}`);
console.log(`Total replacements: ${totalChanges}`);