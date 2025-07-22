import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './routes/subscription.routes';
import { editorialController } from './controllers/editorial.controller';
import { publicationController } from './controllers/publication.controller';
import { articleController } from './controllers/article.controller';
import { pdfController } from './controllers/pdf.controller';
import { config } from './config';
import path from 'path';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
}));
app.use(express.json());

// Serve static files for PDF images and files
app.use('/api/pdf/images', express.static(path.join(__dirname, '../public/images')));
app.use('/api/files', express.static(path.join(__dirname, '../public/files')));

// Routes
app.use('/api', subscriptionRoutes);
app.use('/api/editorials', editorialController);
app.use('/api/publications', publicationController);
app.use('/api/articles', articleController);
app.use('/api/pdf', pdfController);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


