import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './routes/subscription.routes';
import healthRoutes from './routes/health.routes';
import emailRoutes from './routes/email.routes';
import { editorialController } from './controllers/editorial.controller';
import { publicationController } from './controllers/publication.controller';
import { articleController } from './controllers/article.controller';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { config } from './config';
import path from 'path';

const app = express();

// Security headers middleware (basic security without helmet for now)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

// Trust proxy for production (important for cPanel hosting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:4200', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for images and files
app.use('/api/files', express.static(path.join(__dirname, '../public/files')));
app.use('/api/images', express.static(path.join(__dirname, '../public/images')));

// Health check routes (should be first)
app.use('/api', healthRoutes);

// API Routes
app.use('/api', subscriptionRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/editorials', editorialController);
app.use('/api/publications', publicationController);
app.use('/api/articles', articleController);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (should be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 True Bread Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: ${config.baseUrl}`);
    console.log(`📧 Email configured: ${config.email.user ? '✅' : '❌'}`);
    console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
});
