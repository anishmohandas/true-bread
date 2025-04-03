import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './routes/subscription.routes';
import { editorialController } from './controllers/editorial.controller';
import { publicationController } from './controllers/publication.controller';
import { articleController } from './controllers/article.controller';
import { config } from './config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', subscriptionRoutes);
app.use('/api/editorials', editorialController);
app.use('/api/publications', publicationController);
app.use('/api/articles', articleController);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


