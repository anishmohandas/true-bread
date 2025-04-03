"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const email_service_1 = require("../services/email.service");
const emailService = new email_service_1.EmailService();
// Run on the 1st of every month at 9:00 AM
node_cron_1.default.schedule('0 9 1 * *', async () => {
    try {
        await emailService.sendMonthlyNewsletter();
        console.log('Monthly newsletter sent successfully');
    }
    catch (error) {
        console.error('Failed to send monthly newsletter:', error);
    }
});
