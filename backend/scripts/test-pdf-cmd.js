const fs = require('fs-extra');
const path = require('path');

// We need to compile the TypeScript file first
console.log('Building TypeScript...');
require('child_process').execSync('npx tsc src/utils/pdf-cmd-converter.ts --outDir dist/utils');

// Now we can import the compiled module
const { convertPdfToImages } = require('../dist/utils/pdf-cmd-converter');

// Source PDF file
const pdfFile = path.join(__dirname, '../public/files/True Bread _ Apr_2025.pdf');
// Output directory
const outputDir = path.join(__dirname, '../public/images/april-2025');

// Ensure the output directory exists
fs.ensureDirSync(outputDir);

// Test the conversion
async function testConversion() {
  try {
    console.log(`Converting PDF: ${pdfFile}`);
    console.log(`Output directory: ${outputDir}`);
    
    // Check if the PDF file exists
    if (!fs.existsSync(pdfFile)) {
      console.error(`PDF file does not exist: ${pdfFile}`);
      return;
    }
    
    // Convert the PDF to images
    await convertPdfToImages(pdfFile, 1, 5, outputDir);
    
    console.log('Conversion complete!');
    
    // List the generated files
    const files = fs.readdirSync(outputDir);
    console.log(`Generated ${files.length} files:`);
    files.forEach(file => {
      console.log(`- ${file}`);
    });
  } catch (error) {
    console.error('Error testing PDF conversion:', error);
  }
}

// Run the test
testConversion();
