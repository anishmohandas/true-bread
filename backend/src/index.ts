import express from 'express';
import cors from 'cors';
import { publicationController } from './controllers/publication.controller';
import { editorialController } from './controllers/editorial.controller';
import mysql from 'mysql2/promise';
import { config } from './config';

const app = express();
const port = 3000;

// Create MySQL connection pool
const pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test MySQL connection
(async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT NOW() AS `current_time`') as any;
        console.log('MySQL database connected successfully. Current time:', rows[0].current_time);
        connection.release();
    } catch (err) {
        console.error('MySQL database connection error:', err);
    }
})();

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
