const fs = require('fs');
const path = require('path');

// Directory to create placeholders in
const imagesDir = path.join(__dirname, '../public/images/april-2025');

// Create the directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created directory: ${imagesDir}`);
}

// Create 5 placeholder SVG files
for (let i = 1; i <= 5; i++) {
  const svgPath = path.join(imagesDir, `page_${i}.svg`);
  
  // Only create if it doesn't exist
  if (!fs.existsSync(svgPath)) {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
    const color = colors[(i - 1) % colors.length];
    
    const svgContent = `
      <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="800" fill="${color}" />
        <text x="300" y="400" font-family="Arial" font-size="48" text-anchor="middle" fill="white">Page ${i}</text>
        <text x="300" y="460" font-family="Arial" font-size="24" text-anchor="middle" fill="white">April 2025</text>
      </svg>
    `;
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`Created placeholder SVG: ${svgPath}`);
  }
}

console.log('Placeholders created successfully!');
