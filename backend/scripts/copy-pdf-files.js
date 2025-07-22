const fs = require('fs-extra');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, '../../src/assets/files');
const destDir = path.join(__dirname, '../public/files');

// Create the destination directory if it doesn't exist
fs.ensureDirSync(destDir);

// Copy all PDF files from source to destination
async function copyPdfFiles() {
  try {
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory does not exist: ${sourceDir}`);
      return;
    }
    
    console.log(`Copying PDF files from ${sourceDir} to ${destDir}`);
    
    // Get all files in the source directory
    const files = fs.readdirSync(sourceDir);
    
    // Filter for PDF files
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('No PDF files found in source directory');
      return;
    }
    
    console.log(`Found ${pdfFiles.length} PDF files to copy`);
    
    // Copy each PDF file
    for (const file of pdfFiles) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      
      // Copy the file
      await fs.copy(sourcePath, destPath);
      console.log(`Copied: ${file}`);
    }
    
    console.log('All PDF files copied successfully!');
  } catch (error) {
    console.error('Error copying PDF files:', error);
  }
}

// Run the copy function
copyPdfFiles();
