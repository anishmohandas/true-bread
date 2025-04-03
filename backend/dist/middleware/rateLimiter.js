"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeLimiter = exports.subscriptionLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.subscriptionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many subscription attempts from this IP, please try again after an hour'
});
exports.unsubscribeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours window
    max: 3, // limit each IP to 3 requests per windowMs
    message: 'Too many unsubscribe attempts from this IP, please try again after 24 hours'
});
