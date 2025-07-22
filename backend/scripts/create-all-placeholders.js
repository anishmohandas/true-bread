const fs = require('fs-extra');
const path = require('path');

// Get all PDF files in the public/files directory
const filesDir = path.join(__dirname, '../public/files');
const imagesDir = path.join(__dirname, '../public/images');

// Create the images directory if it doesn't exist
fs.ensureDirSync(imagesDir);

// Function to create placeholder images for a specific issue
function createPlaceholdersForIssue(issueId, issueTitle) {
  const issueDir = path.join(imagesDir, issueId);
  
  // Create the issue directory if it doesn't exist
  fs.ensureDirSync(issueDir);
  
  console.log(`Creating placeholders for issue: ${issueId}`);
  
  // Create 5 placeholder SVG files
  for (let i = 1; i <= 5; i++) {
    const svgPath = path.join(issueDir, `page_${i}.svg`);
    
    // Only create if it doesn't exist
    if (!fs.existsSync(svgPath)) {
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
      const color = colors[(i - 1) % colors.length];
      
      const svgContent = `
        <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="800" fill="${color}" />
          <text x="300" y="400" font-family="Arial" font-size="48" text-anchor="middle" fill="white">Page ${i}</text>
          <text x="300" y="460" font-family="Arial" font-size="24" text-anchor="middle" fill="white">${issueTitle}</text>
        </svg>
      `;
      
      fs.writeFileSync(svgPath, svgContent);
      console.log(`Created placeholder SVG: ${svgPath}`);
    }
  }
}

// Main function to process all PDF files
async function processAllPdfFiles() {
  try {
    // Check if files directory exists
    if (!fs.existsSync(filesDir)) {
      console.error(`Files directory does not exist: ${filesDir}`);
      return;
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(filesDir);
    
    // Filter for PDF files
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('No PDF files found');
      return;
    }
    
    console.log(`Found ${pdfFiles.length} PDF files`);
    
    // Process each PDF file
    for (const file of pdfFiles) {
      // Extract issue ID from filename
      const filename = path.basename(file, '.pdf');
      const issueId = filename.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      
      // Create placeholders for this issue
      createPlaceholdersForIssue(issueId, filename);
    }
    
    // Also create placeholders for the default 'latest-issue'
    createPlaceholdersForIssue('latest-issue', 'Latest Issue');
    
    // Also create placeholders for 'april-2025'
    createPlaceholdersForIssue('april-2025', 'April 2025');
    
    console.log('All placeholders created successfully!');
  } catch (error) {
    console.error('Error processing PDF files:', error);
  }
}

// Run the main function
processAllPdfFiles();
