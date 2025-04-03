"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const publication_controller_1 = require("./controllers/publication.controller");
const editorial_controller_1 = require("./controllers/editorial.controller");
const pg_1 = require("pg");
const config_1 = require("./config");
const app = (0, express_1.default)();
const port = 3000;
// Create and test database connection
const pool = new pg_1.Pool(config_1.config.database);
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    }
    else {
        console.log('Database connected successfully');
    }
});
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
