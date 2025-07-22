const fs = require('fs');
const path = require('path');

// Directory to check
const imagesDir = path.join(__dirname, '../public/images');

// Check if the directory exists
if (!fs.existsSync(imagesDir)) {
  console.log(`Directory does not exist: ${imagesDir}`);
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created directory: ${imagesDir}`);
}

// List all subdirectories
const subdirs = fs.readdirSync(imagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('Image subdirectories:');
subdirs.forEach(subdir => {
  console.log(`- ${subdir}`);
  
  // List files in each subdirectory
  const subDirPath = path.join(imagesDir, subdir);
  const files = fs.readdirSync(subDirPath);
  
  console.log(`  Files (${files.length}):`);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
});

// Create placeholder SVG files if needed
const createPlaceholders = () => {
  const issueId = 'latest-issue';
  const outputDir = path.join(imagesDir, issueId);
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }
  
  // Create 5 placeholder SVG files
  for (let i = 1; i <= 5; i++) {
    const svgPath = path.join(outputDir, `page_${i}.svg`);
    
    // Only create if it doesn't exist
    if (!fs.existsSync(svgPath)) {
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
      const color = colors[(i - 1) % colors.length];
      
      const svgContent = `
        <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="800" fill="${color}" />
          <text x="300" y="400" font-family="Arial" font-size="48" text-anchor="middle" fill="white">Page ${i}</text>
          <text x="300" y="460" font-family="Arial" font-size="24" text-anchor="middle" fill="white">Placeholder Image</text>
        </svg>
      `;
      
      fs.writeFileSync(svgPath, svgContent);
      console.log(`Created placeholder SVG: ${svgPath}`);
    }
  }
};

// Create placeholders
createPlaceholders();

console.log('Image check complete!');
