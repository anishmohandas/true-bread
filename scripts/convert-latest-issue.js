const { convertPdfToImages } = require('./pdf-to-images');
const path = require('path');
const fs = require('fs-extra');

// Configuration
const pdfPath = process.argv[2] || path.join(__dirname, '../src/assets/pdfs/latest-issue.pdf');
const startPage = parseInt(process.argv[3]) || 1;
const endPage = parseInt(process.argv[4]) || 5;
const outputDir = path.join(__dirname, '../src/assets/images/pdf-pages');
const dpi = 300;

// Ensure the PDF directory exists
const pdfDir = path.dirname(pdfPath);
fs.ensureDirSync(pdfDir);

// Check if the PDF exists, if not create a placeholder
if (!fs.existsSync(pdfPath)) {
  console.log(`PDF file not found at ${pdfPath}`);
  console.log('Creating placeholder PDF directory and placeholder images...');

  // Create placeholder images
  fs.ensureDirSync(outputDir);

  // Create placeholder images (colored rectangles)
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];

  // Create simple SVG placeholders
  for (let i = startPage; i <= endPage; i++) {
    const color = colors[(i - 1) % colors.length];
    const svgContent = `
      <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="800" fill="${color}" />
        <text x="300" y="400" font-family="Arial" font-size="48" text-anchor="middle" fill="white">Page ${i}</text>
        <text x="300" y="460" font-family="Arial" font-size="24" text-anchor="middle" fill="white">Placeholder Image</text>
      </svg>
    `;

    // Save as SVG
    fs.writeFileSync(path.join(outputDir, `page_${i}.svg`), svgContent);
    console.log(`Created placeholder SVG image for page ${i}`);
  }

  console.log('Placeholder images created successfully!');
  console.log('To convert a real PDF, place it at:', pdfPath);
  process.exit(0);
}

// Run the conversion
console.log(`Converting PDF: ${pdfPath}`);
console.log(`Pages: ${startPage} to ${endPage}`);
console.log(`Output directory: ${outputDir}`);
console.log(`DPI: ${dpi}`);

convertPdfToImages(pdfPath, startPage, endPage, outputDir, dpi)
  .then(outputPath => {
    console.log(`Images saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Conversion failed:', err);
    process.exit(1);
  });
