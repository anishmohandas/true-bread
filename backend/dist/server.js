"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const editorial_controller_1 = require("./controllers/editorial.controller");
const publication_controller_1 = require("./controllers/publication.controller");
const article_controller_1 = require("./controllers/article.controller");
const pdf_controller_1 = require("./controllers/pdf.controller");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    credentials: true
}));
app.use(express_1.default.json());
// Serve static files for PDF images and files
app.use('/api/pdf/images', express_1.default.static(path_1.default.join(__dirname, '../public/images')));
app.use('/api/files', express_1.default.static(path_1.default.join(__dirname, '../public/files')));
// Routes
app.use('/api', subscription_routes_1.default);
app.use('/api/editorials', editorial_controller_1.editorialController);
app.use('/api/publications', publication_controller_1.publicationController);
app.use('/api/articles', article_controller_1.articleController);
app.use('/api/pdf', pdf_controller_1.pdfController);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
