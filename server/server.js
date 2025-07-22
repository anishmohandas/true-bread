const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { convertPdfToImages } = require('../scripts/pdf-to-images');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// API endpoint to convert PDF to images
app.post('/api/convert-pdf', upload.single('pdf'), async (req, res) => {
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
    const outputDir = path.join(__dirname, 'public/images', issueId);
    fs.ensureDirSync(outputDir);
    
    // Convert PDF to images
    await convertPdfToImages(pdfPath, startPage, endPage, outputDir);
    
    // Generate image URLs
    const imageUrls = [];
    for (let i = startPage; i <= endPage; i++) {
      imageUrls.push(`/images/${issueId}/page_${i}.png`);
    }
    
    // Clean up the uploaded PDF
    fs.removeSync(pdfPath);
    
    res.json({ 
      success: true, 
      images: imageUrls 
    });
  } catch (error) {
    console.error('Error converting PDF:', error);
    res.status(500).json({ error: 'Failed to convert PDF' });
  }
});

// API endpoint to convert PDF from URL
app.post('/api/convert-pdf-url', async (req, res) => {
  try {
    const { pdfUrl, startPage, endPage, issueId } = req.body;
    
    if (!pdfUrl) {
      return res.status(400).json({ error: 'No PDF URL provided' });
    }
    
    // Create a unique output directory for this issue
    const outputDir = path.join(__dirname, 'public/images', issueId || 'latest-issue');
    fs.ensureDirSync(outputDir);
    
    // Create uploads directory
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    
    // Download the PDF
    const pdfPath = path.join(uploadDir, `${uuidv4()}.pdf`);
    const response = await axios({
      method: 'get',
      url: pdfUrl,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(pdfPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Convert PDF to images
    const start = parseInt(startPage) || 1;
    const end = parseInt(endPage) || 5;
    await convertPdfToImages(pdfPath, start, end, outputDir);
    
    // Generate image URLs
    const imageUrls = [];
    for (let i = start; i <= end; i++) {
      imageUrls.push(`/images/${issueId || 'latest-issue'}/page_${i}.png`);
    }
    
    // Clean up the downloaded PDF
    fs.removeSync(pdfPath);
    
    res.json({ 
      success: true, 
      images: imageUrls 
    });
  } catch (error) {
    console.error('Error converting PDF from URL:', error);
    res.status(500).json({ error: 'Failed to convert PDF from URL' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
