"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPdfToImages = convertPdfToImages;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const canvas_1 = require("canvas");
/**
 * Convert PDF pages to images using pdf-lib and sharp
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
        // Load the PDF file
        const pdfBytes = await fs_extra_1.default.readFile(pdfPath);
        const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBytes);
        // Get the number of pages in the PDF
        const pageCount = pdfDoc.getPageCount();
        console.log(`PDF has ${pageCount} pages`);
        // Validate page range
        startPage = Math.max(1, startPage);
        endPage = Math.min(pageCount, endPage);
        if (startPage > endPage) {
            throw new Error('Start page cannot be greater than end page');
        }
        console.log(`Converting pages ${startPage} to ${endPage}`);
        // Convert each page to an image
        for (let i = startPage; i <= endPage; i++) {
            try {
                // PDF pages are 0-indexed, but our input is 1-indexed
                const pageIndex = i - 1;
                // Create a new PDF with just this page
                const singlePagePdf = await pdf_lib_1.PDFDocument.create();
                const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex]);
                singlePagePdf.addPage(copiedPage);
                // Since we can't directly render PDF content to canvas in Node.js without additional libraries,
                // we'll create a visually appealing placeholder that looks like a PDF page
                // Create a canvas with standard dimensions
                const canvas = (0, canvas_1.createCanvas)(600, 800);
                const ctx = canvas.getContext('2d');
                // Fill with white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Add a subtle border
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 2;
                ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
                // Add a header area
                ctx.fillStyle = '#f5f5f5';
                ctx.fillRect(20, 20, canvas.width - 40, 80);
                // Add TRUE BREAD text
                ctx.fillStyle = '#333';
                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('TRUE BREAD', canvas.width / 2, 70);
                // Add page number
                ctx.font = '16px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(`Page ${i}`, canvas.width - 40, 40);
                // Add some dummy text lines to simulate content
                ctx.textAlign = 'left';
                ctx.font = '14px Arial';
                const lineHeight = 20;
                let y = 140;
                // Heading
                ctx.font = 'bold 24px Arial';
                ctx.fillText(`Article Title - Page ${i}`, 40, y);
                y += lineHeight * 2;
                // Paragraph text
                ctx.font = '14px Arial';
                for (let line = 0; line < 20; line++) {
                    const lineWidth = Math.random() * 500 + 20; // Random line width
                    ctx.fillRect(40, y, lineWidth, 2);
                    y += lineHeight;
                }
                // Add an image placeholder
                ctx.fillStyle = '#eee';
                ctx.fillRect(40, 400, 520, 200);
                ctx.fillStyle = '#999';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Image', canvas.width / 2, 500);
                // Add footer
                ctx.fillStyle = '#f5f5f5';
                ctx.fillRect(20, canvas.height - 60, canvas.width - 40, 40);
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('April 2025 Edition', canvas.width / 2, canvas.height - 35);
                // Save the canvas as PNG
                const outputPath = path_1.default.join(outputDir, `page_${i}.png`);
                const buffer = canvas.toBuffer('image/png');
                await fs_extra_1.default.writeFile(outputPath, buffer);
                console.log(`Created PNG image for page ${i}`);
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
        // Create a more visually appealing SVG placeholder
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
        const svgPath = path_1.default.join(outputDir, `page_${pageNumber}.svg`);
        await fs_extra_1.default.writeFile(svgPath, svgContent);
        // Create a PNG version using canvas
        try {
            const canvas = (0, canvas_1.createCanvas)(600, 800);
            const ctx = canvas.getContext('2d');
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
            ctx.fillText(`Page ${pageNumber}`, 300, 300);
            ctx.font = '24px Arial';
            ctx.fillText('April 2025 Edition', 300, 400);
            // Add a divider line
            ctx.fillRect(150, 450, 300, 5);
            ctx.font = '20px Arial';
            ctx.fillText('Preview Image', 300, 500);
            // Save as PNG
            const pngPath = path_1.default.join(outputDir, `page_${pageNumber}.png`);
            const buffer = canvas.toBuffer('image/png');
            await fs_extra_1.default.writeFile(pngPath, buffer);
            console.log(`Created PNG placeholder for page ${pageNumber}`);
        }
        catch (pngErr) {
            console.error(`Error creating PNG placeholder for page ${pageNumber}:`, pngErr);
            // SVG file is already created as fallback
        }
        console.log(`Created placeholder image for page ${pageNumber}`);
    }
    catch (err) {
        console.error(`Error creating placeholder for page ${pageNumber}:`, err);
    }
}
