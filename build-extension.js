const fs = require('fs');
const path = require('path');

// Files and directories to copy (these are not handled by webpack)
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'styles.css',
  'test-trade-desk.html',
  'README.md',
  'TESTING.md',
  'icons' // directory
];

// Copy files and directories
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(__dirname, 'dist', file);
  
  // Check if source exists
  if (!fs.existsSync(srcPath)) {
    console.log(`Warning: ${file} does not exist, skipping...`);
    return;
  }
  
  // If it's a directory, copy recursively
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    // Remove destination directory if it exists
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true });
    }
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
  
  console.log(`Copied ${file} to dist/`);
});

console.log('Build completed successfully!');