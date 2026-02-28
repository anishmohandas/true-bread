import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { pool } from '../db';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';
// env loaded via dotenv in server.ts

const router = express.Router();

// Disable caching for all admin API responses
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ─── Multer Configuration ────────────────────────────────────────────────────

// Resolve paths to Angular assets (relative to this file: backend/src/routes/)
const ARTICLE_IMAGES_DIR = path.join(__dirname, '../../../src/assets/images/articles');
const PUBLICATIONS_FILES_DIR = path.join(__dirname, '../../../src/assets/files');

// Ensure directories exist
[ARTICLE_IMAGES_DIR, PUBLICATIONS_FILES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── Slug helper ─────────────────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a title string.
 * e.g. "Cure for Hopelessness" → "cure-for-hopelessness"
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric (keep spaces & hyphens)
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

/**
 * Ensure the slug is unique in the articles table.
 * If "my-slug" already exists, tries "my-slug-2", "my-slug-3", …
 */
async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let suffix = 2;
  while (true) {
    const [rows] = await pool.query('SELECT id FROM articles WHERE id = ? LIMIT 1', [candidate]);
    if ((rows as any[]).length === 0) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

// Article image upload — use memory storage so sharp can process the buffer
const articleImageStorage = multer.memoryStorage();

/**
 * Optimise an uploaded image buffer with sharp:
 *  - Resize to max 1200 px wide (no upscaling)
 *  - Convert to WebP at quality 82
 *  - Save to ARTICLE_IMAGES_DIR
 * Returns the relative asset URL string.
 */
async function optimizeAndSaveImage(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const outputFilename = `${baseName}.webp`;
  const outputPath = path.join(ARTICLE_IMAGES_DIR, outputFilename);

  await sharp(buffer)
    .resize(1200, undefined, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 82 })
    .toFile(outputPath);

  return `assets/images/articles/${outputFilename}`;
}

// Publication PDF upload storage
const publicationPdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PUBLICATIONS_FILES_DIR);
  },
  filename: (req, _file, cb) => {
    // Format: TrueBread_Mar_2026.pdf
    const { month, year } = req.body;
    const monthStr = month ? month.charAt(0).toUpperCase() + month.slice(1, 3) : 'Jan';
    const yearStr = year || new Date().getFullYear();
    cb(null, `TrueBread_${monthStr}_${yearStr}.pdf`);
  }
});

const uploadArticleImage = multer({
  storage: articleImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files (jpg, png, webp) are allowed'));
  }
});

const uploadPublicationPdf = multer({
  storage: publicationPdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// ─── Admin Login ─────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
  const jwtSecret = process.env.JWT_SECRET || 'truebread-admin-secret-key';

  if (username !== adminUsername) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  try {
    let isValid = false;

    if (adminPasswordHash) {
      isValid = await bcrypt.compare(password, adminPasswordHash);
    } else {
      // Fallback for development: plain password from env
      const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
      isValid = password === plainPassword;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { username: adminUsername },
      jwtSecret,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      expiresIn: 28800, // 8 hours in seconds
      username: adminUsername
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ─── Articles List ────────────────────────────────────────────────────────────

// GET all articles (admin view)
router.get('/articles', authenticateAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, author, category, image_url as imageUrl, publish_date as publishDate,
              read_time as readTime, is_featured as isFeatured, language
       FROM articles ORDER BY publish_date DESC`
    );
    res.json({
      status: 'success',
      data: rows,
      total: (rows as any[]).length
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// ─── Publications List ────────────────────────────────────────────────────────

// GET all publications (admin view)
router.get('/publications', authenticateAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, cover_image as coverImage, pdf_url as pdfUrl,
              publish_date as publishDate, publication_month as month, publication_year as year,
              issue_number as issueNumber
       FROM publications ORDER BY publish_date DESC`
    );
    res.json({
      status: 'success',
      data: rows,
      total: (rows as any[]).length
    });
  } catch (error: any) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications.' });
  }
});

// ─── Subscribers ─────────────────────────────────────────────────────────────

// GET all subscribers
router.get('/subscribers', authenticateAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, subscription_date, is_active FROM subscribers ORDER BY subscription_date DESC'
    );
    res.json({
      status: 'success',
      data: rows,
      total: (rows as any[]).length
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

// DELETE a subscriber
router.delete('/subscribers/:id', authenticateAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Subscriber not found.' });
    }
    res.json({ status: 'success', message: 'Subscriber deleted.' });
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Failed to delete subscriber.' });
  }
});

// ─── Articles ─────────────────────────────────────────────────────────────────

// POST create article (with optional image file upload)
router.post('/articles', authenticateAdmin, uploadArticleImage.single('imageFile'), async (req, res) => {
  try {
    const {
      title, author, jobTitle, worksAt, category,
      imageUrl, altText, content, excerpt,
      publishDate, readTime, isFeatured, language
    } = req.body;

    if (!title || !author || !category || !content) {
      return res.status(400).json({ error: 'title, author, category, and content are required.' });
    }

    // Determine image URL: uploaded file takes priority over URL string
    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = await optimizeAndSaveImage(req.file.buffer, req.file.originalname);
    }

    const id = await uniqueSlug(generateSlug(title));
    const featured = isFeatured === 'true' || isFeatured === true ? 1 : 0;
    const lang = language || 'en';
    const date = publishDate || new Date().toISOString().split('T')[0];
    const readTimeVal = parseInt(readTime) || 5;

    await pool.query(
      `INSERT INTO articles 
        (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, 
         publish_date, read_time, is_featured, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, author, jobTitle || null, worksAt || null, category,
       finalImageUrl, altText || '', content, excerpt || '',
       date, readTimeVal, featured, lang]
    );

    res.status(201).json({
      status: 'success',
      message: 'Article created successfully.',
      data: { id, title, imageUrl: finalImageUrl }
    });
  } catch (error: any) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article.', details: error.message });
  }
});

// GET single article by ID (for edit form)
router.get('/articles/:id', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, author, job_title as jobTitle, works_at as worksAt, category,
              image_url as imageUrl, alt_text as altText, content, excerpt,
              publish_date as publishDate, read_time as readTime, is_featured as isFeatured, language
       FROM articles WHERE id = ?`,
      [req.params.id]
    );
    const article = (rows as any[])[0];
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json({ status: 'success', data: article });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

// PUT update article
router.put('/articles/:id', authenticateAdmin, uploadArticleImage.single('imageFile'), async (req, res) => {
  try {
    const {
      title, author, jobTitle, worksAt, category,
      imageUrl, altText, content, excerpt,
      publishDate, readTime, isFeatured, language
    } = req.body;

    if (!title || !author || !category || !content) {
      return res.status(400).json({ error: 'title, author, category, and content are required.' });
    }

    // If a new image file was uploaded, use it; otherwise keep existing imageUrl
    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = await optimizeAndSaveImage(req.file.buffer, req.file.originalname);
    }

    const featured = isFeatured === 'true' || isFeatured === true ? 1 : 0;
    const lang = language || 'en';
    const date = publishDate || new Date().toISOString().split('T')[0];
    const readTimeVal = parseInt(readTime) || 5;

    const [result] = await pool.query(
      `UPDATE articles SET
        title = ?, author = ?, job_title = ?, works_at = ?, category = ?,
        image_url = ?, alt_text = ?, content = ?, excerpt = ?,
        publish_date = ?, read_time = ?, is_featured = ?, language = ?
       WHERE id = ?`,
      [title, author, jobTitle || null, worksAt || null, category,
       finalImageUrl, altText || '', content, excerpt || '',
       date, readTimeVal, featured, lang, req.params.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.json({
      status: 'success',
      message: 'Article updated successfully.',
      data: { id: req.params.id, title, imageUrl: finalImageUrl }
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article.', details: error.message });
  }
});

// DELETE an article
router.delete('/articles/:id', authenticateAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json({ status: 'success', message: 'Article deleted.' });
  } catch (error: any) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

// ─── Publications ─────────────────────────────────────────────────────────────

// POST create publication (with PDF file upload)
router.post('/publications', authenticateAdmin, uploadPublicationPdf.single('pdfFile'), async (req, res) => {
  try {
    const {
      title, description, coverImage,
      publishDate, month, year, issueNumber, highlights
    } = req.body;

    if (!title || !month || !year) {
      return res.status(400).json({ error: 'title, month, and year are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required.' });
    }

    const id = uuidv4();
    const pdfUrl = `assets/files/${req.file.filename}`;
    const date = publishDate || new Date().toISOString().split('T')[0];
    const issueNum = parseInt(issueNumber) || null;

    // Insert publication
    await pool.query(
      `INSERT INTO publications 
        (id, title, description, cover_image, pdf_url, publish_date, publication_month, publication_year, issue_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || '', coverImage || '', pdfUrl, date, month, parseInt(year), issueNum]
    );

    // Insert highlights if provided
    if (highlights) {
      const highlightList: string[] = Array.isArray(highlights)
        ? highlights
        : highlights.split('\n').map((h: string) => h.trim()).filter((h: string) => h);

      for (const highlight of highlightList) {
        await pool.query(
          'INSERT INTO publication_highlights (publication_id, title) VALUES (?, ?)',
          [id, highlight]
        );
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Publication created successfully.',
      data: { id, title, pdfUrl }
    });
  } catch (error: any) {
    console.error('Error creating publication:', error);
    res.status(500).json({ error: 'Failed to create publication.', details: error.message });
  }
});

// GET single publication by ID (for edit form)
router.get('/publications/:id', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, cover_image as coverImage, pdf_url as pdfUrl,
              publish_date as publishDate, publication_month as month, publication_year as year,
              issue_number as issueNumber
       FROM publications WHERE id = ?`,
      [req.params.id]
    );
    const publication = (rows as any[])[0];
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found.' });
    }
    // Fetch highlights
    const [highlights] = await pool.query(
      'SELECT title FROM publication_highlights WHERE publication_id = ?',
      [req.params.id]
    );
    publication.highlights = (highlights as any[]).map((h: any) => h.title).join('\n');
    res.json({ status: 'success', data: publication });
  } catch (error: any) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ error: 'Failed to fetch publication.' });
  }
});

// PUT update publication (PDF is optional on edit)
router.put('/publications/:id', authenticateAdmin, uploadPublicationPdf.single('pdfFile'), async (req, res) => {
  try {
    const {
      title, description, coverImage,
      publishDate, month, year, issueNumber, highlights, existingPdfUrl
    } = req.body;

    if (!title || !month || !year) {
      return res.status(400).json({ error: 'title, month, and year are required.' });
    }

    // Use new PDF if uploaded, otherwise keep existing
    let pdfUrl = existingPdfUrl || '';
    if (req.file) {
      pdfUrl = `assets/files/${req.file.filename}`;
    }

    const date = publishDate || new Date().toISOString().split('T')[0];
    const issueNum = parseInt(issueNumber) || null;

    const [result] = await pool.query(
      `UPDATE publications SET
        title = ?, description = ?, cover_image = ?, pdf_url = ?,
        publish_date = ?, publication_month = ?, publication_year = ?, issue_number = ?
       WHERE id = ?`,
      [title, description || '', coverImage || '', pdfUrl,
       date, month, parseInt(year), issueNum, req.params.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Publication not found.' });
    }

    // Replace highlights
    await pool.query('DELETE FROM publication_highlights WHERE publication_id = ?', [req.params.id]);
    if (highlights) {
      const highlightList: string[] = Array.isArray(highlights)
        ? highlights
        : highlights.split('\n').map((h: string) => h.trim()).filter((h: string) => h);
      for (const highlight of highlightList) {
        await pool.query(
          'INSERT INTO publication_highlights (publication_id, title) VALUES (?, ?)',
          [req.params.id, highlight]
        );
      }
    }

    res.json({
      status: 'success',
      message: 'Publication updated successfully.',
      data: { id: req.params.id, title, pdfUrl }
    });
  } catch (error: any) {
    console.error('Error updating publication:', error);
    res.status(500).json({ error: 'Failed to update publication.', details: error.message });
  }
});

// DELETE a publication
router.delete('/publications/:id', authenticateAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM publications WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Publication not found.' });
    }
    res.json({ status: 'success', message: 'Publication deleted.' });
  } catch (error: any) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Failed to delete publication.' });
  }
});

export default router;
