import express, { Router, Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { convertPdfToImages } from '../utils/pdf-cmd-converter';
import { config } from '../config';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        fs.ensureDirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
router.use('/images', express.static(path.join(__dirname, '../../public/images')));

// API endpoint to convert PDF from URL
router.post('/convert-from-url', async (req: Request, res: Response) => {
    try {
        const { pdfUrl, startPage, endPage, issueId } = req.body;

        if (!pdfUrl) {
            return res.status(400).json({ error: 'No PDF URL provided' });
        }

        // Create a unique output directory for this issue
        const outputDir = path.join(__dirname, '../../public/images', issueId || 'latest-issue');
        fs.ensureDirSync(outputDir);

        // Create uploads directory
        const uploadDir = path.join(__dirname, '../../uploads');
        fs.ensureDirSync(uploadDir);

        // Handle the PDF path
        let pdfPath = '';

        console.log('Processing PDF URL:', pdfUrl);

        // Check if the URL is relative or absolute
        if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
            // It's an absolute URL, download it
            pdfPath = path.join(uploadDir, `${uuidv4()}.pdf`);
            try {
                console.log('Downloading PDF from URL:', pdfUrl);

                // Add headers to handle CORS
                const response = await axios({
                    method: 'get',
                    url: pdfUrl,
                    responseType: 'stream',
                    headers: {
                        'Origin': 'http://localhost:3000',
                        'Referer': 'http://localhost:3000/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                console.log('Download response status:', response.status);

                const writer = fs.createWriteStream(pdfPath);
                response.data.pipe(writer);

                await new Promise<void>((resolve, reject) => {
                    writer.on('finish', () => {
                        console.log('PDF download completed successfully');
                        resolve();
                    });
                    writer.on('error', (err) => {
                        console.error('Error writing PDF file:', err);
                        reject(err);
                    });
                });
            } catch (error: any) {
                console.error('Error downloading PDF:', error);

                // Create a more detailed error message
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                }

                throw new Error(`Failed to download PDF from URL: ${error.message || 'Unknown error'}`);
            }
        } else {
            // It's a relative path, check if it exists in the public directory
            let relativePath = pdfUrl.replace(/^\//, ''); // Remove leading slash if present

            // Check if the URL has a double .pdf extension and fix it
            if (relativePath.toLowerCase().endsWith('.pdf.pdf')) {
                console.log('Detected double .pdf extension, fixing...');
                relativePath = relativePath;
            } else if (!relativePath.toLowerCase().endsWith('.pdf')) {
                // Add .pdf extension if missing
                relativePath = relativePath + '.pdf';
            }

            // Check several possible locations
            const possiblePaths = [
                path.join(__dirname, '../../public', relativePath),
                path.join(__dirname, '../..', relativePath),
                path.join(process.cwd(), relativePath),
                path.join(process.cwd(), 'public', relativePath),
                path.join(process.cwd(), 'src', relativePath),
                // Add more paths to check
                path.join(process.cwd(), 'src/assets/files', path.basename(relativePath)),
                path.join(process.cwd(), 'src/assets', relativePath),
                path.join(process.cwd(), 'assets/files', path.basename(relativePath)),
                path.join(process.cwd(), 'assets', relativePath),
                // Try the Angular assets folder
                path.join(process.cwd(), '../src/assets/files', path.basename(relativePath)),
                path.join(process.cwd(), '../src/assets', relativePath)
            ];

            let fileFound = false;

            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    pdfPath = possiblePath;
                    fileFound = true;
                    console.log(`Found PDF at: ${pdfPath}`);
                    break;
                }
            }

            if (!fileFound) {
                throw new Error(`PDF file not found at any of the expected locations: ${relativePath}`);
            }
        }

        // Convert PDF to images
        const start = parseInt(startPage as string) || 1;
        const end = parseInt(endPage as string) || 5;
        console.log(`Converting PDF pages ${start} to ${end} to images`);
        await convertPdfToImages(pdfPath, start, end, outputDir);
        console.log('PDF conversion completed successfully');

        // Generate image URLs
        const baseUrl = config.baseUrl || 'http://localhost:3000';
        const imageUrls = [];

        // Check which files were actually created (PNG or SVG)
        const files = await fs.readdir(outputDir);

        for (let i = start; i <= end; i++) {
            // Check if PNG exists, otherwise use SVG
            if (files.includes(`page_${i}.png`)) {
                imageUrls.push(`${baseUrl}/api/pdf/images/${issueId || 'latest-issue'}/page_${i}.png`);
            } else if (files.includes(`page_${i}.svg`)) {
                imageUrls.push(`${baseUrl}/api/pdf/images/${issueId || 'latest-issue'}/page_${i}.svg`);
            }
        }

        // Clean up the downloaded PDF if it's in the uploads directory
        if (pdfPath.includes('uploads') && fs.existsSync(pdfPath)) {
            fs.removeSync(pdfPath);
        }

        res.json({
            success: true,
            images: imageUrls
        });
    } catch (error) {
        console.error('Error converting PDF from URL:', error);
        res.status(500).json({ error: 'Failed to convert PDF from URL' });
    }
});

// API endpoint to convert uploaded PDF
router.post('/convert', upload.single('pdf'), async (req: Request, res: Response) => {
    try {
        const pdfFile = req.file;

        if (!pdfFile) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        const pdfPath = pdfFile.path;
        const startPage = parseInt(req.body.startPage) || 1;
        const endPage = parseInt(req.body.endPage) || 5;
        const issueId = req.body.issueId || 'latest-issue';

        // Create a unique output directory for this issue
        const outputDir = path.join(__dirname, '../../public/images', issueId);
        fs.ensureDirSync(outputDir);

        // Convert PDF to images
        console.log(`Converting PDF pages ${startPage} to ${endPage} to images`);
        await convertPdfToImages(pdfPath, startPage, endPage, outputDir);
        console.log('PDF conversion completed successfully');

        // Generate image URLs
        const baseUrl = config.baseUrl || 'http://localhost:3000';
        const imageUrls = [];

        // Check which files were actually created (PNG or SVG)
        const files = await fs.readdir(outputDir);

        for (let i = startPage; i <= endPage; i++) {
            // Check if PNG exists, otherwise use SVG
            if (files.includes(`page_${i}.png`)) {
                imageUrls.push(`${baseUrl}/api/pdf/images/${issueId}/page_${i}.png`);
            } else if (files.includes(`page_${i}.svg`)) {
                imageUrls.push(`${baseUrl}/api/pdf/images/${issueId}/page_${i}.svg`);
            }
        }

        // Clean up the uploaded PDF if it exists
        if (pdfPath && fs.existsSync(pdfPath)) {
            fs.removeSync(pdfPath);
        }

        res.json({
            success: true,
            images: imageUrls
        });
    } catch (error) {
        console.error('Error converting PDF:', error);
        res.status(500).json({ error: 'Failed to convert PDF' });
    }
});

export const pdfController = router;
