"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
// Create and export MySQL connection pool
exports.pool = promise_1.default.createPool({
    host: config_1.config.database.host,
    port: config_1.config.database.port,
    database: config_1.config.database.database,
    user: config_1.config.database.user,
    password: config_1.config.database.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
