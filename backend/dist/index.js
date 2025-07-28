"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const publication_controller_1 = require("./controllers/publication.controller");
const editorial_controller_1 = require("./controllers/editorial.controller");
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
const app = (0, express_1.default)();
const port = 3000;
// Create MySQL connection pool
const pool = promise_1.default.createPool({
    host: config_1.config.database.host,
    port: config_1.config.database.port,
    database: config_1.config.database.database,
    user: config_1.config.database.user,
    password: config_1.config.database.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Test MySQL connection
(async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT NOW() AS `current_time`');
        console.log('MySQL database connected successfully. Current time:', rows[0].current_time);
        connection.release();
    }
    catch (err) {
        console.error('MySQL database connection error:', err);
    }
})();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/publications', publication_controller_1.publicationController);
app.use('/api/editorials', editorial_controller_1.editorialController);
// Log registered routes
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Route registered: ${r.route.path}`);
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
