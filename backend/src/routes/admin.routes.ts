import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { pool } from '../db';
import { config } from '../config';
import { authenticateAdmin } from '../middleware/auth.middleware';
// env loaded via dotenv in server.ts

/** Today's date as YYYY-MM-DD in the server's local time zone (fallback only). */
function localDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** An Error that carries the HTTP status to send back. */
function httpError(statusCode: number, message: string): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

/**
 * Run a multer middleware and turn its errors (wrong file type, file too large,
 * duplicate issue) into the same { error } JSON shape as the rest of this router,
 * instead of letting them fall through to the generic 500 handler.
 */
function handleUpload(middleware: express.RequestHandler): express.RequestHandler {
  return (req, res, next) => {
    middleware(req, res, (err?: any) => {
      if (!err) return next();
      const status = err.statusCode || (err instanceof multer.MulterError ? 400 : 500);
      if (status === 500) console.error('Upload error:', err);
      res.status(status).json({ error: status === 500 ? 'File upload failed.' : err.message });
    });
  };
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/** Issue id in the same form the SQL scripts use, e.g. "november-2026". Null if invalid. */
function publicationId(month: unknown, year: unknown): string | null {
  const m = MONTHS.find(name => name.toLowerCase() === String(month || '').toLowerCase());
  const y = parseInt(String(year || ''), 10);
  if (!m || !(y >= 2000 && y <= 2100)) return null;
  return `${m.toLowerCase()}-${y}`;
}

const router = express.Router();

// Disable caching for all admin API responses
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ─── Multer Configuration ────────────────────────────────────────────────────

// Uploads are saved into the frontend's served assets folder (FRONTEND_ASSETS_DIR),
// so the stored "assets/..." URLs resolve on the live site straight away.
const ARTICLE_IMAGES_DIR = path.join(config.frontendAssetsDir, 'images/articles');
const PUBLICATIONS_FILES_DIR = path.join(config.frontendAssetsDir, 'files');
console.log(`Admin uploads go to ${config.frontendAssetsDir}`);

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

// articles.id is VARCHAR(50)
const MAX_SLUG_LENGTH = 50;

/** Shorten a slug to maxLength, cutting at a hyphen when possible so words stay whole. */
function truncateSlug(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  const lastHyphen = cut.lastIndexOf('-');
  return (lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/, '');
}

/**
 * Ensure the slug is unique in the articles table and fits the id column.
 * If "my-slug" already exists, tries "my-slug-2", "my-slug-3", …
 */
async function uniqueSlug(base: string): Promise<string> {
  const root = truncateSlug(base, MAX_SLUG_LENGTH) || 'article';
  let candidate = root;
  let suffix = 2;
  while (true) {
    const [rows] = await pool.query('SELECT id FROM articles WHERE id = ? LIMIT 1', [candidate]);
    if ((rows as any[]).length === 0) return candidate;
    const tail = `-${suffix++}`;
    candidate = truncateSlug(root, MAX_SLUG_LENGTH - tail.length) + tail;
  }
}

// Article image upload — use memory storage so sharp can process the buffer
const articleImageStorage = multer.memoryStorage();

/**
 * Optimise an uploaded image buffer with sharp:
 *  - Resize to max 1200 px wide (no upscaling)
 *  - Convert to WebP at quality 82
 *  - Save to ARTICLE_IMAGES_DIR as <article-slug>-<random>.webp, so an upload
 *    can never overwrite another article's image (or a cached older version)
 * Returns the relative asset URL string.
 */
async function optimizeAndSaveImage(buffer: Buffer, articleId: string): Promise<string> {
  const outputFilename = `${articleId}-${crypto.randomBytes(3).toString('hex')}.webp`;
  const outputPath = path.join(ARTICLE_IMAGES_DIR, outputFilename);

  await sharp(buffer)
    .resize(1200, undefined, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 82 })
    .toFile(outputPath);

  return `assets/images/articles/${outputFilename}`;
}

/**
 * If an issue other than `exceptId` already exists for this month and year,
 * return a message saying so; otherwise null. Matches on the month/year columns
 * rather than the id, because older admin-created issues have random ids.
 */
async function monthConflictMessage(month: string, year: string, exceptId?: string): Promise<string | null> {
  const [rows] = await pool.query(
    'SELECT id FROM publications WHERE LOWER(publication_month) = LOWER(?) AND publication_year = ?',
    [month, parseInt(year, 10)]
  );
  const taken = (rows as any[]).some(r => r.id !== exceptId);
  return taken ? `An issue for ${month} ${year} already exists. Edit that issue instead.` : null;
}

/** Remove an image this request saved, when the database write that needed it failed. */
function removeSavedImage(imageUrl: string): void {
  if (!imageUrl.startsWith('assets/images/articles/')) return;
  fs.unlink(path.join(ARTICLE_IMAGES_DIR, path.basename(imageUrl)), () => {});
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
    else cb(httpError(400, 'Only image files (jpg, png, webp) are allowed.'));
  }
});

const uploadPublicationPdf = multer({
  storage: publicationPdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  // Runs before the PDF is written to disk. The PDF is named after its month and
  // year, so refuse it if another issue already owns that month; otherwise the
  // upload would silently overwrite that issue's PDF. (The form sends the month
  // and year fields before the file, so req.body has them here.)
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(httpError(400, 'Only PDF files are allowed.'));
    }
    if (!publicationId(req.body.month, req.body.year)) {
      return cb(httpError(400, 'A valid month and year are required.'));
    }
    monthConflictMessage(req.body.month, req.body.year, req.params.id)
      .then(conflict => conflict ? cb(httpError(409, conflict)) : cb(null, true))
      .catch(err => cb(err));
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
      `SELECT id, title, author, category, image_url as imageUrl,
              DATE_FORMAT(publish_date, '%Y-%m-%d') as publishDate,
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
              DATE_FORMAT(publish_date, '%Y-%m-%d') as publishDate,
              publication_month as month, publication_year as year,
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
router.post('/articles', authenticateAdmin, handleUpload(uploadArticleImage.single('imageFile')), async (req, res) => {
  let savedImageUrl = '';
  try {
    const {
      title, author, jobTitle, worksAt, category,
      imageUrl, altText, content, excerpt,
      publishDate, readTime, isFeatured, language
    } = req.body;

    if (!title || !author || !category || !content) {
      return res.status(400).json({ error: 'title, author, category, and content are required.' });
    }

    const id = await uniqueSlug(generateSlug(title));

    // Determine image URL: uploaded file takes priority over URL string
    let finalImageUrl = imageUrl || '';
    if (req.file) {
      savedImageUrl = await optimizeAndSaveImage(req.file.buffer, id);
      finalImageUrl = savedImageUrl;
    }

    const featured = isFeatured === 'true' || isFeatured === true ? 1 : 0;
    const lang = language === 'ml' ? 'ml' : 'en';
    const date = publishDate || localDateString();
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
    if (savedImageUrl) removeSavedImage(savedImageUrl);
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
              DATE_FORMAT(publish_date, '%Y-%m-%d') as publishDate,
              read_time as readTime, is_featured as isFeatured, language
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
router.put('/articles/:id', authenticateAdmin, handleUpload(uploadArticleImage.single('imageFile')), async (req, res) => {
  let savedImageUrl = '';
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
      savedImageUrl = await optimizeAndSaveImage(req.file.buffer, req.params.id);
      finalImageUrl = savedImageUrl;
    }

    const featured = isFeatured === 'true' || isFeatured === true ? 1 : 0;
    const lang = language === 'ml' ? 'ml' : 'en';
    const date = publishDate || localDateString();
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
      if (savedImageUrl) removeSavedImage(savedImageUrl);
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.json({
      status: 'success',
      message: 'Article updated successfully.',
      data: { id: req.params.id, title, imageUrl: finalImageUrl }
    });
  } catch (error: any) {
    if (savedImageUrl) removeSavedImage(savedImageUrl);
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
router.post('/publications', authenticateAdmin, handleUpload(uploadPublicationPdf.single('pdfFile')), async (req, res) => {
  try {
    const {
      title, description, coverImage,
      publishDate, month, year, issueNumber, highlights
    } = req.body;

    const id = publicationId(month, year);
    if (!title || !id) {
      return res.status(400).json({ error: 'title and a valid month and year are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required.' });
    }

    const pdfUrl = `assets/files/${req.file.filename}`;
    const date = publishDate || localDateString();
    // issue_number is NOT NULL: default to the next number after the highest one
    let issueNum = parseInt(issueNumber) || 0;
    if (!issueNum) {
      const [[row]] = await pool.query('SELECT COALESCE(MAX(issue_number), 0) + 1 AS next FROM publications') as any;
      issueNum = row.next;
    }

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
              DATE_FORMAT(publish_date, '%Y-%m-%d') as publishDate,
              publication_month as month, publication_year as year,
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
router.put('/publications/:id', authenticateAdmin, handleUpload(uploadPublicationPdf.single('pdfFile')), async (req, res) => {
  try {
    const {
      title, description, coverImage,
      publishDate, month, year, issueNumber, highlights, existingPdfUrl
    } = req.body;

    if (!title || !publicationId(month, year)) {
      return res.status(400).json({ error: 'title and a valid month and year are required.' });
    }

    // Moving an issue to a month another issue already has would create two
    // issues for that month (the PDF upload path checks this before saving).
    const conflict = await monthConflictMessage(month, year, req.params.id);
    if (conflict) {
      return res.status(409).json({ error: conflict });
    }

    // Use new PDF if uploaded, otherwise keep existing
    let pdfUrl = existingPdfUrl || '';
    if (req.file) {
      pdfUrl = `assets/files/${req.file.filename}`;
    }

    const date = publishDate || localDateString();
    const issueNum = parseInt(issueNumber) || null;
    if (!issueNum) {
      return res.status(400).json({ error: 'Issue number is required.' });
    }

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
  // publication_highlights has no foreign key, so delete an issue's highlights
  // together with it (in one transaction) rather than leaving them orphaned.
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query('DELETE FROM publications WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Publication not found.' });
    }
    await conn.query('DELETE FROM publication_highlights WHERE publication_id = ?', [req.params.id]);
    await conn.commit();
    res.json({ status: 'success', message: 'Publication deleted.' });
  } catch (error: any) {
    await conn.rollback().catch(() => {});
    console.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Failed to delete publication.' });
  } finally {
    conn.release();
  }
});

export default router;
