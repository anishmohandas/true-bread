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
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api', subscription_routes_1.default);
app.use('/api/editorials', editorial_controller_1.editorialController);
app.use('/api/publications', publication_controller_1.publicationController);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
