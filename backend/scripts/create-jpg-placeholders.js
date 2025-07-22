const fs = require('fs-extra');
const path = require('path');
const { createCanvas } = require('canvas');

// Directory to create placeholders in
const imagesDir = path.join(__dirname, '../public/images/april-2025');

// Create the directory if it doesn't exist
fs.ensureDirSync(imagesDir);

// Create 5 placeholder JPG files
async function createPlaceholders() {
  console.log(`Creating JPG placeholder images in: ${imagesDir}`);
  
  for (let i = 1; i <= 5; i++) {
    const jpgPath = path.join(imagesDir, `page_${i}.jpg`);
    
    // Only create if it doesn't exist
    if (!fs.existsSync(jpgPath)) {
      console.log(`Creating placeholder for page ${i}...`);
      
      // Create a canvas with the right dimensions
      const canvas = createCanvas(600, 800);
      const ctx = canvas.getContext('2d');
      
      // Choose a color for this page
      const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
      const color = colors[(i - 1) % colors.length];
      
      // Fill with the color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 600, 800);
      
      // Add a subtle rectangle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(50, 50, 500, 700);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TRUE BREAD', 300, 200);
      
      ctx.font = '48px Arial';
      ctx.fillText(`Page ${i}`, 300, 300);
      
      ctx.font = '24px Arial';
      ctx.fillText('April 2025 Edition', 300, 400);
      
      // Add a divider line
      ctx.fillRect(150, 450, 300, 5);
      
      ctx.font = '20px Arial';
      ctx.fillText('Replace with actual PDF page', 300, 500);
      
      // Save as JPG
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      fs.writeFileSync(jpgPath, buffer);
      
      console.log(`Created placeholder JPG: ${jpgPath}`);
    } else {
      console.log(`Placeholder already exists: ${jpgPath}`);
    }
  }
  
  console.log('All JPG placeholders created successfully!');
}

// Run the function
createPlaceholders();
