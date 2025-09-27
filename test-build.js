const fs = require('fs');
const path = require('path');

console.log('Testing webpack build...');

// Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('ERROR: dist directory does not exist');
  process.exit(1);
}

// Check if required files exist
const requiredFiles = [
  'content.js',
  'popup.js',
  'manifest.json',
  'popup.html',
  'styles.css'
];

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Required file ${file} does not exist in dist/`);
    process.exit(1);
  }
  console.log(`✓ ${file} exists`);
}

// Check if icons directory exists and has files
const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  console.error('ERROR: icons directory does not exist in dist/');
  process.exit(1);
}

const iconFiles = fs.readdirSync(iconsDir);
if (iconFiles.length === 0) {
  console.error('ERROR: icons directory is empty');
  process.exit(1);
}

console.log(`✓ icons directory exists with ${iconFiles.length} files`);

console.log('\n✓ All tests passed! The webpack build is working correctly.');