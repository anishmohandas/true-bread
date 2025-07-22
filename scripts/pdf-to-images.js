const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const sharp = require('sharp');
const path = require('path');

/**
 * Convert PDF pages to images
 * @param {string} pdfPath - Path to the PDF file
 * @param {number} startPage - First page to convert (1-based index)
 * @param {number} endPage - Last page to convert (1-based index)
 * @param {string} outputDir - Directory to save images
 * @param {number} dpi - DPI for the output images (higher = better quality but larger files)
 */
async function convertPdfToImages(pdfPath, startPage = 1, endPage = 5, outputDir = 'src/assets/images/pdf-pages', dpi = 300) {
  try {
    // Create output directory if it doesn't exist
    await fs.ensureDir(outputDir);
    
    // Read the PDF file
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get total pages
    const totalPages = pdfDoc.getPageCount();
    console.log(`PDF has ${totalPages} pages`);
    
    // Validate page range
    startPage = Math.max(1, startPage);
    endPage = Math.min(totalPages, endPage);
    
    if (startPage > endPage) {
      throw new Error('Start page cannot be greater than end page');
    }
    
    console.log(`Converting pages ${startPage} to ${endPage}`);
    
    // Extract each page as a separate PDF and convert to image
    for (let i = startPage; i <= endPage; i++) {
      // Create a new document with just this page
      const singlePageDoc = await PDFDocument.create();
      const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i - 1]);
      singlePageDoc.addPage(copiedPage);
      
      // Save the single page PDF temporarily
      const tempPdfPath = path.join(outputDir, `temp_page_${i}.pdf`);
      const singlePageBytes = await singlePageDoc.save();
      await fs.writeFile(tempPdfPath, singlePageBytes);
      
      // Use sharp to convert PDF to image
      // Note: Sharp doesn't directly support PDF, so we'll use a workaround with pdftoppm or ghostscript
      // For this example, we'll use a simpler approach with sharp's built-in PDF support (limited)
      
      try {
        // Get page dimensions
        const page = pdfDoc.getPage(i - 1);
        const { width, height } = page.getSize();
        
        // Calculate pixel dimensions based on DPI
        const pxWidth = Math.round(width * dpi / 72);
        const pxHeight = Math.round(height * dpi / 72);
        
        // Convert PDF to PNG using sharp
        await sharp(tempPdfPath, { density: dpi })
          .resize(pxWidth, pxHeight)
          .toFile(path.join(outputDir, `page_${i}.png`));
        
        console.log(`Converted page ${i} to image`);
        
        // Remove temporary PDF
        await fs.remove(tempPdfPath);
      } catch (err) {
        console.error(`Error converting page ${i}:`, err);
      }
    }
    
    console.log('Conversion complete!');
    return path.join(outputDir);
  } catch (err) {
    console.error('Error converting PDF to images:', err);
    throw err;
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2);
  const pdfPath = args[0] || 'src/assets/pdfs/latest-issue.pdf';
  const startPage = parseInt(args[1]) || 1;
  const endPage = parseInt(args[2]) || 5;
  const outputDir = args[3] || 'src/assets/images/pdf-pages';
  const dpi = parseInt(args[4]) || 300;
  
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
}

module.exports = { convertPdfToImages };
