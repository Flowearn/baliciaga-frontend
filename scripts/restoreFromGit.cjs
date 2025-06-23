const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get list of files that contain font size classes
const directories = [
  path.join(__dirname, '../src'),
];

const extensions = ['.tsx', '.ts', '.jsx', '.js'];
let filesRestored = 0;

function shouldProcessFile(filePath) {
  return extensions.some(ext => filePath.endsWith(ext));
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      // Check if file contains text size classes
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('text-xs') || content.includes('text-sm') || 
          content.includes('text-base') || content.includes('text-lg') || 
          content.includes('text-xl')) {
        
        try {
          // Get the file content from git history (before font changes)
          // This assumes the font changes were recent
          const relativePath = path.relative(process.cwd(), fullPath);
          
          // Try to restore from HEAD~2 (2 commits ago)
          const gitContent = execSync(`git show HEAD~2:"${relativePath}"`, { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'] // Ignore stderr
          }).toString();
          
          if (gitContent && gitContent !== content) {
            fs.writeFileSync(fullPath, gitContent, 'utf8');
            console.log(`✓ Restored ${relativePath}`);
            filesRestored++;
          }
        } catch (error) {
          // If file doesn't exist in git history, skip it
          if (!error.message.includes('does not exist')) {
            console.log(`⚠ Could not restore ${fullPath}: ${error.message}`);
          }
        }
      }
    }
  });
}

console.log('Restoring font sizes from Git history...');
console.log('-----------------------------------\n');

try {
  // Check if we're in a git repository
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  
  directories.forEach(dir => {
    console.log(`Processing directory: ${dir}`);
    processDirectory(dir);
  });

  console.log('\n-----------------------------------');
  console.log(`Restoration complete!`);
  console.log(`Total files restored: ${filesRestored}`);
} catch (error) {
  console.error('Error: Not in a Git repository or Git is not available');
  console.error('Please ensure you are in the project directory and Git is installed');
}