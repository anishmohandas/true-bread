import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Convert PDF pages to images using command-line tools
 * @param pdfPath - Path to the PDF file
 * @param startPage - First page to convert (1-based index)
 * @param endPage - Last page to convert (1-based index)
 * @param outputDir - Directory to save images
 * @param dpi - DPI for the output images (higher = better quality but larger files)
 */
export async function convertPdfToImages(
  pdfPath: string, 
  startPage: number = 1, 
  endPage: number = 5, 
  outputDir: string = 'public/images/pdf-pages', 
  dpi: number = 300
): Promise<string> {
  try {
    // Create output directory if it doesn't exist
    await fs.ensureDir(outputDir);
    
    console.log(`Converting PDF: ${pdfPath}`);
    console.log(`Output directory: ${outputDir}`);
    
    // Try different conversion methods
    const methods = [
      convertWithPdftoppm,
      convertWithGhostscript,
      convertWithImageMagick,
      createPlaceholders
    ];
    
    // Try each method until one succeeds
    for (const method of methods) {
      try {
        await method(pdfPath, startPage, endPage, outputDir, dpi);
        console.log(`Conversion successful using ${method.name}`);
        return outputDir;
      } catch (err) {
        console.error(`Error using ${method.name}:`, err);
      }
    }
    
    throw new Error('All conversion methods failed');
  } catch (err) {
    console.error('Error converting PDF to images:', err);
    
    // Create placeholder images as a last resort
    await createPlaceholders(pdfPath, startPage, endPage, outputDir, dpi);
    
    return outputDir;
  }
}

/**
 * Convert PDF to images using pdftoppm (from Poppler)
 */
async function convertWithPdftoppm(
  pdfPath: string, 
  startPage: number, 
  endPage: number, 
  outputDir: string, 
  dpi: number
): Promise<void> {
  console.log('Attempting conversion with pdftoppm...');
  
  for (let i = startPage; i <= endPage; i++) {
    const outputPrefix = path.join(outputDir, `page_${i}`);
    const cmd = `pdftoppm -png -f ${i} -l ${i} -r ${dpi} "${pdfPath}" "${outputPrefix}"`;
    
    try {
      await execPromise(cmd);
      
      // pdftoppm adds -1 suffix to the output file, so we need to rename it
      const files = await fs.readdir(outputDir);
      const generatedFile = files.find(file => file.startsWith(`page_${i}-`));
      
      if (generatedFile) {
        await fs.rename(
          path.join(outputDir, generatedFile),
          path.join(outputDir, `page_${i}.png`)
        );
      }
      
      console.log(`Converted page ${i} with pdftoppm`);
    } catch (err) {
      console.error(`pdftoppm failed for page ${i}:`, err);
      throw err; // Rethrow to try the next method
    }
  }
}

/**
 * Convert PDF to images using Ghostscript
 */
async function convertWithGhostscript(
  pdfPath: string, 
  startPage: number, 
  endPage: number, 
  outputDir: string, 
  dpi: number
): Promise<void> {
  console.log('Attempting conversion with Ghostscript...');
  
  for (let i = startPage; i <= endPage; i++) {
    const outputFile = path.join(outputDir, `page_${i}.png`);
    const cmd = `gswin64c -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r${dpi} -dFirstPage=${i} -dLastPage=${i} -sOutputFile="${outputFile}" "${pdfPath}"`;
    
    try {
      await execPromise(cmd);
      console.log(`Converted page ${i} with Ghostscript`);
    } catch (err) {
      console.error(`Ghostscript failed for page ${i}:`, err);
      throw err; // Rethrow to try the next method
    }
  }
}

/**
 * Convert PDF to images using ImageMagick
 */
async function convertWithImageMagick(
  pdfPath: string, 
  startPage: number, 
  endPage: number, 
  outputDir: string, 
  dpi: number
): Promise<void> {
  console.log('Attempting conversion with ImageMagick...');
  
  for (let i = startPage; i <= endPage; i++) {
    const outputFile = path.join(outputDir, `page_${i}.png`);
    const cmd = `magick -density ${dpi} "${pdfPath}"[${i-1}] -quality 100 "${outputFile}"`;
    
    try {
      await execPromise(cmd);
      console.log(`Converted page ${i} with ImageMagick`);
    } catch (err) {
      console.error(`ImageMagick failed for page ${i}:`, err);
      throw err; // Rethrow to try the next method
    }
  }
}

/**
 * Create placeholder images when all conversion methods fail
 */
async function createPlaceholders(
  pdfPath: string, 
  startPage: number, 
  endPage: number, 
  outputDir: string, 
  dpi: number
): Promise<void> {
  console.log('Creating placeholder images...');
  
  for (let i = startPage; i <= endPage; i++) {
    await createPlaceholderImage(i, outputDir);
  }
}

/**
 * Create a placeholder image
 */
async function createPlaceholderImage(pageNumber: number, outputDir: string): Promise<void> {
  try {
    console.log(`Creating placeholder for page ${pageNumber}...`);
    
    // Create a visually appealing SVG placeholder
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
    const color = colors[(pageNumber - 1) % colors.length];
    
    const svgContent = `
      <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="800" fill="${color}" />
        <rect x="50" y="50" width="500" height="700" fill="white" opacity="0.1" />
        <text x="300" y="200" font-family="Arial" font-size="60" text-anchor="middle" fill="white" font-weight="bold">TRUE BREAD</text>
        <text x="300" y="300" font-family="Arial" font-size="48" text-anchor="middle" fill="white">Page ${pageNumber}</text>
        <text x="300" y="400" font-family="Arial" font-size="24" text-anchor="middle" fill="white">April 2025 Edition</text>
        <rect x="150" y="450" width="300" height="5" fill="white" />
        <text x="300" y="500" font-family="Arial" font-size="20" text-anchor="middle" fill="white">Preview Image</text>
      </svg>
    `;
    
    // Save the SVG file
    const svgPath = path.join(outputDir, `page_${pageNumber}.svg`);
    await fs.writeFile(svgPath, svgContent);
    
    // Try to convert SVG to PNG using various methods
    try {
      const pngPath = path.join(outputDir, `page_${pageNumber}.png`);
      
      // Try with ImageMagick
      try {
        await execPromise(`magick "${svgPath}" "${pngPath}"`);
        console.log(`Created PNG from SVG using ImageMagick: ${pngPath}`);
        return;
      } catch (err) {
        console.error('ImageMagick not available for SVG conversion');
      }
      
      // If we get here, we couldn't convert SVG to PNG, but we still have the SVG
      console.log(`Created SVG placeholder: ${svgPath}`);
    } catch (err) {
      console.error(`Error converting SVG to PNG for page ${pageNumber}:`, err);
      // SVG file is already created as fallback
    }
  } catch (err) {
    console.error(`Error creating placeholder for page ${pageNumber}:`, err);
  }
}
