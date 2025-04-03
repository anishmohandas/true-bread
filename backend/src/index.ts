import express from 'express';
import cors from 'cors';
import { publicationController } from './controllers/publication.controller';
import { editorialController } from './controllers/editorial.controller';
import { Pool } from 'pg';
import { config } from './config';

const app = express();
const port = 3000;

// Create and test database connection
const pool = new Pool(config.database);
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/publications', publicationController);
app.use('/api/editorials', editorialController);

// Log registered routes
app._router.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
        console.log(`Route registered: ${r.route.path}`);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

