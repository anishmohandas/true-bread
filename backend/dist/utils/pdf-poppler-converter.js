"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPdfToImages = convertPdfToImages;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const pdf_poppler_1 = require("pdf-poppler");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * Convert PDF pages to images using pdf-poppler
 * @param pdfPath - Path to the PDF file
 * @param startPage - First page to convert (1-based index)
 * @param endPage - Last page to convert (1-based index)
 * @param outputDir - Directory to save images
 * @param dpi - DPI for the output images (higher = better quality but larger files)
 */
async function convertPdfToImages(pdfPath, startPage = 1, endPage = 5, outputDir = 'public/images/pdf-pages', dpi = 300) {
    try {
        // Create output directory if it doesn't exist
        await fs_extra_1.default.ensureDir(outputDir);
        console.log(`Converting PDF: ${pdfPath}`);
        console.log(`Output directory: ${outputDir}`);
        // Set conversion options
        const options = {
            format: 'png',
            out_dir: outputDir,
            out_prefix: 'page_',
            page: null, // Will be set in the loop
            scale: dpi / 72, // Convert DPI to scale factor
            png_quality: 100
        };
        // Convert each page individually
        for (let i = startPage; i <= endPage; i++) {
            try {
                console.log(`Converting page ${i}...`);
                // Set the page number for this iteration
                options.page = i;
                // Convert the page
                await (0, pdf_poppler_1.convert)(pdfPath, options);
                console.log(`Successfully converted page ${i}`);
            }
            catch (err) {
                console.error(`Error converting page ${i}:`, err);
                // Create a placeholder image if conversion fails
                await createPlaceholderImage(i, outputDir);
            }
        }
        console.log('Conversion complete!');
        return outputDir;
    }
    catch (err) {
        console.error('Error converting PDF to images:', err);
        // Create placeholder images if conversion fails
        for (let i = startPage; i <= endPage; i++) {
            await createPlaceholderImage(i, outputDir);
        }
        return outputDir;
    }
}
/**
 * Create a placeholder image when PDF conversion fails
 * @param pageNumber - Page number for the placeholder
 * @param outputDir - Directory to save the placeholder image
 */
async function createPlaceholderImage(pageNumber, outputDir) {
    try {
        console.log(`Creating placeholder for page ${pageNumber}...`);
        // Try to use ImageMagick to create a placeholder
        const placeholderPath = path_1.default.join(outputDir, `page_${pageNumber}.png`);
        try {
            // Create a simple colored placeholder with text using ImageMagick
            const command = `magick -size 600x800 canvas:white -fill black -pointsize 40 -gravity center -annotate 0 "Page ${pageNumber}\\nPlaceholder" "${placeholderPath}"`;
            await execPromise(command);
            console.log(`Created placeholder image using ImageMagick: ${placeholderPath}`);
        }
        catch (err) {
            console.error('ImageMagick not available, creating SVG placeholder instead');
            // If ImageMagick fails, create an SVG placeholder
            const svgContent = `
        <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="800" fill="white" />
          <text x="300" y="400" font-family="Arial" font-size="40" text-anchor="middle" fill="black">Page ${pageNumber}</text>
          <text x="300" y="460" font-family="Arial" font-size="20" text-anchor="middle" fill="black">Placeholder Image</text>
        </svg>
      `;
            const svgPath = path_1.default.join(outputDir, `page_${pageNumber}.svg`);
            await fs_extra_1.default.writeFile(svgPath, svgContent);
            console.log(`Created SVG placeholder: ${svgPath}`);
        }
    }
    catch (err) {
        console.error(`Error creating placeholder for page ${pageNumber}:`, err);
    }
}
